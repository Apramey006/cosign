export type Verdict = "COSIGNED" | "NOT_COSIGNED" | "SLEEP_ON_IT";

export interface Product {
  name: string;
  priceCents: number;
  source?: string;
  imageUrl?: string;
  description?: string;
}

export interface VerdictResult {
  verdict: Verdict;
  headline: string;
  reasons: string[];
  roast?: string;
}

export interface UserContext {
  weeklyBudgetCents?: number;
  savingGoals?: string[];
  recentRegrets?: string[];
}

export interface TabEntry {
  id: string;
  product: Product;
  verdict: VerdictResult;
  purchased: boolean;
  createdAt: string;
  stillGlad?: boolean | null;
  followUpAt?: string;
  /**
   * true once the user has *explicitly* answered the "did u buy it?" prompt.
   * When undefined: the prompt shows.
   * When true + purchased=false: user said "nah" — prompt stays hidden.
   * When true + purchased=true: user said "yeah" — still-glad prompt takes over.
   */
  buyAnswered?: boolean;
}
