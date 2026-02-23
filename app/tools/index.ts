import { getBalanceTool } from "@/app/tools/getBalance";

export const TOOLS =[
    getBalanceTool
]

export const ACTIONS = Object.fromEntries(
    TOOLS.map(tool=>[tool.name,tool])
)