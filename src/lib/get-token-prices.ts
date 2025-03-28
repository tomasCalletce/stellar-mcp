import { z } from "zod";

export const GetTokenPriceSchema = z.object({
  address: z.string(),
  network: z.enum(["stellar"]),
});

interface TokenPrice {
  decimals: number;
  price: number;
  symbol: string;
  timestamp: number;
  confidence?: number;
}

interface TokenPriceResponse {
  coins: {
    [key: string]: TokenPrice;
  };
}

export async function queryTokenPrice(
  contractAddress: string,
  network: string
): Promise<TokenPrice> {
  const baseUrl = "https://coins.llama.fi";
  const endpoint = "/prices/current";
  const chainPrefix = network;

  const tokenIdentifier = `${chainPrefix}:${contractAddress}`;

  const response = await fetch(`${baseUrl}${endpoint}/${tokenIdentifier}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as TokenPriceResponse;

  return data.coins[tokenIdentifier];
}

export async function getTokenPrice(
  args: Record<string, unknown> | undefined
): Promise<TokenPrice> {
  const parsed = GetTokenPriceSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for get-token-price: ${parsed.error}`);
  }
  const price = await queryTokenPrice(parsed.data.address, parsed.data.network);

  return price;
}
