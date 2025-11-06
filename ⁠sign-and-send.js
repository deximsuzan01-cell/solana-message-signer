require('dotenv').config();
const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');

// 🔌 Fixed: removed trailing spaces in the URL for reliable connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Debug: print raw env value
console.log("Raw PRIVATE_KEY from .env:", process.env.PRIVATE_KEY);

if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY not found in .env file!");
}

let privateKeyArray;
try {
  privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
} catch (e) {
  throw new Error("❌ Failed to parse PRIVATE_KEY as JSON. Check your .env syntax!");
}

if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
  throw new Error(`❌ Invalid private key length: expected 64, got ${privateKeyArray.length}`);
}

const payer = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
console.log("✅ Payer Public Key:", payer.publicKey.toBase58());

// --- ADDED: Reliable transaction sending ---
(async () => {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payer.publicKey, // sending to self (safe test)
        lamports: 1_000_000, // 0.001 SOL
      })
    );

    console.log("🚀 Sending transaction...");
    const signature = await connection.sendTransaction(transaction, [payer]);
    console.log("✅ Success! Transaction signature:", signature);
    console.log(`🔍 View on Solscan (devnet): https://solscan.io/tx/${signature}?cluster=devnet`);
  } catch (err) {
    console.error("💥 Failed to send transaction:", err.message);
    if (err.message.includes("Insufficient funds")) {
      console.log("💡 Tip: Get free devnet SOL at https://faucet.solana.com");
    }
  }
})();