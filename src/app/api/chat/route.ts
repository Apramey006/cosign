import { NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/chat/schema";
import { callChatModel } from "@/lib/chat/model";
import { toVerdictError } from "@/lib/verdict/errors";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const rate = checkRateLimit(`chat:${clientKeyFromRequest(req)}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "slow down, armaan needs a sec." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec ?? 60) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad chat payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const reply = await callChatModel(parsed.data);
    return NextResponse.json({ reply });
  } catch (err) {
    const ve = toVerdictError(err);
    console.error(`[chat] ${ve.code}: ${ve.logMessage}`);
    return NextResponse.json({ error: ve.userMessage }, { status: ve.status });
  }
}
