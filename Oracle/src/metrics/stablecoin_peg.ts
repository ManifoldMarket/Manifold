import axios from "axios";
import { Metric } from "./base.js";

/**
 * Metric to check stablecoin peg.
 * For USDC/USDT, this returns the price in USD.
 * The threshold would be set to something like 0.98 or 1.02 to detect depegs.
 */
export class StablecoinPegMetric implements Metric {
    name = "stablecoin_peg";

    async fetchValue(): Promise<number | null> {
        try {
            console.log("📸 Checking USDT price for peg stability...");
            const url = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd";
            const resp = await axios.get(url);
            const data = resp.data;

            const price = data.tether?.usd;
            if (price === undefined) {
                console.log("❌ CoinGecko Error: Invalid response for tether");
                return null;
            }

            return price;
        } catch (e: any) {
            console.log(`❌ Error fetching stablecoin peg data: ${e.message}`);
            return null;
        }
    }
}
