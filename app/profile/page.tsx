"use client";

import React, { useState, useCallback } from "react";
import { useAccountingStore } from "@/store";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  BanknotesIcon,
  UserIcon,
  LinkIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/Card";

export default function ProfilePage() {
  const { companyProfile, updateCompanyProfile } = useAccountingStore();
  const [isEditing, setIsEditing] = useState(false);
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
    annualRevenue: companyProfile.annualRevenue?.toString() || "",
    employeeCount: companyProfile.employeeCount?.toString() || "",
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
      linkedin: companyProfile.socialMedia.linkedin || "",
      twitter: companyProfile.socialMedia.twitter || "",
      facebook: companyProfile.socialMedia.facebook || "",
      instagram: companyProfile.socialMedia.instagram || "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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

      updateCompanyProfile(profileData);
      setIsEditing(false);
      toast.success("Company profile updated successfully");
    },
    [formData, updateCompanyProfile]
  );

  const handleCancel = useCallback(() => {
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
      annualRevenue: companyProfile.annualRevenue?.toString() || "",
      employeeCount: companyProfile.employeeCount?.toString() || "",
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
        linkedin: companyProfile.socialMedia.linkedin || "",
        twitter: companyProfile.socialMedia.twitter || "",
        facebook: companyProfile.socialMedia.facebook || "",
        instagram: companyProfile.socialMedia.instagram || "",
      },
    });
    setIsEditing(false);
  }, [companyProfile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your company information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
                onChange={(e) =>
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
    </div>
  );
}
