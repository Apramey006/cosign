/**
 * Eval runner — text-mode.
 *
 * For each scenario: call Gemini with the current ARMAAN_SYSTEM prompt +
 * a text description of the product (instead of a screenshot). This isolates
 * the reasoning/voice from the vision layer so prompt tuning is fast and
 * reproducible.
 *
 * Then call an LLM judge (same model) to score each verdict on 5 dimensions.
 *
 * Run:
 *   GEMINI_API_KEY=... pnpm exec tsx evals/run.ts
 */

import { GoogleGenAI, Type } from "@google/genai";
import {
  ARMAAN_SYSTEM,
  buildUserContextPrompt,
  buildPastVerdictsPrompt,
} from "../src/lib/prompts";
import { VerdictResponseSchema, type VerdictResponse } from "../src/lib/verdict/schema";
import { SCENARIOS, type Scenario } from "./scenarios";

const MODEL = "gemini-2.5-flash-lite";

function requireKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return key;
}

const VERDICT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    product: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        priceCents: { type: Type.INTEGER },
        source: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "priceCents"],
    },
    verdict: { type: Type.STRING, enum: ["COSIGNED", "NOT_COSIGNED", "SLEEP_ON_IT"] },
    headline: { type: Type.STRING },
    reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
    roast: { type: Type.STRING },
  },
  required: ["product", "verdict", "headline", "reasons"],
};

