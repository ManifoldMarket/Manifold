import { Command } from "commander";
import {
    Account,
    AleoNetworkClient,
    NetworkRecordProvider,
    ProgramManager,
    AleoKeyProvider,
} from "@provablehq/sdk";
import * as db from "./db.js";
import { startWorker } from "./worker.js";
import {
    ORACLE_PRIVATE_KEY,
    ALEO_NODE_URL,
    PROGRAM_ID,
    CREATE_POOL_FEE,
    ALEO_BROADCAST_URL,
} from "./config.js";

const program = new Command();

program
    .name("oracle")
    .description("Oracle CLI for Prediction Markets")
    .version("1.0.0");

async function setupSDK() {
    if (!ORACLE_PRIVATE_KEY || !ALEO_NODE_URL) {
        throw new Error("Missing Oracle credentials in .env");
    }
    const account = new Account({ privateKey: ORACLE_PRIVATE_KEY });
    const networkClient = new AleoNetworkClient(ALEO_NODE_URL);
    const keyProvider = new AleoKeyProvider();
    const recordProvider = new NetworkRecordProvider(account, networkClient);
    keyProvider.useCache(true);
    const programManager = new ProgramManager(
        ALEO_NODE_URL,
        keyProvider,
        recordProvider
    );
    programManager.setAccount(account);
    return { programManager };
}

program
    .command("create-market <title> <threshold> <snapshot_time>")
    .option(
        "-m, --metric <type>",
        "Metric type (eth_staking_rate, eth_price)",
        "eth_staking_rate"
    )
    .description("Create a new prediction market")
    .action(async (title, threshold, snapshotTime, options) => {
        try {
            db.initDb();
            const { programManager } = await setupSDK();

            console.log(`🚀 Authorizing pool creation for ${title}...`);

            const inputs = [
                title, // Expecting valid field string e.g. "123field"
                "0field",
                "[0field, 0field]",
                `${snapshotTime}u64`,
            ];
            const fee = CREATE_POOL_FEE / 1_000_000;

            const txId = await programManager.execute({
                programName: PROGRAM_ID,
                functionName: "create_pool",
                priorityFee: fee,
                privateFee: false,
                inputs: inputs,
            });

            console.log(`✅ Market creation transaction broadcasted! ID: ${txId}`);

            // Register in backend DB
            db.addMarket(title, parseInt(snapshotTime), parseFloat(threshold), options.metric);
            console.log(`Market registered in backend DB for snapshot at ${snapshotTime}`);

        } catch (e: any) {
            console.error(`❌ Error creating market: ${e.message}`);
        }
    });

program
    .command("start-worker")
    .description("Start the Oracle Worker")
    .action(async () => {
        await startWorker();
    });

program.parse(process.argv);
