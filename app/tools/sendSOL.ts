import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

import { z } from "zod";

const sendSOLSchema = z.object({
  amount: z.number().positive().max(5),
  recipientAddress: z.string().min(32),
});

export const sendSOLTool: ToolSchema = {
  name: "send_sol",
  description: "Send SOL from user wallet to the recipient wallet",
  parameters: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "Amount to send to the recipient wallet",
      },
      recipientAddress: {
        type: "string",
        description: "Address of the recipient wallet",
      },
    },
    required: ["amount", "recipientAddress"],
  },
  handler: async ({
    connection,
    publicKey,
    parameters,
    wallet,
  }: {
    connection: Connection;
    publicKey: PublicKey;
    parameters: unknown;
    wallet: any;
  }) => {
    if (!publicKey) {
      throw new Error("Wallet not connected.");
    }
    if (!wallet || !wallet.signTransaction) {
      throw new Error("Wallet does not support signing transactions.");
    }
    const parsed = sendSOLSchema.safeParse(parameters);
    if (!parsed.success) {
      throw new Error("Invalid amount or recipient address");
    }
    const { amount, recipientAddress } = parsed.data;
    const toPublicKey = new PublicKey(recipientAddress);
    const lamports = Math.round(amount * 1e9);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toPublicKey,
        lamports,
      }),
    );
    transaction.feePayer = publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    await connection.confirmTransaction(signature);
    return { message: `✅ Sent ${amount} SOL to ${recipientAddress} on Testnet.`, data: { signature } };
  },
};
