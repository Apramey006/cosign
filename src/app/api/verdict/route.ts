import { NextResponse } from "next/server";
import type { Verdict } from "@/lib/types";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  PastVerdictsSchema,
  UserContextSchema,
  isAllowedImageType,
  type PastVerdict,
} from "@/lib/verdict/schema";
import { callVerdictModel, ModelError } from "@/lib/verdict/model";
import { toVerdictError } from "@/lib/verdict/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("image");
  const contextRaw = form.get("context");
  const pastRaw = form.get("pastVerdicts");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "missing screenshot" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      {
        error: `image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      },
      { status: 415 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image must be under 8MB" }, { status: 413 });
  }

  let userContext = null;
  if (typeof contextRaw === "string" && contextRaw.length > 0) {
    try {
      const parsed = UserContextSchema.safeParse(JSON.parse(contextRaw));
      if (!parsed.success) {
        return NextResponse.json({ error: "bad context payload" }, { status: 400 });
      }
      userContext = parsed.data ?? null;
    } catch {
      return NextResponse.json({ error: "bad context payload" }, { status: 400 });
    }
  }

  let pastVerdicts: PastVerdict[] = [];
  if (typeof pastRaw === "string" && pastRaw.length > 0) {
    try {
      const parsed = PastVerdictsSchema.safeParse(JSON.parse(pastRaw));
      if (!parsed.success) {
        return NextResponse.json({ error: "bad pastVerdicts payload" }, { status: 400 });
      }
      pastVerdicts = parsed.data;
    } catch {
      return NextResponse.json({ error: "bad pastVerdicts payload" }, { status: 400 });
    }
  }

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await callVerdictModel({
      base64Image: base64,
      mediaType: file.type,
      userContext,
      pastVerdicts,
    });

    const { product, verdict, headline, reasons, roast } = result;
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
    if (err instanceof ModelError) {
      const status = err.code === "NO_TEXT" ? 502 : 502;
      return NextResponse.json(
        { error: "the model returned something weird. try again." },
        { status },
      );
    }
    const ve = toVerdictError(err);
    console.error(`[verdict] ${ve.code}: ${ve.logMessage}`);
    return NextResponse.json({ error: ve.userMessage }, { status: ve.status });
  }
}
