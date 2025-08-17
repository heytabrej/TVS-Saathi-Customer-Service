// Central AI configuration constants & helpers
export const MODEL_PREFERENCE = [
  'gemini-2.0-flash'
];

export const MAX_HISTORY_MESSAGES = 18; // total (user+model)
export const SUMMARIZE_AFTER = 12; // when > this, compress older context
export const CIRCUIT_BREAKER_THRESHOLD = 3; // consecutive failures
export const CIRCUIT_BREAKER_COOLDOWN_MS = 60_000; // 1 minute

export const ESCALATION_KEYWORDS = ['fraud','legal','harassment','urgent','escalate','manager'];
