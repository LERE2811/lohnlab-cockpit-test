"use server";
import { createClient } from "./supabase/server";
import { UserProfile, type Role } from "@/shared/model";
import { supabase } from "./supabase/client";

export interface Permission {
  id: string;
  role_id: string;
  feature: string;
  can_access: boolean;
  role?: Role;
}

/**
 * Server-side permission check
 * This should only be called from server components or API routes
 */
export async function checkPermission(feature: string): Promise<boolean> {
  const supabase = await createClient();
  var profileData: UserProfile | null = null;

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (authData.user) {
    // Fetch the user profile
    var { data, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) throw profileError;
    profileData = data;
  }

  if (!profileData) {
    console.error("User profile not found");
    return false;
  }

  // get role
  var { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("name", profileData.role)
    .single();

  if (roleError) throw roleError;

  // check permission
  const { data: permission, error } = await supabase
    .from("permissions")
    .select("can_access")
    .match({
      feature: feature,
      role_id: roleData.id, // Assuming role is stored in user metadata
    })
    .single();

  if (error || !permission) {
    console.error("Permission check failed:", error);
    return false;
  }

  return permission.can_access;
}

/**
 * Use this in API routes to protect endpoints
 */
export async function requirePermission(feature: string) {
  const hasPermission = await checkPermission(feature);

  if (!hasPermission) {
    throw new Error(`Unauthorized: Missing permission for ${feature}`);
  }
}

/**
 * Client-side permission check
 * Use this in client components
 */
export async function checkClientPermission(feature: string): Promise<boolean> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!authData.user) return false;

    // Fetch the user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!profileData) return false;

    // get role
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("*")
      .eq("name", profileData.role)
      .single();

    if (roleError) throw roleError;

    // check permission
    const { data: permission, error } = await supabase
      .from("permissions")
      .select("can_access")
      .match({
        feature: feature,
        role_id: roleData.id,
      })
      .single();

    if (error || !permission) return false;

    return permission.can_access;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}
