// src/components/auth/user-creation.tsx
'use client';

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export function UserCreation() {
  const { user, isLoaded } = useUser();
  
  // Debug: Log the api object to see what's available
  console.log("API:", api);
  
  // Temporarily use any to see if the function works
  const storeUser = useMutation("store" as any);

  useEffect(() => {
    if (!isLoaded || !user) return;

    console.log("Attempting to store user:", user);
    try {
      storeUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.firstName || "Unknown",
      });
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }, [isLoaded, user, storeUser]);

  return null;
}
