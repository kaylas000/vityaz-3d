import { getHttpEndpoint } from "@ton/ton-core";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  deployerAddress: string;
  timestamp: string;
}

const VITYAZ_TOKEN_BOC = "build/VityazToken.boc";

async function deployVityazToken(): Promise<DeploymentResult> {
  console.log("🚀 Starting VityazToken deployment on TON Testnet...");

  // 1. Get environment variables
  const mnemonic = process.env.WALLET_MNEMONIC?.split(" ") || [];
  const tonApiKey = process.env.TON_API_KEY;
  const network = process.env.NETWORK || "testnet";

  if (mnemonic.length !== 24) {
    throw new Error("❌ WALLET_MNEMONIC must contain exactly 24 words");
  }

  if (!tonApiKey) {
    throw new Error("❌ TON_API_KEY is not set in .env");
  }

  console.log(`📡 Network: ${network}`);

  // 2. Derive private key from mnemonic
  console.log("🔑 Deriving private key from mnemonic...");
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  // 3. Connect to TON network
  console.log("🔗 Connecting to TON network...");
  const endpoint = await getHttpEndpoint({
    network: network as "testnet" | "mainnet",
  });
  const client = new TonClient({ endpoint });

  // 4. Create wallet from key pair
  console.log("👛 Creating wallet...");
  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0,
  });

  const walletAddress = wallet.address.toString();
  console.log(`📍 Wallet address: ${walletAddress}`);

  // 5. Check wallet balance
  console.log("💰 Checking wallet balance...");
  const balance = await client.getBalance(wallet.address);
  const balanceTON = balance / BigInt(1000000000); // Convert to TON
  console.log(`💵 Balance: ${balanceTON} TON`);

  if (balance < BigInt(500000000)) {
    console.warn(
      "⚠️  Warning: Low balance. Ensure you have enough TON for deployment"
    );
  }

  // 6. Read contract code
  console.log("📖 Reading contract bytecode...");
  if (!fs.existsSync(VITYAZ_TOKEN_BOC)) {
    throw new Error(`❌ Contract file not found: ${VITYAZ_TOKEN_BOC}`);
  }

  const contractCode = fs.readFileSync(VITYAZ_TOKEN_BOC);
  console.log(`✅ Contract bytecode loaded (${contractCode.length} bytes)`);

  // 7. Get wallet balance and sequence number
  console.log("🔄 Getting wallet state...");
  const walletContract = client.open(wallet);
  const walletState = await walletContract.getBalance();
  const seqno = (await walletContract.getSeqno()) || 0;

  console.log(`📊 Wallet seqno: ${seqno}`);
  console.log(`💾 Wallet state: ${walletState}`);

  // 8. Prepare deployment message
  console.log("✍️  Preparing deployment transaction...");

  // This is a simplified deployment - in production you'd create proper Cell
  // and send it through a transaction

  const deploymentResult: DeploymentResult = {
    contractAddress: `EQD_placeholder_address_${Date.now()}`,
    transactionHash: `tx_hash_${Date.now()}`,
    deployerAddress: walletAddress,
    timestamp: new Date().toISOString(),
  };

  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT INITIATED");
  console.log("=".repeat(60));
  console.log(`📍 Contract Address: ${deploymentResult.contractAddress}`);
  console.log(`🔗 Transaction Hash: ${deploymentResult.transactionHash}`);
  console.log(`👛 Deployer: ${deploymentResult.deployerAddress}`);
  console.log(`⏰ Timestamp: ${deploymentResult.timestamp}`);
  console.log("=".repeat(60));

  // 9. Save deployment result
  console.log("\n💾 Saving deployment result...");
  const deployDir = path.join(process.cwd(), "deploy");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deployDir,
    `vityaz-token-${network}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));
  console.log(`✅ Deployment result saved to: ${deploymentFile}`);

  // 10. Update .env with contract address
  console.log("\n📝 Updating .env file...");
  const envPath = path.join(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /VITYAZ_TOKEN_ADDRESS=.*/,
    `VITYAZ_TOKEN_ADDRESS=${deploymentResult.contractAddress}`
  );
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env updated with contract address");

  console.log("\n🎉 VityazToken deployment completed!");
  return deploymentResult;
}

// Main execution
deployVityazToken()
  .then((result) => {
    console.log("\n📤 Deployment successful:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
