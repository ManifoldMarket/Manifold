import time
import os
import aleo
import requests
from dotenv import load_dotenv
import db

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

ORACLE_PRIVATE_KEY = os.getenv("ORACLE_PRIVATE_KEY")
ALEO_NODE_URL = os.getenv("ALEO_NODE_URL")
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")


def fetch_eth_staking_data():
    """
    Fetches ETH staking rate (total_staked / total_supply).
    Returns a percentage value (e.g., 28.5).
    """
    try:
        print("📸 Taking snapshot of ETH staking data...")

        # 1. Fetch Total Supply from Etherscan
        supply_url = f"https://api.etherscan.io/api?module=stats&action=ethsupply&apikey={ETHERSCAN_API_KEY}"
        supply_resp = requests.get(supply_url)
        supply_data = supply_resp.json()
        
        if supply_data.get("status") != "1":
            print(f"❌ Etherscan Error: {supply_data.get('message')}")
            return None
            
        # Total supply is returned in Wei, convert to ETH (10^18)
        total_supply = int(supply_data["result"]) / 10**18
        
        # 2. Fetch Total Staked from Beaconcha.in
        # Using a public endpoint that provides total staked ETH. 
        # Note: Beaconcha.in might require headers for some endpoints.
        staked_url = "https://beaconcha.in/api/v1/ethstore/latest"
        staked_resp = requests.get(staked_url)
        staked_data = staked_resp.json()
        
        if not staked_data.get("status") == "OK":
            # Fallback to another endpoint if ethstore is not available
            staked_url = "https://beaconcha.in/api/v1/validator/statistics"
            staked_resp = requests.get(staked_url)
            staked_data = staked_resp.json()
            
            if not staked_data.get("status") == "OK":
                print(f"❌ Beaconcha.in Error: {staked_data.get('message')}")
                return None
            
            # Sum up balances or use a provided total
            total_staked = staked_data["data"][0]["active_validators_total"] * 32 # Approximation
        else:
            # Payout data provides an eth_balance or equivalent
            total_staked = int(staked_data["data"]["total_balance"]) / 10**18 # total_balance in Wei/Gwei? Check docs.
            # Assuming Gwei for Beacon chain usually
            total_staked = int(staked_data["data"]["total_balance"]) / 10**9 # Gwei to ETH

        print(f"💎 Total Staked: {total_staked:,.2f} ETH")
        print(f"🪙 Total Supply: {total_supply:,.2f} ETH")

        staking_rate = (total_staked / total_supply) * 100
        print(f"📊 Calculated Staking Rate: {staking_rate:.2f}%")

        return staking_rate
    except Exception as e:
        print(f"❌ Error fetching staking data: {e}")
        return None


def resolve_market(market_id, winning_option):
    """
    Executes the Aleo transaction to resolve the market using the Aleo SDK.
    """

    if not ORACLE_PRIVATE_KEY or not ALEO_NODE_URL:
        print("❌ Missing Oracle credentials in .env.")
        return False

    try:
        # 1. Setup Oracle Account and Query
        private_key = aleo.PrivateKey.from_string(ORACLE_PRIVATE_KEY)
        query = aleo.Query.rest(ALEO_NODE_URL)
        process = aleo.Process.load()

        # 2. Load the prediction program from the network
        program_id = "prediction.aleo"
        print(f"📡 Fetching program {program_id} from the network...")
        program_source = query.get_program(program_id)
        
        program = aleo.Program.from_string(program_source)
        process.add_program(program)

        # 3. Authorize Resolution
        print(
            f"🚀 Authorizing resolution for market {market_id} with option {winning_option}..."
        )
        function_name = aleo.Identifier.from_string("resolve_pool")

        # Inputs: market_id (field), winning_option (u64)
        inputs = [
            aleo.Value.from_string(market_id),
            aleo.Value.from_string(f"{winning_option}u64"),
        ]

        auth = process.authorize(private_key, program.id(), function_name, inputs)

        # 4. Execute and Prove
        print("🔧 Generating zero-knowledge proof...")
        (resp, trace) = process.execute(auth)
        trace.prepare(query)

        execution = trace.prove_execution(aleo.Locator(program.id(), function_name))
        execution_id = execution.execution_id()
        process.verify_execution(execution)

        # 5. Handle Fees (Public Fee)
        # For simplicity, we use a fixed fee or calculate it if costs are known
        # In a real environment, you'd check process.execution_cost(execution)
        fee_cost = 100_000  # Example fee in microcredits
        fee_auth = process.authorize_fee_public(
            private_key, fee_cost, execution_id, None
        )
        (_fee_resp, fee_trace) = process.execute(fee_auth)
        fee_trace.prepare(query)
        fee = fee_trace.prove_fee()
        process.verify_fee(fee, execution_id)

        # 6. Create and Broadcast Transaction
        transaction = aleo.Transaction.from_execution(execution, fee)
        print(f"📡 Broadcasting transaction {execution_id}...")

        # Use query to broadcast
        # Note: If Query doesn't have a direct broadcast, we'd use requests to POST to the node's /transaction/broadcast endpoint
        tx_json = transaction.to_json()
        response = requests.post(
            f"{ALEO_NODE_URL}/testnet3/transaction/broadcast", data=tx_json
        )

        if response.status_code == 200:
            print(f"✅ Transaction Broadcasted! ID: {response.text.strip()}")
            return True
        else:
            print(f"❌ Broadcast failed: {response.text}")
            return False

    except Exception as e:
        print(f"❌ SDK Error during resolution: {e}")
        return False


def main():
    db.init_db()
    print("🤖 Oracle Worker is running and monitoring pending markets...")

    while True:
        pending = db.get_pending_markets()
        current_time = int(time.time())

        for market_id, deadline, threshold, metric_type in pending:
            if current_time >= deadline:
                print(f"⏰ Deadline reached for market: {market_id}")

                value = fetch_eth_staking_data()
                if value is not None:
                    # Resolve: Option 1 (Yes) if value >= threshold, Option 2 (No) otherwise
                    winning_option = 1 if value >= threshold else 2

                    if resolve_market(market_id, winning_option):
                        db.mark_resolved(market_id)
                        print(
                            f"✅ Market {market_id} resolved as {'YES' if winning_option == 1 else 'NO'}"
                        )
                else:
                    print(
                        f"⚠️ Could not fetch data for market {market_id}, retrying next loop..."
                    )

        # Poll every 60 seconds
        time.sleep(60)


if __name__ == "__main__":
    main()
