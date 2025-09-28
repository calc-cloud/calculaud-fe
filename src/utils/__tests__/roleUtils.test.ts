import { User } from "oidc-client-ts";
import { describe, it, expect, beforeEach } from "vitest";

import { hasAdminRole, hasUserRole, hasAnyRole, hasRequiredRole, getUserRoles } from "../roleUtils";

const createMockUser = (profile: any): User => ({
  access_token: "mock-token",
  profile,
  id_token: "mock-id-token",
  session_state: "mock-session",
  token_type: "Bearer",
  scope: "openid",
  expires_at: Date.now() + 3600000,
  state: undefined,
});

describe("roleUtils", () => {
  beforeEach(() => {
    // Reset environment variables to defaults
    import.meta.env.VITE_ADMIN_ROLE = "calAdmins";
    import.meta.env.VITE_USER_ROLE = "calUsers";
    import.meta.env.VITE_ROLE_CLAIM_PATH = "role";
  });

  describe("hasAdminRole", () => {
    it("returns true when user has admin role", () => {
      const user = createMockUser({ role: "calAdmins" });
      expect(hasAdminRole(user)).toBe(true);
    });

    it("returns false when user has different role", () => {
      const user = createMockUser({ role: "calUsers" });
      expect(hasAdminRole(user)).toBe(false);
    });

    it("returns true when user has admin role in array", () => {
      const user = createMockUser({ role: ["calUsers", "calAdmins"] });
      expect(hasAdminRole(user)).toBe(true);
    });

    it("returns false when user has no roles", () => {
      const user = createMockUser({ role: null });
      expect(hasAdminRole(user)).toBe(false);
    });

    it("returns false when user is null", () => {
      expect(hasAdminRole(null)).toBe(false);
    });

    it("returns false when user is undefined", () => {
      expect(hasAdminRole(undefined)).toBe(false);
    });

    it("returns false when user has no profile", () => {
      const user = createMockUser(null);
      user.profile = null;
      expect(hasAdminRole(user)).toBe(false);
    });

    it("uses custom admin role from environment", () => {
      const originalAdminRole = import.meta.env.VITE_ADMIN_ROLE;
      import.meta.env.VITE_ADMIN_ROLE = "customAdmins";
      const user = createMockUser({ role: "customAdmins" });
      expect(hasAdminRole(user)).toBe(true);
      import.meta.env.VITE_ADMIN_ROLE = originalAdminRole;
    });

    it("uses custom role claim path", () => {
      const originalClaimPath = import.meta.env.VITE_ROLE_CLAIM_PATH;
      import.meta.env.VITE_ROLE_CLAIM_PATH = "customRoles";
      const user = createMockUser({ customRoles: "calAdmins" });
      expect(hasAdminRole(user)).toBe(true);
      import.meta.env.VITE_ROLE_CLAIM_PATH = originalClaimPath;
    });
  });

  describe("hasUserRole", () => {
    it("returns true when user has user role", () => {
      const user = createMockUser({ role: "calUsers" });
      expect(hasUserRole(user)).toBe(true);
    });

    it("returns false when user has different role", () => {
      const user = createMockUser({ role: "calAdmins" });
      expect(hasUserRole(user)).toBe(false);
    });

    it("returns true when user has user role in array", () => {
      const user = createMockUser({ role: ["calAdmins", "calUsers"] });
      expect(hasUserRole(user)).toBe(true);
    });

    it("returns false when user is null", () => {
      expect(hasUserRole(null)).toBe(false);
    });

    it("uses custom user role from environment", () => {
      const originalUserRole = import.meta.env.VITE_USER_ROLE;
      import.meta.env.VITE_USER_ROLE = "customUsers";
      const user = createMockUser({ role: "customUsers" });
      expect(hasUserRole(user)).toBe(true);
      import.meta.env.VITE_USER_ROLE = originalUserRole;
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when user has admin role", () => {
      const user = createMockUser({ role: "calAdmins" });
      expect(hasAnyRole(user)).toBe(true);
    });

    it("returns true when user has user role", () => {
      const user = createMockUser({ role: "calUsers" });
      expect(hasAnyRole(user)).toBe(true);
    });

    it("returns true when user has both roles", () => {
      const user = createMockUser({ role: ["calAdmins", "calUsers"] });
      expect(hasAnyRole(user)).toBe(true);
    });

    it("returns false when user has no valid roles", () => {
      const user = createMockUser({ role: "invalidRole" });
      expect(hasAnyRole(user)).toBe(false);
    });

    it("returns false when user is null", () => {
      expect(hasAnyRole(null)).toBe(false);
    });
  });

  describe("hasRequiredRole", () => {
    it("returns true when user has admin role", () => {
      const user = createMockUser({ role: "calAdmins" });
      expect(hasRequiredRole(user)).toBe(true);
    });

    it("returns true when user has user role", () => {
      const user = createMockUser({ role: "calUsers" });
      expect(hasRequiredRole(user)).toBe(true);
    });

    it("returns false when user has no valid roles", () => {
      const user = createMockUser({ role: "invalidRole" });
      expect(hasRequiredRole(user)).toBe(false);
    });

    it("returns false when user is null", () => {
      expect(hasRequiredRole(null)).toBe(false);
    });
  });

  describe("getUserRoles", () => {
    it("returns array with single role when role is string", () => {
      const user = createMockUser({ role: "calAdmins" });
      expect(getUserRoles(user)).toEqual(["calAdmins"]);
    });

    it("returns array when role is already array", () => {
      const user = createMockUser({ role: ["calAdmins", "calUsers"] });
      expect(getUserRoles(user)).toEqual(["calAdmins", "calUsers"]);
    });

    it("returns empty array when role is null", () => {
      const user = createMockUser({ role: null });
      expect(getUserRoles(user)).toEqual([]);
    });

    it("returns empty array when user is null", () => {
      expect(getUserRoles(null)).toEqual([]);
    });

    it("returns empty array when user has no profile", () => {
      const user = createMockUser(null);
      user.profile = null;
      expect(getUserRoles(user)).toEqual([]);
    });

    it("uses custom role claim path", () => {
      const originalClaimPath = import.meta.env.VITE_ROLE_CLAIM_PATH;
      import.meta.env.VITE_ROLE_CLAIM_PATH = "customRoles";
      const user = createMockUser({ customRoles: ["role1", "role2"] });
      expect(getUserRoles(user)).toEqual(["role1", "role2"]);
      import.meta.env.VITE_ROLE_CLAIM_PATH = originalClaimPath;
    });
  });

  describe("error handling", () => {
    it("handles malformed profile gracefully", () => {
      const user = createMockUser({});
      expect(hasAdminRole(user)).toBe(false);
      expect(hasUserRole(user)).toBe(false);
      expect(hasAnyRole(user)).toBe(false);
      expect(getUserRoles(user)).toEqual([]);
    });

    it("handles non-string, non-array role values", () => {
      const user = createMockUser({ role: 123 });
      expect(hasAdminRole(user)).toBe(false);
      expect(hasUserRole(user)).toBe(false);
      expect(getUserRoles(user)).toEqual([]);
    });

    it("handles empty string role", () => {
      const user = createMockUser({ role: "" });
      expect(hasAdminRole(user)).toBe(false);
      expect(hasUserRole(user)).toBe(false);
      expect(getUserRoles(user)).toEqual([]); // Empty string is converted to null by getRoleFromClaims
    });

    it("handles empty array role", () => {
      const user = createMockUser({ role: [] });
      expect(hasAdminRole(user)).toBe(false);
      expect(hasUserRole(user)).toBe(false);
      expect(getUserRoles(user)).toEqual([]);
    });
  });
});
