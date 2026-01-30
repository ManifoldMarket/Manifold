import { Metric } from "./base";
import { ETHStakingRateMetric } from "./eth_staking";
import { ETHPriceMetric } from "./eth_price";

class MetricRegistry {
    private metrics: Map<string, Metric> = new Map();

    constructor() {
        this.register(new ETHStakingRateMetric());
        this.register(new ETHPriceMetric());
    }

    register(metric: Metric): void {
        this.metrics.set(metric.name, metric);
        console.log(`✅ Registered metric: ${metric.name}`);
    }

    getMetric(name: string): Metric | undefined {
        return this.metrics.get(name);
    }

    listMetrics(): string[] {
        return Array.from(this.metrics.keys());
    }
}

export const registry = new MetricRegistry();
