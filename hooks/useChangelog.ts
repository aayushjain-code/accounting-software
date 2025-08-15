import { useState, useEffect } from "react";
import { ChangelogEntry } from "@/types";

export const useChangelog = () => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    const mockChangelog: ChangelogEntry[] = [
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
      {
        id: "4",
        version: "1.9.0",
        title: "Profile Management System",
        description:
          "Added comprehensive profile management features for both company and user profiles.",
        changes: [
          "Added user profile update functionality",
          "Implemented company profile management",
          "Added security settings with PIN change",
          "Created changelog system to track updates",
          "Enhanced user preferences and settings",
        ],
        releaseDate: new Date("2024-01-20"),
        type: "feature",
        isPublished: true,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
    ];

    setChangelog(mockChangelog);
    setIsLoading(false);
  }, []);

  const addChangelogEntry = (
    entry: Omit<ChangelogEntry, "id" | "createdAt" | "updatedAt">
  ) => {
    const newEntry: ChangelogEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChangelog(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateChangelogEntry = (
    id: string,
    updates: Partial<ChangelogEntry>
  ) => {
    setChangelog(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  };

  const deleteChangelogEntry = (id: string) => {
    setChangelog(prev => prev.filter(entry => entry.id !== id));
  };

  const getPublishedChangelog = () => {
    return changelog.filter(entry => entry.isPublished);
  };

  const getChangelogByType = (type: ChangelogEntry["type"]) => {
    return changelog.filter(entry => entry.type === type);
  };

  const getLatestVersion = () => {
    return changelog.length > 0 ? changelog[0] : null;
  };

  return {
    changelog,
    isLoading,
    addChangelogEntry,
    updateChangelogEntry,
    deleteChangelogEntry,
    getPublishedChangelog,
    getChangelogByType,
    getLatestVersion,
  };
};
