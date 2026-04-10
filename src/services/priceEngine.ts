/**
 * PriceEngine – centralizovaný modul pre výpočet "best price" z viacerých zdrojov.
 *
 * Stratégia váhovania (Cardmarket dáta):
 *   - trendPrice    váha 0.50  (Cardmarket vlastný smoothed trend)
 *   - sevenDayAvg   váha 0.30  (krátkodobý priemer, dobrý indikátor)
 *   - thirtyDayAvg  váha 0.20  (dlhodobý priemer, stability anchor)
 *   - fromPrice     IGNOROVANÝ ako primárny zdroj (outlier prone)
 *   - oneDayAvg     IGNOROVANÝ ako primárny zdroj (príliš volatilný)
 *
 * Outlier detekcia:
 *   - Ak fromPrice < trendPrice * 0.60 → outlier (prázdna krabica, accessories)
 *   - Ak vypočítaná cena = 0 alebo NaN → vráť poslednú platnú cenu (circuit breaker)
 */

export interface RawPriceMetrics {
    trendPrice?: number;
    fromPrice?: number;
    oneDayAvg?: number;
    sevenDayAvg?: number;
    thirtyDayAvg?: number;
    availableItems?: number;
}

export interface ComputedPrice {
    /** Odporúčaná "best price" – váhovaný priemer */
    bestPrice: number | null;
    /** Cena použitá pre výpočet (kopia vstupu pre transparentnosť) */
    raw: RawPriceMetrics;
    /** Či bol fromPrice označený ako outlier */
    fromPriceIsOutlier: boolean;
    /** Zdroj / dôvod výberu ceny */
    reason: string;
    /** Váhovaný priemer – len informácia */
    weightedAverage: number | null;
}

export class PriceEngine {
    /**
     * Vypočíta "best price" z raw Cardmarket metrík.
     * @param metrics - Zdrojové dáta zo scrapera
     * @param lastKnownPrice - Posledná platná cena z DB (circuit breaker fallback)
     */
    static compute(
        metrics: RawPriceMetrics,
        lastKnownPrice?: number | null
    ): ComputedPrice {
        const { trendPrice, fromPrice, oneDayAvg, sevenDayAvg, thirtyDayAvg } = metrics;

        // === Outlier detekcia pre fromPrice ===
        const referencePrice = trendPrice ?? sevenDayAvg ?? thirtyDayAvg;
        const fromPriceIsOutlier = !!(
            fromPrice !== undefined &&
            referencePrice !== undefined &&
            (fromPrice < referencePrice * 0.60 || fromPrice > referencePrice * 2.0)
        );

        // === Váhovaný priemer ===
        let weightedSum = 0;
        let totalWeight = 0;

        if (trendPrice !== undefined && !isNaN(trendPrice) && trendPrice > 0) {
            weightedSum += trendPrice * 0.50;
            totalWeight += 0.50;
        }
        if (sevenDayAvg !== undefined && !isNaN(sevenDayAvg) && sevenDayAvg > 0) {
            weightedSum += sevenDayAvg * 0.35;
            totalWeight += 0.35;
        }
        if (thirtyDayAvg !== undefined && !isNaN(thirtyDayAvg) && thirtyDayAvg > 0) {
            weightedSum += thirtyDayAvg * 0.15;
            totalWeight += 0.15;
        }

        const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : null;

        // === Rozhodovacia logika ===
        let bestPrice: number | null = null;
        let reason = '';

        if (weightedAverage !== null && weightedAverage > 0) {
            bestPrice = Math.round(weightedAverage * 100) / 100;
            reason = `weighted_avg(trend=${trendPrice?.toFixed(2)}, 7d=${sevenDayAvg?.toFixed(2)}, 30d=${thirtyDayAvg?.toFixed(2)})`;
        } else if (fromPrice !== undefined && !fromPriceIsOutlier && fromPrice > 0) {
            // Fallback na fromPrice len ak nie je outlier a nemáme nič iné
            bestPrice = fromPrice;
            reason = `from_price_fallback`;
        } else if (lastKnownPrice !== undefined && lastKnownPrice !== null && lastKnownPrice > 0) {
            // Circuit breaker – zachovaj poslednú platnú cenu
            bestPrice = lastKnownPrice;
            reason = `circuit_breaker_last_known=${lastKnownPrice}`;
        } else {
            bestPrice = null;
            reason = 'no_valid_price_found';
        }

        return {
            bestPrice,
            raw: metrics,
            fromPriceIsOutlier,
            reason,
            weightedAverage,
        };
    }

    /**
     * Formátovaný log pre debug účely
     */
    static formatDebugLog(productName: string, computed: ComputedPrice): string {
        const { raw, bestPrice, fromPriceIsOutlier, reason, weightedAverage } = computed;
        return [
            `[PriceEngine] ${productName}`,
            `  trend=${raw.trendPrice?.toFixed(2) ?? 'N/A'} | 1d=${raw.oneDayAvg?.toFixed(2) ?? 'N/A'} | 7d=${raw.sevenDayAvg?.toFixed(2) ?? 'N/A'} | 30d=${raw.thirtyDayAvg?.toFixed(2) ?? 'N/A'} | from=${raw.fromPrice?.toFixed(2) ?? 'N/A'}`,
            `  fromIsOutlier=${fromPriceIsOutlier} | weightedAvg=${weightedAverage?.toFixed(2) ?? 'N/A'} | BEST=${bestPrice?.toFixed(2) ?? 'NULL'}`,
            `  reason: ${reason}`,
        ].join('\n');
    }
}
