"use client";

import React from "react";
import ProfileComponent from "@/components/common/ProfileComponent";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { userData } = useAuth();
  return <ProfileComponent userData={userData} />;
}
