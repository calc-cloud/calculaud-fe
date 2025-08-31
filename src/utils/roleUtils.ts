import { User } from "oidc-client-ts";

export const hasRequiredRole = (user: User | null | undefined): boolean => {
  if (!user?.profile) {
    return false;
  }

  const requiredRole = import.meta.env.VITE_REQUIRED_ROLE || "calculaudAdmin";
  const claimPath = import.meta.env.VITE_ROLE_CLAIM_PATH || "role";

  try {
    // Get the role value from the JWT claims using the configurable claim path
    const roleValue = getRoleFromClaims(user.profile, claimPath);

    if (!roleValue) {
      return false;
    }

    // Handle different role formats
    if (Array.isArray(roleValue)) {
      // Multiple roles as array
      return roleValue.includes(requiredRole);
    } else if (typeof roleValue === "string") {
      // Single role as string
      return roleValue === requiredRole;
    }

    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking user role:", error);
    return false;
  }
};

const getRoleFromClaims = (profile: any, claimPath: string): string | string[] | null => {
  if (!profile || !claimPath) {
    return null;
  }

  // Direct property access using the configured claim path
  return profile[claimPath] || null;
};

export const getUserRoles = (user: User | null | undefined): string[] => {
  if (!user?.profile) {
    return [];
  }

  const claimPath = import.meta.env.VITE_ROLE_CLAIM_PATH || "role";
  const roleValue = getRoleFromClaims(user.profile, claimPath);

  if (Array.isArray(roleValue)) {
    return roleValue;
  } else if (typeof roleValue === "string") {
    return [roleValue];
  }

  return [];
};
