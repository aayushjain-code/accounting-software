import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: "admin" | "user" | "manager";
  department?: string;
  position?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
  bio?: string;
  preferences?: {
    theme?: "light" | "dark" | "auto";
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    language?: "en" | "hi" | "es";
  };
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  password: string;
}

export class AuthService {
  // Sign up new user
  static async signUp(signUpData: SignUpData) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .insert([
            {
              user_id: authData.user.id,
              first_name: signUpData.first_name,
              last_name: signUpData.last_name,
              email: signUpData.email,
              phone: signUpData.phone,
              role: signUpData.role || "user",
              department: signUpData.department,
              position: signUpData.position,
            },
          ])
          .select()
          .single();

        if (profileError) throw profileError;

        return {
          user: authData.user,
          profile: profileData,
        };
      }

      throw new Error("User creation failed");
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  // Sign in user
  static async signIn(signInData: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Update last login
        await this.updateLastLogin(data.user.id);
      }

      return data;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting current user profile:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData: UpdateProfileData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Update last login
  static async updateLastLogin(userId: string) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw error for this as it's not critical
      return false;
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  // Update user role (admin only)
  static async updateUserRole(
    userId: string,
    role: "admin" | "user" | "manager"
  ) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Check if user is admin
  static async isAdmin(userId?: string) {
    try {
      const currentUserId = userId || (await this.getCurrentUser())?.id;
      if (!currentUserId) return false;

      const profile = await this.getUserById(currentUserId);
      return profile?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Get session
  static async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  // Refresh session
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Get user avatar URL
  static getAvatarUrl(avatarPath: string | null) {
    if (!avatarPath) return null;

    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);

    return data.publicUrl;
  }

  // Upload avatar
  static async uploadAvatar(file: File, userId: string) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Update user profile with new avatar path
      await this.updateProfile({ avatar: fileName });

      return data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  // Delete avatar
  static async deleteAvatar(avatarPath: string) {
    try {
      const { error } = await supabase.storage
        .from("avatars")
        .remove([avatarPath]);

      if (error) throw error;

      // Update user profile to remove avatar
      await this.updateProfile({ avatar: null });

      return true;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }
}
