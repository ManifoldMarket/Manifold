import axios from "axios";
import { Metric } from "./base.js";

/**
 * Metric to fetch the Crypto Fear & Greed Index.
 * Returns a value from 0 (Extreme Fear) to 100 (Extreme Greed).
 */
export class FearGreedMetric implements Metric {
    name = "fear_greed";

    async fetchValue(): Promise<number | null> {
        try {
            console.log("📸 Fetching Crypto Fear & Greed Index...");
            const url = "https://api.alternative.me/fng/";
            const resp = await axios.get(url);
            const data = resp.data;

            if (data.metadata.error) {
                console.log(`❌ F&G Error: ${data.metadata.error}`);
                return null;
            }

            const value = parseInt(data.data[0].value);
            return value;
        } catch (e: any) {
            console.log(`❌ Error fetching Fear & Greed Index: ${e.message}`);
            return null;
        }
    }
}
