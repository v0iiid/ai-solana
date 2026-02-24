import { airdropTool } from "@/app/tools/airdrop";
import { getBalanceTool } from "@/app/tools/getBalance";
import { getNFTsTool } from "@/app/tools/getNfts";

export const TOOLS =[
    getBalanceTool,
    airdropTool,
    getNFTsTool
]

export const ACTIONS = Object.fromEntries(
    TOOLS.map(tool=>[tool.name,tool])
)