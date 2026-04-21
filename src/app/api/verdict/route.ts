import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, PERSONA_MODEL } from "@/lib/anthropic";
import { BROKE_FRIEND_SYSTEM, buildUserContextPrompt } from "@/lib/prompts";
import type { UserContext, Verdict } from "@/lib/types";

const UserContextSchema = z
  .object({
    weeklyBudgetCents: z.number().int().nonnegative().optional(),
    savingGoals: z.array(z.string().min(1).max(120)).max(5).optional(),
    recentRegrets: z.array(z.string().min(1).max(120)).max(5).optional(),
  })
  .nullable()
  .optional();

const VerdictResponseSchema = z.object({
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

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const contextRaw = form.get("context");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "missing screenshot" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "file must be an image" },
        { status: 400 },
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "image must be under 8MB" },
        { status: 400 },
      );
    }

    let userContext: UserContext | null = null;
    if (typeof contextRaw === "string" && contextRaw.length > 0) {
      const parsed = UserContextSchema.safeParse(JSON.parse(contextRaw));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "bad context payload" },
          { status: 400 },
        );
      }
      userContext = parsed.data ?? null;
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif";

    const anthropic = getAnthropic();
    const userPrompt = `user context:\n${buildUserContextPrompt(userContext)}\n\nthe product they want to buy is in the attached screenshot. read it and give your verdict. output JSON only.`;

    const response = await anthropic.messages.create({
      model: PERSONA_MODEL,
      max_tokens: 1024,
      system: BROKE_FRIEND_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "model returned no text" },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      const cleaned = textBlock.text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/, "");
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "model returned invalid JSON", raw: textBlock.text },
        { status: 502 },
      );
    }

    const validated = VerdictResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "model response failed schema validation",
          issues: validated.error.issues,
        },
        { status: 502 },
      );
    }

    const { product, verdict, headline, reasons, roast } = validated.data;
    return NextResponse.json({
      product,
      verdict: {
        verdict: verdict as Verdict,
        headline,
        reasons,
        roast,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    const status = message.includes("ANTHROPIC_API_KEY") ? 500 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
