import axios from "axios";
import { Metric } from "./base.js";

/**
 * Metric to check BTC's ranking or market share.
 * For "Will BTC remain #1 crypto by market cap?", 
 * this returns 1 if BTC is #1, and 0 otherwise.
 */
export class BTCDominanceMetric implements Metric {
    name = "btc_dominance";

    async fetchValue(): Promise<number | null> {
        try {
            console.log("📸 Checking BTC market cap ranking...");
            const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc";
            const resp = await axios.get(url);
            const data = resp.data;

            if (!Array.isArray(data) || data.length === 0) {
                console.log("❌ CoinGecko Error: Invalid response format");
                return null;
            }

            // CoinGecko market_cap_rank should be 1 for BTC if it's leading
            const rank = data[0].market_cap_rank;
            return rank === 1 ? 1 : 0;
        } catch (e: any) {
            console.log(`❌ Error fetching BTC dominance: ${e.message}`);
            return null;
        }
    }
}
