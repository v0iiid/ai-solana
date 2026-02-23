import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { z } from "zod";

const airdropSchema = z.object({
  amount: z.number().positive().max(5),
});

export const airdropTool = {
  name: "airdrop",
  description: "Airdrop SOL to the connected wallet (devnet only)",
  parameters: {
    type: "object",
    properties: {
      type: "number",
      description: "Amount of SOL to airdrop (max 5)",
    },
    required: ["amount"],
  },
  handler: async ({
    publicKey,
    connection,
    parameters,
  }: {
    publicKey: PublicKey;
    connection: Connection;
    parameters: unknown;
  }) => {
    if (!publicKey) {
      throw new Error("Wallet not connected.");
    }
    const parsed = airdropSchema.safeParse(parameters);
    if (!parsed.success) {
      throw new Error("Invalid airdrop amount.");
    }
    const { amount } = parsed.data;
    const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL * amount);
    await connection.confirmTransaction(signature, "confirmed");
    return {
      message: `✅ Airdrop successful! You received ${amount} SOL.`,
    };
  },
};
