import axios from "axios";
import { Metric } from "./base.js";
import { ETHERSCAN_API_KEY } from "../config.js";

/**
 * Metric to fetch ETH gas price.
 * For "Will average gwei exceed 50 today?", 
 * this returns the current average gas price in gwei.
 */
export class ETHGasPriceMetric implements Metric {
    name = "eth_gas_price";

    async fetchValue(): Promise<number | null> {
        if (!ETHERSCAN_API_KEY) {
            console.log("⚠️ ETHERSCAN_API_KEY not found in environment.");
            return null;
        }

        try {
            console.log("📸 Fetching ETH gas price (average)...");
            const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;
            const resp = await axios.get(url);
            const data = resp.data;

            if (data.status !== "1") {
                console.log(`❌ Etherscan Error: ${data.message}`);
                return null;
            }

            // ProposeGasPrice is usually the "Average" recommendation by Etherscan
            const avgGwei = parseFloat(data.result.ProposeGasPrice);
            return avgGwei;
        } catch (e: any) {
            console.log(`❌ Error fetching gas price: ${e.message}`);
            return null;
        }
    }
}
