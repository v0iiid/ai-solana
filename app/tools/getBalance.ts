import { Connection, PublicKey } from "@solana/web3.js";

export const getBalanceTool = {
  name: "get_balance",
  description: "Get the SOL balance of the connected wallet",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async ({ connection, publicKey }: { connection: Connection; publicKey: PublicKey }) => {
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / 1e9;

    return {
      message: `💰 Your balance is ${sol.toFixed(4)} SOL.`,
      data: { sol },
    };
  },
};
