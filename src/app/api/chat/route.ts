import { NextResponse } from "next/server";
import { ChatRequestSchema } from "@/lib/chat/schema";
import { callChatModel } from "@/lib/chat/model";
import { toVerdictError } from "@/lib/verdict/errors";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/rate-limit";
import {
  assertGeminiKey,
  logErr,
  logModelCall,
  logOk,
  logRateLimit,
} from "@/lib/obs";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const t0 = Date.now();

  const configErr = assertGeminiKey();
  if (configErr) {
    logErr("config_err", configErr, { path: "/api/chat" });
    return NextResponse.json(
      { error: "server misconfigured. try again later." },
      { status: 503 },
    );
  }

  const clientKey = `chat:${clientKeyFromRequest(req)}`;
  const rate = checkRateLimit(clientKey);
  if (!rate.ok) {
    logRateLimit("/api/chat", clientKey);
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
      { error: "bad chat payload" },
      { status: 400 },
    );
  }

  const modelT0 = Date.now();
  try {
    const reply = await callChatModel(parsed.data);
    logModelCall("gemini:chat", Date.now() - modelT0, true);
    logOk("chat_ok", {
      ms: Date.now() - t0,
      turnCount: parsed.data.messages.length,
    });
    return NextResponse.json({ reply });
  } catch (err) {
    logModelCall("gemini:chat", Date.now() - modelT0, false);
    const ve = toVerdictError(err);
    logErr("chat_err", ve.code, { ms: Date.now() - t0, log: ve.logMessage });
    return NextResponse.json({ error: ve.userMessage }, { status: ve.status });
  }
}
