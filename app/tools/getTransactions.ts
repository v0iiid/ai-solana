import { PublicKey, Connection } from "@solana/web3.js";

export const getTransactionsTool: ToolSchema = {
  name: "get_transactions",
  description: "Get Transactions of the connect wallet",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async ({ publicKey, connection }: { publicKey: PublicKey; connection: Connection }) => {
    if (!publicKey) {
      return { message: "❌ Wallet not connected." };
    }
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 }, "confirmed");
    if (signatures.length === 0) {
      return { message: "ℹ️ No recent transactions found." };
    }
    const formattedTxs = signatures.map((sig) => ({
      signature: sig.signature,
      short: `${sig.signature.slice(0, 8)}...`,
      date: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : "Unknown date",
    }));
    return {
      message: `${signatures.length} transactions found!`,
      data: formattedTxs,
    };
  },
};
