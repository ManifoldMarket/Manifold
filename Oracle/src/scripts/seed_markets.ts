import { createMarket } from '../cli.js';

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomMetric(): string {
    const metrics = ["eth_staking_rate", "eth_price", "btc_dominance", "eth_gas_price", "fear_greed", "stablecoin_peg"];
    return metrics[getRandomInt(0, metrics.length - 1)];
}

const marketThemes = [
    "Crypto Price Prediction",
    "NFT Index Performance",
    "DeFi Protocol Adoption",
    "Blockchain Network Activity",
    "L2 Solution Scalability",
    "Central Bank Digital Currency Launch",
    "Major Exchange Listing",
    "Regulatory Framework Impact",
    "Decentralized Storage Growth",
    "Web3 Gaming Popularity"
];

const subjects = [
    "Ethereum", "Bitcoin", "Solana", "Polkadot", "Avalanche",
    "Chainlink", "Uniswap", "Aave", "Compound", "OpenSea",
    "Layer 2 Scaling", "Stablecoins", "DAO Governance", "Metaverse", "Oracles"
];

function generateRealisticTitle(): string {
    const theme = marketThemes[getRandomInt(0, marketThemes.length - 1)];
    const subject = subjects[getRandomInt(0, subjects.length - 1)];
    return `${subject} ${theme} ${getRandomInt(2025, 2028)}`;
}


async function seedMarket(index: number) {
    const title = generateRealisticTitle();
    const threshold = getRandomFloat(0.1, 1000).toFixed(2);
    // Snapshot time between 1 day and 30 days in the future
    const snapshotTime = Math.floor(Date.now() / 1000) + getRandomInt(86400, 86400 * 30);
    const metric = getRandomMetric();
    const description = `Predict the outcome for the ${title} event.`;
    const optionA = "Yes";
    const optionB = "No";

    console.log(`Attempting to seed market: ${title}`);
    console.log(`  Threshold: ${threshold}`);
    console.log(`  Snapshot Time: ${snapshotTime} (${new Date(snapshotTime * 1000).toLocaleString()})`);
    console.log(`  Metric: ${metric}`);

    try {
        await createMarket(
            title,
            parseFloat(threshold),
            snapshotTime,
            metric,
            description,
            optionA,
            optionB
        );
        console.log(`Successfully seeded market: ${title}`);
    } catch (error) {
        console.error(`Failed to seed market: ${title}`, error);
    }
}

const numberOfMarketsToSeed = 3; // Seed 3 markets by default

(async () => {
    for (let i = 0; i < numberOfMarketsToSeed; i++) {
        await seedMarket(i + 1);
    }
    process.exit(0); // Exit after market creation
})();
