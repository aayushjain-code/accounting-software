"use client";

import React from "react";
import { UpdateNotification } from "./UpdateNotification";
import { useChangelog } from "@/hooks/useChangelog";

export const UpdateNotificationWrapper: React.FC = () => {
  const { changelog } = useChangelog();

  return <UpdateNotification changelog={changelog} />;
};
