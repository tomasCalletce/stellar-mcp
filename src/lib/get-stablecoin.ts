import { z } from "zod";

export const GetStablecoinSchema = z.object({
  network: z.enum(["stellar"]),
});

interface StablecoinResponse {
  date: string;
  totalCirculating: {
    peggedUSD: number;
  };
  totalCirculatingUSD: {
    peggedUSD: number;
  };
  totalBridgedToUSD: {
    peggedUSD: number;
  };
}

export async function queryStablecoin(
  network: string,
  stablecoinId: number
): Promise<StablecoinResponse[]> {
  const response = await fetch(
    `https://stablecoins.llama.fi/stablecoincharts/${network}?stablecoin=${stablecoinId}`,
    {
      headers: {
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getStablecoin(
  args: Record<string, unknown> | undefined,
  stablecoinId: number
) {
  const parsed = GetStablecoinSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for get-stablecoin: ${parsed.error}`);
  }
  const stablecoin = await queryStablecoin(parsed.data.network, stablecoinId);
  return stablecoin;
}
