import { getSupabaseClient } from "@/lib/supabase";

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
  avatar?: string | null;
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
  static async signUp(signUpData: SignUpData): Promise<{ user: any; profile: any }> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await getSupabaseClient().auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user profile
        const { data: profileData, error: profileError } = await getSupabaseClient()
          .from("user_profiles")
          .insert([
            {
              user_id: authData.user.id,
              first_name: signUpData.first_name,
              last_name: signUpData.last_name,
              email: signUpData.email,
              phone: signUpData.phone,
              role: signUpData.role ?? "user",
              department: signUpData.department,
              position: signUpData.position,
            },
          ])
          .select()
          .single();

        if (profileError) {
          throw profileError;
        }

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

  // Sign in existing user
  static async signIn(signInData: SignInData): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        throw error;
      }

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
  static async signOut(): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Get current authenticated user
  static async getCurrentUser(): Promise<any> {
    try {
      const {
        data: { user },
        error,
      } = await getSupabaseClient().auth.getUser();
      if (error) {
        throw error;
      }
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      const { data, error } = await getSupabaseClient()
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting current user profile:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(profileData: UpdateProfileData): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await getSupabaseClient()
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Update last login timestamp
  private static async updateLastLogin(userId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from("user_profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw error for this as it's not critical
      return false;
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(password: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  // Get all users
  static async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  // Update user role (admin only)
  static async updateUserRole(
    userId: string,
    role: "admin" | "user" | "manager"
  ): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("user_profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Check if user is admin
  static async isAdmin(userId?: string): Promise<boolean> {
    try {
      const currentUserId = userId ?? (await this.getCurrentUser())?.id;
      if (!currentUserId) {
        return false;
      }

      const profile = await this.getUserById(currentUserId);
      return profile?.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Get current session
  static async getSession(): Promise<any> {
    try {
      const {
        data: { session },
        error,
      } = await getSupabaseClient().auth.getSession();
      if (error) {
        throw error;
      }
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  // Refresh session
  static async refreshSession(): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient().auth.refreshSession();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void): any {
    return getSupabaseClient().auth.onAuthStateChange(callback);
  }

  // Get user avatar URL
  static getAvatarUrl(avatarPath: string | null): string | null {
    if (!avatarPath) {
      return null;
    }

    const { data } = getSupabaseClient().storage.from("avatars").getPublicUrl(avatarPath);

    return data.publicUrl;
  }

  // Upload avatar
  static async uploadAvatar(file: File, userId: string): Promise<any> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await getSupabaseClient().storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Update user profile with new avatar path
      await this.updateProfile({ avatar: fileName });

      return data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  // Delete avatar
  static async deleteAvatar(avatarPath: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().storage
        .from("avatars")
        .remove([avatarPath]);

      if (error) {
        throw error;
      }

      // Update user profile to remove avatar
      await this.updateProfile({ avatar: null });

      return true;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }
}
