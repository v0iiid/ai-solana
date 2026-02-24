import { airdropTool } from "@/app/tools/airdrop";
import { getBalanceTool } from "@/app/tools/getBalance";
import { getNFTsTool } from "@/app/tools/getNfts";
import { getTransactionsTool } from "@/app/tools/getTransactions";
import { sendSOLTool } from "@/app/tools/sendSol";

export const TOOLS =[
    getBalanceTool,
    airdropTool,
    getNFTsTool,
    getTransactionsTool,
    sendSOLTool
]

export const ACTIONS = Object.fromEntries(
    TOOLS.map(tool=>[tool.name,tool])
)