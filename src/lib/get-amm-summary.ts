import { z } from "zod";

export const GetAmmSummarySchema = z.object({
  protocol: z.enum(["lumenswap", "aquarius-stellar"]),
});

export interface DefilllamaAmmSummary {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string | null;
  gecko_id: string;
  cmcId: string;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  listedAt: number;
  github: string[];
  defillamaId: string;
  disabled: boolean;
  displayName: string;
  methodologyURL: string;
  methodology: {
    UserFees: string;
    Fees: string;
    Revenue: string;
    ProtocolRevenue: string;
    HoldersRevenue: string;
    SupplySideRevenue: string;
  };
  forkedFrom: string | null;
  audit_links: string | null;
  versionKey: string | null;
  governanceID: string | null;
  treasury: string | null;
  parentProtocol: string | null;
  previousNames: string | null;
  latestFetchIsOk: boolean;
  slug: string;
  protocolType: string;
  total24h: number;
  total48hto24h: number;
  total7d: number;
  totalAllTime: number;
  totalDataChart: any[];
  totalDataChartBreakdown: any[];
  change_1d: number;
}

export const GetStablecoinSchema = z.object({
  protocol: z.enum(["lumenswap"]),
});

export async function queryAmmSummary(
  protocol: string
): Promise<DefilllamaAmmSummary> {
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

export async function getAmmSummary(
  args: Record<string, unknown> | undefined
): Promise<DefilllamaAmmSummary> {
  const parsed = GetStablecoinSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments for get-amm-summary: ${parsed.error}`);
  }
  const ammSummary = await queryAmmSummary(parsed.data.protocol);
  return ammSummary;
}
