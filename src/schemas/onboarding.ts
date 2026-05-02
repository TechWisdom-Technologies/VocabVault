import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  dob: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date < new Date();
    },
    { message: "Please enter a valid date of birth" }
  ),
  age: z
    .number()
    .int()
    .min(13, "You must be at least 13 years old")
    .max(120, "Please enter a valid age"),
  nationality: z
    .string()
    .min(2, "Nationality is required")
    .max(100),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),
  profession: z
    .string()
    .min(2, "Profession is required")
    .max(100),
  reason: z
    .string()
    .min(1, "Please select your reason for using VocabVault"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const REASONS = [
  "IELTS Preparation",
  "General English Improvement",
  "Academic Vocabulary",
  "Professional Communication",
  "Other",
] as const;
