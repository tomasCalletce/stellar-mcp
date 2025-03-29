import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getTokenPrice } from "./lib/get-token-prices.js";
import { GetTokenPriceSchema } from "./lib/get-token-prices.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTvl, GetTvlSchema } from "./lib/get-tvl.js";
import { getStablecoin, GetStablecoinSchema } from "./lib/get-stablecoin.js";

const server = new Server(
  {
    name: "stellar-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-token-price",
        description:
          "Get live price of a token in any supported network. " +
          "Pass the contract address of the token to get the price. " +
          "The price is returned formated in english and in USD. ",
        inputSchema: zodToJsonSchema(GetTokenPriceSchema),
      },
      {
        name: "get-tvl",
        description:
          "Get live TVL in any supported network. " +
          "pass the network name. " +
          "The TVL is returned formated in english and in USD. ",
        inputSchema: zodToJsonSchema(GetTvlSchema),
      },
      {
        name: "get-stablecoin-tvl",
        description:
          "Get live TVL of stablecoins in any supported network. " +
          "Pass the network name. " +
          "The TVL is returned formated in english and in USD. ",
        inputSchema: zodToJsonSchema(GetStablecoinSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get-token-price": {
        const price = await getTokenPrice(args);

        return {
          content: [
            {
              type: "text",
              text: `Price of ${price.symbol}: ${price.price}`,
            },
          ],
        };
      }

      case "get-tvl": {
        const tvl = await getTvl(args);
        return {
          content: [
            {
              type: "text",
              text: `Latest TVL: ${tvl.latestTvl} Daily Change: ${tvl.dailyChange} Weekly Change: ${tvl.weeklyChange}`,
            },
          ],
        };
      }

      case "get-stablecoin-tvl": {
        const usdcTvl = await getStablecoin(args, 2);
        const latestUsdcTvl =
          usdcTvl[usdcTvl.length - 1].totalBridgedToUSD.peggedUSD;
        const usdtTvl = await getStablecoin(args, 3);
        const latestUsdtTvl =
          usdtTvl[usdtTvl.length - 1].totalBridgedToUSD.peggedUSD;
        return {
          content: [
            {
              type: "text",
              text: `USDC TVL: ${latestUsdcTvl} USDT TVL: ${latestUsdtTvl}`,
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
