"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat/schema";
import type { Product, UserContext, VerdictResult } from "@/lib/types";
import type { PastVerdict } from "@/lib/verdict/schema";

interface ChatThreadProps {
  product: Product;
  verdict: VerdictResult;
  userContext: UserContext | null;
  pastVerdicts: PastVerdict[];
  tabEntryId?: string;
  onAssistantReply?: (message: string) => void;
}

const STARTER_PROMPTS = [
  "but i actually need this for...",
  "what if i wait a month?",
  "cheaper alternatives?",
  "why were you so harsh?",
];

export function ChatThread({
  product,
  verdict,
  userContext,
  pastVerdicts,
  onAssistantReply,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product,
          verdict,
          userContext,
          pastVerdicts,
          messages: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "something broke. try again.");
        return;
      }
      const reply: string = data.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      onAssistantReply?.(reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "network error");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const hasThread = messages.length > 0 || sending;

  return (
    <section className="bg-paper-tint border border-ink/20 px-5 md:px-8 py-6 md:py-8 shadow-[2px_4px_0_rgba(28,25,23,0.12)]">
      <div className="flex items-center justify-between mb-5">
        <p className="font-receipt text-xs text-stamp-red uppercase tracking-widest">
          talk to armaan about this
        </p>
        {hasThread && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="font-receipt text-xs text-ink-muted uppercase tracking-widest hover:text-ink focus:outline-none focus-visible:text-ink transition-colors"
          >
            clear
          </button>
        )}
      </div>

      {!hasThread && (
        <div className="mb-5">
          <p className="text-ink-muted font-receipt text-sm mb-3">
            push back, argue, ask for alternatives. he&apos;ll update his take
            if you give him a real reason.
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void send(p)}
                className="font-receipt text-xs px-3 py-1.5 border border-ink/30 text-ink-muted hover:border-ink hover:text-ink focus:outline-none focus-visible:border-ink transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasThread && (
        <ul className="space-y-3 mb-5">
          {messages.map((m, i) => (
            <li
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 font-receipt text-sm md:text-base leading-snug ${
                  m.role === "user"
                    ? "bg-ink text-paper"
                    : "bg-paper border border-ink/20 text-ink"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="text-[10px] uppercase tracking-widest text-stamp-red mb-1">
                    armaan
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </li>
          ))}
          {sending && (
            <li className="flex justify-start">
              <div className="bg-paper border border-ink/20 px-4 py-3 font-receipt text-sm text-ink-muted">
                <span className="inline-block w-2 h-4 bg-ink align-middle animate-pulse" />{" "}
                thinking...
              </div>
            </li>
          )}
          <div ref={threadRef} />
        </ul>
      )}

      {error && (
        <p role="alert" className="mb-3 font-receipt text-sm text-stamp-red">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="argue your case..."
          maxLength={1000}
          disabled={sending}
          className="flex-1 bg-paper border-2 border-ink/20 focus:border-ink focus:outline-none px-4 py-3 text-ink font-receipt disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="font-receipt uppercase tracking-wider font-bold bg-ink text-paper px-5 py-3 hover:bg-stamp-red focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper transition-colors disabled:opacity-40 disabled:hover:bg-ink"
        >
          send
        </button>
      </form>
    </section>
  );
}
