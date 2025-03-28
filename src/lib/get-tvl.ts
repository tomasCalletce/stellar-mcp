import { z } from "zod";

export const GetTvlSchema = z.object({
  network: z.enum(["stellar"]),
});

interface TvlDataPoint {
  date: number;
  tvl: number;
}

interface TvlRequest {
  network: string;
}

interface TvlResponse {
  latestTvl: number;
  dailyChange: number;
  weeklyChange: number;
}

export async function queryTvl(args: TvlRequest): Promise<TvlDataPoint[]> {
  const response = await fetch(
    `https://api.llama.fi/v2/historicalChainTvl/${args.network}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getTvl(
  args: Record<string, unknown> | undefined
): Promise<TvlResponse> {
  const parsed = GetTvlSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for get-tvl: ${parsed.error}`);
  }
  const tvlData = await queryTvl(parsed.data);

  const latestTvl = tvlData[tvlData.length - 1].tvl;

  const oneDayAgoIndex = tvlData.length - 2;
  const oneWeekAgoIndex = tvlData.length - 8;

  const oneDayAgoTvl = tvlData[oneDayAgoIndex]?.tvl || latestTvl;
  const oneWeekAgoTvl = tvlData[oneWeekAgoIndex]?.tvl || latestTvl;

  const dailyChange = ((latestTvl - oneDayAgoTvl) / oneDayAgoTvl) * 100;
  const weeklyChange = ((latestTvl - oneWeekAgoTvl) / oneWeekAgoTvl) * 100;

  return {
    latestTvl,
    dailyChange,
    weeklyChange,
  };
}
