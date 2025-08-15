"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { UserProfile, ChangelogEntry } from "@/types";
import {
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BanknotesIcon,
  LinkIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/Card";
import { ProfileUpdateModal } from "@/components/ProfileUpdateModal";
import { ChangelogModal } from "@/components/ChangelogModal";

export default function ProfilePage(): JSX.Element {
  const { companyProfile, updateCompanyProfile } = useAccountingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [pinData, setPinData] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "1",
    userId: "user1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+91 98765 43210",
    avatar: "",
    role: "manager",
    department: "Finance",
    position: "Senior Manager",
    bio: "Experienced finance professional with expertise in accounting and financial management.",
    preferences: {
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      language: "en",
    },
    lastLogin: new Date(),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
  });

  // Mock changelog data
  const [changelog] = useState<ChangelogEntry[]>([
    {
      id: "1",
      version: "2.1.0",
      title: "Invoice Generator Complete",
      description:
        "Major update to the invoice generation system with enhanced features and improved user experience.",
      changes: [
        "Added professional invoice template matching exact design requirements",
        "Implemented working print functionality with 3 different options",
        "Added high-quality PDF generation using jsPDF and html2canvas",
        "Fixed all TypeScript errors and linter issues",
        "Added comprehensive form validation and user feedback",
        "Enhanced UI with loading states and success messages",
        "Improved print styles for professional output",
        "Added client selection and auto-population features",
      ],
      releaseDate: new Date("2024-01-15"),
      type: "feature",
      isPublished: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      version: "2.0.5",
      title: "Performance Improvements",
      description:
        "Various performance optimizations and bug fixes to improve system stability.",
      changes: [
        "Optimized database queries for faster data loading",
        "Fixed memory leaks in the dashboard components",
        "Improved error handling across the application",
        "Enhanced mobile responsiveness for better user experience",
      ],
      releaseDate: new Date("2024-01-10"),
      type: "improvement",
      isPublished: true,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "3",
      version: "2.0.0",
      title: "Major UI Overhaul",
      description:
        "Complete redesign of the user interface with modern design principles and improved usability.",
      changes: [
        "Redesigned entire application with modern UI/UX",
        "Added dark mode support",
        "Implemented responsive design for all screen sizes",
        "Added new dashboard with enhanced analytics",
        "Improved navigation and user flow",
      ],
      releaseDate: new Date("2024-01-01"),
      type: "feature",
      isPublished: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ]);

  const [formData, setFormData] = useState({
    name: companyProfile.name,
    legalName: companyProfile.legalName,
    email: companyProfile.email,
    phone: companyProfile.phone,
    website: companyProfile.website,
    address: companyProfile.address,
    city: companyProfile.city,
    state: companyProfile.state,
    pincode: companyProfile.pincode,
    country: companyProfile.country,
    gstNumber: companyProfile.gstNumber,
    panNumber: companyProfile.panNumber,
    cinNumber: companyProfile.cinNumber,
    logo: companyProfile.logo,
    description: companyProfile.description,
    foundedYear: companyProfile.foundedYear,
    industry: companyProfile.industry,
    companySize: companyProfile.companySize,
    annualRevenue: companyProfile.annualRevenue?.toString() ?? "",
    employeeCount: companyProfile.employeeCount?.toString() ?? "",
    bankDetails: {
      accountNumber: companyProfile.bankDetails.accountNumber,
      ifscCode: companyProfile.bankDetails.ifscCode,
      bankName: companyProfile.bankDetails.bankName,
      branch: companyProfile.bankDetails.branch,
    },
    contactPerson: {
      name: companyProfile.contactPerson.name,
      email: companyProfile.contactPerson.email,
      phone: companyProfile.contactPerson.phone,
      designation: companyProfile.contactPerson.designation,
    },
    socialMedia: {
      linkedin: companyProfile.socialMedia.linkedin ?? "",
      twitter: companyProfile.socialMedia.twitter ?? "",
      facebook: companyProfile.socialMedia.facebook ?? "",
      instagram: companyProfile.socialMedia.instagram ?? "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    try {
      // In a real app, this would be an API call
      setUserProfile(prev => ({
        ...prev,
        ...updatedProfile,
        updatedAt: new Date(),
      }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      throw error;
    }
  };

  const handleSubmit = useMemo(() => {
    return (e: React.FormEvent) => {
      e.preventDefault();

      const profileData = {
        ...formData,
        annualRevenue: formData.annualRevenue
          ? parseInt(formData.annualRevenue)
          : undefined,
        employeeCount: formData.employeeCount
          ? parseInt(formData.employeeCount)
          : undefined,
      };

      // Filter out undefined values to satisfy exactOptionalPropertyTypes
      const filteredProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([, value]) => value !== undefined)
      );

      updateCompanyProfile(filteredProfileData);
      setIsEditing(false);
      toast.success("Company profile updated successfully");
    };
  }, [formData, updateCompanyProfile]);

  const handlePinChange = useMemo(() => {
    return (e: React.FormEvent) => {
      e.preventDefault();

      if (pinData.newPin !== pinData.confirmPin) {
        toast.error("New PIN and confirm PIN do not match");
        return;
      }

      if (pinData.newPin.length !== 4) {
        toast.error("PIN must be exactly 4 digits");
        return;
      }

      try {
        // For web-based app, validate the current PIN and update
        const currentStoredPin = "1234"; // In production, this would be stored securely

        if (pinData.currentPin !== currentStoredPin) {
          toast.error("Current PIN is incorrect");
          return;
        }

        // In a real web app, you would send this to your backend
        // For now, we'll just show a success message
        toast.success("PIN changed successfully (demo mode)");
        setPinData({ currentPin: "", newPin: "", confirmPin: "" });
        setShowPinChange(false);
      } catch (error) {
        toast.error("Failed to change PIN");
        console.error("PIN change error:", error);
      }
    };
  }, [pinData]);

  const handleCancel = useMemo(() => {
    return () => {
      setFormData({
        name: companyProfile.name,
        legalName: companyProfile.legalName,
        email: companyProfile.email,
        phone: companyProfile.phone,
        website: companyProfile.website,
        address: companyProfile.address,
        city: companyProfile.city,
        state: companyProfile.state,
        pincode: companyProfile.pincode,
        country: companyProfile.country,
        gstNumber: companyProfile.gstNumber,
        panNumber: companyProfile.panNumber,
        cinNumber: companyProfile.cinNumber,
        logo: companyProfile.logo,
        description: companyProfile.description,
        foundedYear: companyProfile.foundedYear,
        industry: companyProfile.industry,
        companySize: companyProfile.companySize,
        annualRevenue: companyProfile.annualRevenue?.toString() ?? "",
        employeeCount: companyProfile.employeeCount?.toString() ?? "",
        bankDetails: {
          accountNumber: companyProfile.bankDetails.accountNumber,
          ifscCode: companyProfile.bankDetails.ifscCode,
          bankName: companyProfile.bankDetails.bankName,
          branch: companyProfile.bankDetails.branch,
        },
        contactPerson: {
          name: companyProfile.contactPerson.name,
          email: companyProfile.contactPerson.email,
          phone: companyProfile.contactPerson.phone,
          designation: companyProfile.contactPerson.designation,
        },
        socialMedia: {
          linkedin: companyProfile.socialMedia.linkedin ?? "",
          twitter: companyProfile.socialMedia.twitter ?? "",
          facebook: companyProfile.socialMedia.facebook ?? "",
          instagram: companyProfile.socialMedia.instagram ?? "",
        },
      });
      setIsEditing(false);
    };
  }, [companyProfile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Company Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your company information and settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChangelog(true)}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <BellIcon className="h-5 w-5" />
              <span>What&apos;s New</span>
            </button>
            <button
              onClick={() => setShowProfileUpdate(true)}
              className="bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <CogIcon className="h-5 w-5" />
              <span>Update Profile</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <UserIcon className="h-8 w-8 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </h3>
            <p className="text-gray-600">{userProfile.position}</p>
            <p className="text-sm text-gray-500">{userProfile.department}</p>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{userProfile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{userProfile.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-gray-900 capitalize">{userProfile.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <p className="text-gray-900 capitalize">
                  {userProfile.preferences.theme}
                </p>
              </div>
            </div>
            {userProfile.bio && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <p className="text-gray-900">{userProfile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* PIN Change Section */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <LockClosedIcon className="h-8 w-8 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Security Settings
          </h2>
        </div>

        {!showPinChange ? (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Change PIN
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update your application PIN for enhanced security
              </p>
            </div>
            <button
              onClick={() => setShowPinChange(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              Change PIN
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current PIN
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={pinData.currentPin}
                    onChange={e =>
                      setPinData({
                        ...pinData,
                        currentPin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="input pr-10"
                    placeholder="Enter current PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPin ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New PIN
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={pinData.newPin}
                    onChange={e =>
                      setPinData({
                        ...pinData,
                        newPin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="input pr-10"
                    placeholder="Enter new PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPin ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New PIN
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    required
                    maxLength={4}
                    value={pinData.confirmPin}
                    onChange={e =>
                      setPinData({
                        ...pinData,
                        confirmPin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="input pr-10"
                    placeholder="Confirm new PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPin ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Update PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPinChange(false);
                  setPinData({ currentPin: "", newPin: "", confirmPin: "" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.legalName}
                onChange={e =>
                  setFormData({ ...formData, legalName: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={e =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={e =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={e =>
                  setFormData({
                    ...formData,
                    companySize: e.target.value as
                      | "startup"
                      | "small"
                      | "medium"
                      | "large"
                      | "enterprise",
                  })
                }
                className="input"
                disabled={!isEditing}
              >
                <option value="startup">Startup</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                value={formData.foundedYear}
                onChange={e =>
                  setFormData({
                    ...formData,
                    foundedYear: parseInt(e.target.value),
                  })
                }
                className="input"
                disabled={!isEditing}
                min="1900"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Revenue (₹)
              </label>
              <input
                type="number"
                value={formData.annualRevenue}
                onChange={e =>
                  setFormData({ ...formData, annualRevenue: e.target.value })
                }
                className="input"
                disabled={!isEditing}
                placeholder="Annual revenue in INR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee Count
              </label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={e =>
                  setFormData({ ...formData, employeeCount: e.target.value })
                }
                className="input"
                disabled={!isEditing}
                placeholder="Number of employees"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input"
                rows={3}
                disabled={!isEditing}
                placeholder="Company description"
              />
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <MapPinIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Address Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={e =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={e =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={e =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Legal Information */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <BanknotesIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Legal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GST Number *
              </label>
              <input
                type="text"
                required
                value={formData.gstNumber}
                onChange={e =>
                  setFormData({ ...formData, gstNumber: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                required
                value={formData.panNumber}
                onChange={e =>
                  setFormData({ ...formData, panNumber: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CIN Number
              </label>
              <input
                type="text"
                value={formData.cinNumber}
                onChange={e =>
                  setFormData({ ...formData, cinNumber: e.target.value })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <BanknotesIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.bankName}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...formData.bankDetails,
                      bankName: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.accountNumber}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...formData.bankDetails,
                      accountNumber: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.ifscCode}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...formData.bankDetails,
                      ifscCode: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branch *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.branch}
                onChange={e =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...formData.bankDetails,
                      branch: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Contact Person */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <UserIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Person
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson.name}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contactPerson: {
                      ...formData.contactPerson,
                      name: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson.designation}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contactPerson: {
                      ...formData.contactPerson,
                      designation: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.contactPerson.email}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contactPerson: {
                      ...formData.contactPerson,
                      email: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPerson.phone}
                onChange={e =>
                  setFormData({
                    ...formData,
                    contactPerson: {
                      ...formData.contactPerson,
                      phone: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <LinkIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Social Media
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={e =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
                placeholder="LinkedIn profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialMedia.twitter}
                onChange={e =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
                placeholder="Twitter profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={e =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
                placeholder="Facebook page URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={e =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className="input"
                disabled={!isEditing}
                placeholder="Instagram profile URL"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        )}
      </form>

      {/* Company Overview */}
      {!isEditing && (
        <Card>
          <div className="flex items-center space-x-4 mb-6">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Company Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3">
                <CalendarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Founded</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyProfile.foundedYear}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-3">
                <UsersIcon className="h-6 w-6 text-success-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyProfile.employeeCount}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mx-auto mb-3">
                <CurrencyDollarIcon className="h-6 w-6 text-warning-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Annual Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {companyProfile.annualRevenue
                  ? formatCurrency(companyProfile.annualRevenue)
                  : "N/A"}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-lg mx-auto mb-3">
                <BuildingOfficeIcon className="h-6 w-6 text-info-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Company Size</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {companyProfile.companySize}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <ProfileUpdateModal
        isOpen={showProfileUpdate}
        onClose={() => setShowProfileUpdate(false)}
        profile={userProfile}
        onUpdate={handleProfileUpdate}
      />

      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        changelog={changelog}
      />
    </div>
  );
}
