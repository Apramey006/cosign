import { z } from "zod";

export const UserContextSchema = z
  .object({
    weeklyBudgetCents: z.number().int().nonnegative().optional(),
    savingGoals: z.array(z.string().min(1).max(160)).max(6).optional(),
    recentRegrets: z.array(z.string().min(1).max(160)).max(6).optional(),
    spendingTraps: z.array(z.string().min(1).max(160)).max(6).optional(),
    lifeStage: z.string().max(200).optional(),
  })
  .nullable()
  .optional();

export const PastVerdictSchema = z.object({
  productName: z.string().min(1).max(200),
  priceCents: z.number().int().nonnegative(),
  verdict: z.enum(["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"]),
  headline: z.string().min(1).max(200),
  daysAgo: z.number().int().nonnegative(),
  purchased: z.boolean().optional(),
  stillGlad: z.boolean().nullable().optional(),
});
export type PastVerdict = z.infer<typeof PastVerdictSchema>;

export const PastVerdictsSchema = z.array(PastVerdictSchema).max(10);

export const VerdictResponseSchema = z.object({
  product: z.object({
    name: z.string().min(1).max(200),
    priceCents: z.number().int().nonnegative(),
    source: z.string().max(80).optional(),
    description: z.string().max(400).optional(),
  }),
  verdict: z.enum(["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"]),
  headline: z.string().min(1).max(200),
  reasons: z.array(z.string().min(1).max(280)).min(2).max(5),
  roast: z.string().max(200).optional(),
});
export type VerdictResponse = z.infer<typeof VerdictResponseSchema>;

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function isAllowedImageType(t: string): t is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(t);
}

// Capped to 4MB so we stay under Vercel's ~4.5MB serverless body limit.
// (The old 8MB cap produced raw FUNCTION_PAYLOAD_TOO_LARGE errors on the client
// because Vercel rejected the request before it reached our handler.)
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
