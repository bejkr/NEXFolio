/**
 * Utility for calculating product metrics like price change and Nexfolio Index Score.
 */

export interface PriceHistoryItem {
  price: number;
  date: Date | string;
  availabilityCount?: number | null;
}

export interface ProductForScoring {
  id: string;
  price: number | null;
  availabilityCount: number | null;
  releaseYear?: number | null;
  category?: string;
}

/**
 * Calculates the percentage change in price over a given number of days.
 * Returns null when history is too short to give a meaningful result
 * (baseline entry must be at least 80% as old as the requested period).
 */
export function calculatePriceChange(history: PriceHistoryItem[], days: number): number | null {
  if (!history || history.length < 2) return null;

  const now = new Date();
  const targetMs = now.getTime() - days * 24 * 60 * 60 * 1000;
  // Baseline entry must be at least 80% of the requested period old
  const minAgeMs = days * 0.8 * 24 * 60 * 60 * 1000;

  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sortedHistory[0].price;

  // Find the entry closest to targetDate that is old enough
  let baseline: number | null = null;
  let minDiff = Infinity;

  for (const h of sortedHistory) {
    const entryMs = new Date(h.date).getTime();
    const ageMs = now.getTime() - entryMs;
    if (ageMs < minAgeMs) continue; // too recent — skip
    const diff = Math.abs(entryMs - targetMs);
    if (diff < minDiff) {
      minDiff = diff;
      baseline = h.price;
    }
  }

  if (baseline === null || baseline === 0) return null;
  return ((latest - baseline) / baseline) * 100;
}

/**
 * Calculates a proprietary Nexfolio Index Score (0-100).
 * Based on Scarcity (40%), Momentum (40%), and Stability (20%).
 */
export function calculateNexfolioScore(product: ProductForScoring, history: PriceHistoryItem[]): number {
  let score = 0;

  // 1. SCARCITY (40 pts)
  const avail = product.availabilityCount;
  if (avail === null || avail === undefined) {
    score += 15; // Neutral
  } else if (avail <= 5) {
    score += 40;
  } else if (avail <= 15) {
    score += 35;
  } else if (avail <= 40) {
    score += 25;
  } else if (avail <= 100) {
    score += 15;
  } else if (avail <= 500) {
    score += 10;
  } else {
    score += 5;
  }

  // 2. MOMENTUM (40 pts) — null means insufficient history → neutral
  const change30D = calculatePriceChange(history, 30) ?? 0;
  if (change30D >= 15) {
    score += 40;
  } else if (change30D >= 5) {
    score += 30;
  } else if (change30D >= 0) {
    score += 20;
  } else if (change30D >= -5) {
    score += 10;
  } else {
    score += 0;
  }

  // 3. STABILITY / AGE (20 pts)
  const year = product.releaseYear;
  if (!year) {
    score += 10;
  } else if (year < 2011) {
    score += 20; // Vintage
  } else if (year < 2017) {
    score += 15;
  } else if (year < 2021) {
    score += 10;
  } else {
    score += 5; // Modern
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}
