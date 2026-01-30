import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Aleo Configuration
ORACLE_PRIVATE_KEY = os.getenv("ORACLE_PRIVATE_KEY")
ALEO_NODE_URL = os.getenv("ALEO_NODE_URL")

if ALEO_NODE_URL:
    ALEO_BROADCAST_URL = f"{ALEO_NODE_URL}/testnet3/transaction/broadcast"
else:
    ALEO_BROADCAST_URL = None

# Program Configuration
PROGRAM_ID = "prediction.aleo"

# Fees
CREATE_POOL_FEE = 500_000
RESOLVE_POOL_FEE = 100_000

# API Keys
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
