import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export const getNFTsTool:ToolSchema = {
  name: "get_nfts",
  description: "Get all NFTs of the connected wallet",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async ({ publicKey, connection }: { publicKey: PublicKey; connection: Connection }) => {
    if (!publicKey) {
      return { message: "❌ Wallet not connected." };
    }

    const metaplex = Metaplex.make(connection);

    const raw = await metaplex.nfts().findAllByOwner({
      owner: publicKey,
    });
    const metadataOnly = raw.filter((asset): asset is Metadata => "mintAddress" in asset);

    const loaded = await Promise.all(metadataOnly.map((metadata) => metaplex.nfts().load({ metadata })));

    const formatted = loaded.map((nft) => ({
      mint: nft.address,
      name: nft.name,
      uri: nft.uri,
    }));

    return {
      message: `You own ${formatted.length} NFTs.`,
      data: formatted,
    };
  },
};
