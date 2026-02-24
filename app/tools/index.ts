import { airdropTool } from "@/app/tools/airdrop";
import { getBalanceTool } from "@/app/tools/getBalance";
import { getNFTsTool } from "@/app/tools/getNfts";
import { getTransactionsTool } from "@/app/tools/getTransactions";

export const TOOLS =[
    getBalanceTool,
    airdropTool,
    getNFTsTool,
    getTransactionsTool,
]

export const ACTIONS = Object.fromEntries(
    TOOLS.map(tool=>[tool.name,tool])
)