async function runVerdict(scenario: Scenario): Promise<VerdictResponse> {
  const ai = new GoogleGenAI({ apiKey: requireKey() });

  const userPrompt = [
    buildUserContextPrompt(scenario.context ?? null),
    buildPastVerdictsPrompt(scenario.pastVerdicts ?? []),
    `the product they want to buy — you're reading a product listing, described here:
<product_listing>
${scenario.productDescription}
</product_listing>
give your verdict. output JSON only.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: ARMAAN_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: VERDICT_RESPONSE_SCHEMA,
      maxOutputTokens: 1024,
      temperature: 0.95,
    },
  });

  const text = response.text?.trim() ?? "";
  if (!text) throw new Error("empty model response");
  const parsed = JSON.parse(text);
  const validated = VerdictResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      "schema validation failed: " + JSON.stringify(validated.error.issues),
    );
  }
  return validated.data;
}

interface JudgeScore {
  verdict_appropriateness: number; // 0-3
  reason_specificity: number; // 0-3
  voice_fidelity: number; // 0-3
  context_utilization: number; // 0-3
  regret_signal_use: number; // 0-3
  total: number; // 0-15
  notes: string;
  verdict_matches_expected: boolean;
  must_reference_matched: string[];
  must_reference_missed: string[];
  forbidden_content_present: string[];
}

const JUDGE_SYSTEM = `You are a strict evaluator for a product called Cosign, where an AI persona "Armaan" (a stingy Gen Z-coded friend) gives verdicts on user purchases: COSIGNED / NOT_COSIGNED / SLEEP_ON_IT.

You score one verdict against a scenario's expected behavior. Be strict and specific.

## 5 dimensions, each 0-3

**verdict_appropriateness (0-3)**
- 3: picked the right side given the scenario's expected side AND made a judgment call (not safety-valving to SLEEP_ON_IT)
- 2: picked a defensible side
- 1: picked a questionable side but has reasoning
- 0: picked the opposite of what was clearly appropriate, or SLEEP_ON_IT as a cop-out when a side was clearly right

**reason_specificity (0-3)**
- 3: every reason points at a concrete signal (specific product attribute, dollar amount, named context item, named past verdict)
- 2: most reasons are concrete, 1 is vague
- 1: half the reasons are generic "save your money" type advice
- 0: mostly generic advice

**voice_fidelity (0-3)**
- 3: reads exactly like a Gen Z stingy friend — casual, lowercase-ish, punchy, some slang
- 2: mostly on-brand, one corporate/stiff phrase
- 1: mix of on-brand and corporate
- 0: sounds like a chatbot or advisor

**context_utilization (0-3)** (only score if context or past verdicts were provided)
- 3: references specific context items by name ("coachella", dollar amount, named past product)
- 2: references context but vaguely ("your budget", "your goals")
- 1: mentions context exists but doesn't use it concretely
- 0: ignores context entirely
- N/A when no context provided — score as 3

**regret_signal_use (0-3)** (only score if past verdicts with regret signals were provided)
- 3: explicitly cites the regret by name and uses it in reasoning
- 2: references the pattern but not by name
- 1: mentions past but not the regret signal
- 0: ignores regret signal
- N/A when no regret signal in past — score as 3

## Also output

- **verdict_matches_expected**: true if the verdict side aligns with expected (cosigned-expected/not-cosigned-expected/sleep-ok/either-ok). For "either-ok", always true. For "sleep-ok", true if SLEEP_ON_IT or a reasonable decisive call.
- **must_reference_matched**: array of must_reference strings that DID appear somewhere in headline+reasons+roast (case-insensitive)
- **must_reference_missed**: array of must_reference strings that did NOT appear
- **forbidden_content_present**: array of must_not_contain strings that DID appear (these are failures)
- **notes**: 1 sentence on the most important observation

Output only a JSON object with these fields.`;

async function judgeVerdict(
  scenario: Scenario,
  actual: VerdictResponse,
): Promise<JudgeScore> {
  const ai = new GoogleGenAI({ apiKey: requireKey() });

  const mustRef = scenario.expect.mustReference ?? [];
  const mustNot = scenario.expect.mustNotContain ?? [];

  const judgePrompt = `SCENARIO: ${scenario.label}
ID: ${scenario.id}
PRODUCT DESCRIPTION GIVEN TO ARMAAN:
${scenario.productDescription}

USER CONTEXT: ${JSON.stringify(scenario.context ?? null)}
PAST VERDICTS: ${JSON.stringify(scenario.pastVerdicts ?? [])}

EXPECTED VERDICT SIDE: ${scenario.expect.verdictSide}
MUST_REFERENCE: ${JSON.stringify(mustRef)}
MUST_NOT_CONTAIN: ${JSON.stringify(mustNot)}
SCENARIO NOTES: ${scenario.expect.notes ?? "(none)"}

ARMAAN'S ACTUAL OUTPUT:
verdict: ${actual.verdict}
headline: ${actual.headline}
reasons:
${actual.reasons.map((r) => `  - ${r}`).join("\n")}
roast: ${actual.roast ?? "(none)"}

Score this output. Output JSON only.`;

  const JUDGE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      verdict_appropriateness: { type: Type.INTEGER },
      reason_specificity: { type: Type.INTEGER },
      voice_fidelity: { type: Type.INTEGER },
      context_utilization: { type: Type.INTEGER },
      regret_signal_use: { type: Type.INTEGER },
      verdict_matches_expected: { type: Type.BOOLEAN },
      must_reference_matched: { type: Type.ARRAY, items: { type: Type.STRING } },
      must_reference_missed: { type: Type.ARRAY, items: { type: Type.STRING } },
      forbidden_content_present: { type: Type.ARRAY, items: { type: Type.STRING } },
      notes: { type: Type.STRING },
    },
    required: [
      "verdict_appropriateness",
      "reason_specificity",
      "voice_fidelity",
      "context_utilization",
      "regret_signal_use",
      "verdict_matches_expected",
      "must_reference_matched",
      "must_reference_missed",
      "forbidden_content_present",
      "notes",
    ],
  };

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: judgePrompt }] }],
    config: {
      systemInstruction: JUDGE_SYSTEM,
      responseMimeType: "application/json",
      responseSchema: JUDGE_SCHEMA,
      maxOutputTokens: 512,
      temperature: 0.2,
    },
  });

  const text = res.text?.trim() ?? "";
  const raw = JSON.parse(text) as Omit<JudgeScore, "total">;
  const total =
    raw.verdict_appropriateness +
    raw.reason_specificity +
    raw.voice_fidelity +
    raw.context_utilization +
    raw.regret_signal_use;
  return { ...raw, total };
}

interface RunResult {
  scenario: Scenario;
  actual: VerdictResponse;
  score: JudgeScore;
  error?: string;
}

async function main() {
  const results: RunResult[] = [];

  console.log(`# Cosign eval — ${SCENARIOS.length} scenarios\n`);

  for (const scenario of SCENARIOS) {
    process.stdout.write(`▸ ${scenario.id.padEnd(35)} `);
    try {
      const actual = await runVerdict(scenario);
      const score = await judgeVerdict(scenario, actual);
      results.push({ scenario, actual, score });
      const pass = score.verdict_matches_expected && score.forbidden_content_present.length === 0;
      console.log(
        `${pass ? "PASS" : "FAIL"}  v=${actual.verdict.padEnd(12)} total=${score.total}/15`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
      results.push({
        scenario,
        actual: {} as VerdictResponse,
        score: {} as JudgeScore,
        error: msg,
      });
    }
  }

  // Summary
  const okResults = results.filter((r) => !r.error);
  const n = okResults.length;
  const totalAvg = okResults.reduce((s, r) => s + r.score.total, 0) / n;
  const dimAvg = (k: keyof JudgeScore) =>
    okResults.reduce((s, r) => s + ((r.score[k] as number) || 0), 0) / n;

  const passedVerdict = okResults.filter((r) => r.score.verdict_matches_expected).length;
  const passedForbidden = okResults.filter((r) => r.score.forbidden_content_present.length === 0).length;
  const passedRefs = okResults.filter(
    (r) => (r.score.must_reference_missed ?? []).length === 0,
  ).length;
  const allPass = okResults.filter(
    (r) =>
      r.score.verdict_matches_expected &&
      r.score.forbidden_content_present.length === 0 &&
      (r.score.must_reference_missed ?? []).length === 0,
  ).length;

  console.log("\n# Summary\n");
  console.log(`n: ${n}/${SCENARIOS.length}  (errors: ${results.length - n})`);
  console.log(`verdict_appropriateness:  ${dimAvg("verdict_appropriateness").toFixed(2)} / 3`);
  console.log(`reason_specificity:       ${dimAvg("reason_specificity").toFixed(2)} / 3`);
  console.log(`voice_fidelity:           ${dimAvg("voice_fidelity").toFixed(2)} / 3`);
  console.log(`context_utilization:      ${dimAvg("context_utilization").toFixed(2)} / 3`);
  console.log(`regret_signal_use:        ${dimAvg("regret_signal_use").toFixed(2)} / 3`);
  console.log(`TOTAL avg:                ${totalAvg.toFixed(2)} / 15`);
  console.log();
  console.log(`verdict side matched:     ${passedVerdict}/${n}`);
  console.log(`forbidden content clean:  ${passedForbidden}/${n}`);
  console.log(`all must-refs present:    ${passedRefs}/${n}`);
  console.log(`ALL THREE PASSED:         ${allPass}/${n}  (${((allPass / n) * 100).toFixed(0)}%)`);

  // Failures by scenario
  console.log("\n# Failures\n");
  for (const r of okResults) {
    const problems: string[] = [];
    if (!r.score.verdict_matches_expected) problems.push(`wrong-side (got ${r.actual.verdict})`);
    if (r.score.forbidden_content_present.length)
      problems.push(`forbidden: ${r.score.forbidden_content_present.join(", ")}`);
    if ((r.score.must_reference_missed ?? []).length)
      problems.push(`missed-refs: ${r.score.must_reference_missed.join(", ")}`);
    if (problems.length > 0) {
      console.log(`◆ ${r.scenario.id}: ${problems.join(" | ")}`);
      console.log(`  headline: ${r.actual.headline}`);
      console.log(`  notes:    ${r.score.notes}`);
      console.log();
    }
  }

  // Write full JSON for diffing between runs
  const fs = await import("node:fs");
  const outPath = process.env.EVAL_OUT ?? "evals/fixtures/latest.json";
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        model: MODEL,
        summary: {
          n,
          totalAvg,
          dimAvg: {
            verdict_appropriateness: dimAvg("verdict_appropriateness"),
            reason_specificity: dimAvg("reason_specificity"),
            voice_fidelity: dimAvg("voice_fidelity"),
            context_utilization: dimAvg("context_utilization"),
            regret_signal_use: dimAvg("regret_signal_use"),
          },
          passedVerdict,
          passedForbidden,
          passedRefs,
          allPass,
        },
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\nwrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
