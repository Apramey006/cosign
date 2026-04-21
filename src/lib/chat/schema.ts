import { z } from "zod";
import { UserContextSchema, PastVerdictsSchema } from "@/lib/verdict/schema";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  product: z.object({
    name: z.string().min(1).max(200),
    priceCents: z.number().int().nonnegative(),
    source: z.string().max(80).optional(),
    description: z.string().max(400).optional(),
  }),
  verdict: z.object({
    verdict: z.enum(["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"]),
    headline: z.string().min(1).max(200),
    reasons: z.array(z.string().min(1).max(280)).min(1).max(5),
    roast: z.string().max(200).optional(),
  }),
  userContext: UserContextSchema,
  pastVerdicts: PastVerdictsSchema.optional().default([]),
  messages: z.array(ChatMessageSchema).min(1).max(30),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
