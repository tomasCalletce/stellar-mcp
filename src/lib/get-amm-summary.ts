import { z } from "zod";

export const GetStablecoinSchema = z.object({
  protocol: z.enum(["lumenswap"]),
});

export async function queryAmmSummary(protocol: string) {
  const response = await fetch(
    `https://api.llama.fi/summary/dexs/${protocol}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume`,
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

export async function getAmmSummary(args: Record<string, unknown> | undefined) {
  const parsed = GetStablecoinSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for get-amm-summary: ${parsed.error}`);
  }
  const ammSummary = await queryAmmSummary(parsed.data.protocol);
  return ammSummary;
}
