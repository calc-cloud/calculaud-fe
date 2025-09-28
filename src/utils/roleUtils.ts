import { User } from "oidc-client-ts";

const hasSpecificRole = (user: User | null | undefined, roleToCheck: string): boolean => {
  if (!user?.profile) {
    return false;
  }

  const claimPath = import.meta.env.VITE_ROLE_CLAIM_PATH || "role";

  try {
    const roleValue = getRoleFromClaims(user.profile, claimPath);

    if (!roleValue) {
      return false;
    }

    if (Array.isArray(roleValue)) {
      return roleValue.includes(roleToCheck);
    } else if (typeof roleValue === "string") {
      return roleValue === roleToCheck;
    }

    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error checking role '${roleToCheck}':`, error);
    return false;
  }
};

export const hasAdminRole = (user: User | null | undefined): boolean => {
  const adminRole = import.meta.env.VITE_ADMIN_ROLE || "calAdmins";
  return hasSpecificRole(user, adminRole);
};

export const hasUserRole = (user: User | null | undefined): boolean => {
  const userRole = import.meta.env.VITE_USER_ROLE || "calUsers";
  return hasSpecificRole(user, userRole);
};

export const hasAnyRole = (user: User | null | undefined): boolean => {
  return hasAdminRole(user) || hasUserRole(user);
};

export const hasRequiredRole = (user: User | null | undefined): boolean => {
  // Backward compatibility function - now checks for any valid role
  return hasAnyRole(user);
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
