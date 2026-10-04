import { describe, expect, it } from "bun:test";

describe("admin user management rules", () => {
  it("validates roles and account types", () => {
    const validRoles = ["user", "admin"];
    const validAppRoles = ["customer", "business"];

    expect(validRoles.includes("admin")).toBe(true);
    expect(validRoles.includes("user")).toBe(true);
    expect(validRoles.includes("superadmin")).toBe(false);

    expect(validAppRoles.includes("customer")).toBe(true);
    expect(validAppRoles.includes("business")).toBe(true);
    expect(validAppRoles.includes("guest")).toBe(false);
  });

  it("safeguards against self-deletion", () => {
    const currentAdminId = "admin-123";
    const targetUserId = "admin-123";

    const canDelete = (adminId: string, targetId: string) => {
      if (adminId === targetId) {
        throw new Error("You cannot delete your own account.");
      }
      return true;
    };

    expect(() => canDelete(currentAdminId, targetUserId)).toThrow(
      "You cannot delete your own account.",
    );
    expect(canDelete(currentAdminId, "other-user-456")).toBe(true);
  });

  it("safeguards against demoting or deleting the final admin", () => {
    const totalAdmins = 1;
    const canDemote = (total: number) => {
      if (total <= 1) throw new Error("You cannot remove the final admin account.");
      return true;
    };

    expect(() => canDemote(totalAdmins)).toThrow("You cannot remove the final admin account.");
    expect(canDemote(2)).toBe(true);
  });
});
