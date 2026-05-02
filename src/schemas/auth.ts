import { z } from "zod";

// ─── Login Schema ────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Sign Up Schema ──────────────────────────────────────

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must include uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// ─── Session Schema ──────────────────────────────────────

export const createSessionSchema = z.object({
  firebaseToken: z.string().min(1, "Firebase token is required"),
  deviceInfo: z.object({
    deviceName: z.string().min(1).max(100),
    deviceType: z.enum(["browser", "mobile", "desktop"]),
    os: z.string().min(1).max(50),
    ipAddress: z.string().min(1),
    locationCity: z.string().optional(),
    locationCountry: z.string().optional(),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
