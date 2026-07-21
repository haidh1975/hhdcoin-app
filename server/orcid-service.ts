import { log } from "./vite";

// Tích hợp hồ sơ khoa học trực tiếp qua ORCID Public API (miễn phí, không cần key). Cache 12h.
const ORCID_ID = process.env.ORCID_ID ?? "0000-0001-5811-7154";

export interface Publication { title: string; year: string | null; type: string; journal: string | null; url: string | null }
export interface OrcidProfile {
  orcidId: string;
  total: number;
  publications: Publication[];
  updatedAt: string;
  source: "live" | "cache" | "unavailable";
}

let cache: OrcidProfile | null = null;
let cacheAt = 0;
const TTL = 12 * 60 * 60 * 1000;

export async function getOrcidProfile(): Promise<OrcidProfile> {
  if (cache && Date.now() - cacheAt < TTL) return { ...cache, source: "cache" };
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
      headers: { accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(to);
    if (!res.ok) throw new Error(`${res.status}`);
    const data: any = await res.json();

    const groups: any[] = data?.group ?? [];
    const pubs: Publication[] = groups.map((g) => {
      const s = g["work-summary"]?.[0] ?? {};
      const title = s.title?.title?.value ?? "(Không tiêu đề)";
      const year = s["publication-date"]?.year?.value ?? null;
      const type = (s.type ?? "work").replace(/-/g, " ");
      const journal = s["journal-title"]?.value ?? null;
      const url = s.url?.value ?? (s["external-ids"]?.["external-id"]?.find((e: any) => e["external-id-type"] === "doi")?.["external-id-url"]?.value ?? null);
      return { title, year, type, journal, url };
    });

    pubs.sort((a, b) => (parseInt(b.year ?? "0") || 0) - (parseInt(a.year ?? "0") || 0));

    const profile: OrcidProfile = {
      orcidId: ORCID_ID,
      total: pubs.length,
      publications: pubs.slice(0, 20),
      updatedAt: new Date().toISOString(),
      source: "live",
    };
    cache = profile; cacheAt = Date.now();
    return profile;
  } catch (err: any) {
    log(`[ORCID] error: ${err.message}`);
    if (cache) return { ...cache, source: "cache" };
    return { orcidId: ORCID_ID, total: 0, publications: [], updatedAt: new Date().toISOString(), source: "unavailable" };
  }
}
