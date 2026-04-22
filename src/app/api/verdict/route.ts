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
import { callVerdictModel } from "@/lib/verdict/model";
import { toVerdictError } from "@/lib/verdict/errors";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import { z } from "zod";
import {
  assertGeminiKey,
  logErr,
  logModelCall,
  logOk,
  logRateLimit,
} from "@/lib/obs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const t0 = Date.now();

  // Fail fast on misconfig with a distinct error code (not "UNKNOWN").
  const configErr = assertGeminiKey();
  if (configErr) {
    logErr("config_err", configErr, { path: "/api/verdict" });
    return NextResponse.json(
      { error: "server misconfigured. try again later." },
      { status: 503 },
    );
  }

  const clientKey = clientKeyFromRequest(req);
  const rate = checkRateLimit(clientKey);
  if (!rate.ok) {
    logRateLimit("/api/verdict", clientKey);
    return NextResponse.json(
      { error: "too many verdicts right now. give it a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSec ?? 60),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  const form = await req.formData();
  const file = form.get("image");
  const contextRaw = form.get("context");
  const pastRaw = form.get("pastVerdicts");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "missing screenshot" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: `image must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
      { status: 415 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "image too big — keep it under 4mb" },
      { status: 413 },
    );
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

  // Optional pre-summarized tab stats from the client (derived via lib/profile-stats).
  const tabSummaryRaw = form.get("tabSummary");
  let tabSummaryText: string | undefined;
  if (typeof tabSummaryRaw === "string" && tabSummaryRaw.length > 0 && tabSummaryRaw.length < 2000) {
    const parsed = z.string().max(2000).safeParse(tabSummaryRaw);
    if (parsed.success) tabSummaryText = parsed.data;
  }

  const modelT0 = Date.now();
  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await callVerdictModel({
      base64Image: base64,
      mediaType: file.type,
      userContext,
      pastVerdicts,
      tabSummary: tabSummaryText ? { summaryText: tabSummaryText } : undefined,
    });
    logModelCall("gemini:verdict", Date.now() - modelT0, true);

    const { product, verdict, headline, reasons, roast } = result;
    logOk("verdict_ok", {
      ms: Date.now() - t0,
      verdict,
      hasCtx: Boolean(userContext),
      pastCount: pastVerdicts.length,
    });
    return NextResponse.json(
      {
        product,
        verdict: {
          verdict: verdict as Verdict,
          headline,
          reasons,
          roast,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rate.remaining),
          "X-RateLimit-Reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  } catch (err) {
    logModelCall("gemini:verdict", Date.now() - modelT0, false);
    const ve = toVerdictError(err);
    logErr("verdict_err", ve.code, {
      ms: Date.now() - t0,
      log: ve.logMessage,
    });
    return NextResponse.json({ error: ve.userMessage }, { status: ve.status });
  }
}
