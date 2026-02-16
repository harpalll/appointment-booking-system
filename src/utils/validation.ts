import { z } from "zod";
import { ServiceType } from "../../generated/prisma/enums";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["USER", "SERVICE_PROVIDER"]),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(ServiceType),
  durationMinutes: z
    .number()
    .refine((data) => [30, 60, 90, 120].includes(data), {
      error: "Invalid duration",
    }),
});

export const setAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format, expected 'HH:MM' in 24-hour time (e.g., 09:00)",
    ),
  endTime: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format, expected 'HH:MM' in 24-hour time (e.g., 09:00)",
    ),
});

export const bookAppointmentSchema = z.object({
  slotId: z.string(),
});
