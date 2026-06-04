import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpUser = createServerFn({ method: "POST" })
  .inputValidator(
    credentialsSchema.extend({
      name: z.string().min(2),
    }),
  )
  .handler(async ({ data }) => {
    const { createAccount } = await import("./auth.server");
    return createAccount(data);
  });

export const signInUser = createServerFn({ method: "POST" })
  .inputValidator(credentialsSchema)
  .handler(async ({ data }) => {
    const { signIn } = await import("./auth.server");
    return signIn(data);
  });

export const signOutUser = createServerFn({ method: "POST" }).handler(async () => {
  const { signOut } = await import("./auth.server");
  await signOut();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./auth.server");
  return currentUser();
});

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { requestPasswordReset } = await import("./auth.server");
    return requestPasswordReset(data.email);
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const { resetPassword } = await import("./auth.server");
    return resetPassword(data.token, data.password);
  });

export const getAdminUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { listUsersForAdmin } = await import("./auth.server");
  return listUsersForAdmin();
});

export const updateAdminUserRole = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["user", "admin"]),
    }),
  )
  .handler(async ({ data }) => {
    const { updateUserRoleForAdmin } = await import("./auth.server");
    return updateUserRoleForAdmin(data);
  });
