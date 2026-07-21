import { log } from "./vite";

// Dữ liệu kinh tế Việt Nam từ World Bank API (miễn phí, không cần key). Cache 6h.
const INDICATORS: { key: string; code: string; label: string; unit: string }[] = [
  { key: "gdpGrowth", code: "NY.GDP.MKTP.KD.ZG", label: "Tăng trưởng GDP", unit: "%" },
  { key: "gdp", code: "NY.GDP.MKTP.CD", label: "GDP", unit: "USD" },
  { key: "gdpPerCapita", code: "NY.GDP.PCAP.CD", label: "GDP/người", unit: "USD" },
  { key: "cpi", code: "FP.CPI.TOTL.ZG", label: "Lạm phát (CPI)", unit: "%" },
  { key: "unemployment", code: "SL.UEM.TOTL.ZS", label: "Thất nghiệp", unit: "%" },
  { key: "population", code: "SP.POP.TOTL", label: "Dân số", unit: "người" },
  { key: "exports", code: "NE.EXP.GNFS.CD", label: "Xuất khẩu HH&DV", unit: "USD" },
  { key: "fdi", code: "BX.KLT.DINV.CD.WD", label: "FDI ròng", unit: "USD" },
];

export interface VnIndicator { key: string; label: string; unit: string; value: number | null; year: string | null }
export interface VnEconomy { country: string; indicators: VnIndicator[]; updatedAt: string; source: "live" | "cache" | "mock" }

let cache: VnEconomy | null = null;
let cacheAt = 0;
const TTL = 6 * 60 * 60 * 1000;

async function fetchIndicator(code: string): Promise<{ value: number | null; year: string | null }> {
  try {
    const url = `https://api.worldbank.org/v2/country/VNM/indicator/${code}?format=json&mrnev=1`;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(to);
    if (!res.ok) return { value: null, year: null };
    const data: any = await res.json();
    const row = data?.[1]?.[0];
    return { value: row?.value ?? null, year: row?.date ?? null };
  } catch {
    return { value: null, year: null };
  }
}

const MOCK: Record<string, { value: number; year: string }> = {
  gdpGrowth: { value: 7.09, year: "2024" }, gdp: { value: 4.76e11, year: "2024" },
  gdpPerCapita: { value: 4700, year: "2024" }, cpi: { value: 3.63, year: "2024" },
  unemployment: { value: 2.2, year: "2024" }, population: { value: 1.005e8, year: "2024" },
  exports: { value: 3.74e11, year: "2024" }, fdi: { value: 1.8e10, year: "2024" },
};

export async function getVnEconomy(): Promise<VnEconomy> {
  if (cache && Date.now() - cacheAt < TTL) return { ...cache, source: "cache" };
  try {
    const results = await Promise.all(INDICATORS.map((i) => fetchIndicator(i.code)));
    let liveCount = 0;
    const indicators: VnIndicator[] = INDICATORS.map((i, idx) => {
      let { value, year } = results[idx];
      if (value == null) { value = MOCK[i.key].value; year = MOCK[i.key].year; }
      else liveCount++;
      return { key: i.key, label: i.label, unit: i.unit, value, year };
    });
    const eco: VnEconomy = {
      country: "Việt Nam",
      indicators,
      updatedAt: new Date().toISOString(),
      source: liveCount > 0 ? "live" : "mock",
    };
    cache = eco; cacheAt = Date.now();
    return eco;
  } catch (err: any) {
    log(`[VnEconomy] error: ${err.message}`);
    if (cache) return { ...cache, source: "cache" };
    return {
      country: "Việt Nam", source: "mock", updatedAt: new Date().toISOString(),
      indicators: INDICATORS.map((i) => ({ key: i.key, label: i.label, unit: i.unit, value: MOCK[i.key].value, year: MOCK[i.key].year })),
    };
  }
}
