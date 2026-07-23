import { env } from "./config/env";
import { logger } from "./core/logger";
import { fetchJson } from "./core/http-client";
import { TtlCache } from "./core/cache";

// Tích hợp hồ sơ khoa học trực tiếp qua ORCID Public API (miễn phí, không cần key). Cache 12h.
const ORCID_ID = env.ORCID_ID;

export interface Publication { title: string; year: string | null; type: string; journal: string | null; url: string | null }
export interface OrcidProfile {
  orcidId: string;
  total: number;
  publications: Publication[];
  updatedAt: string;
  source: "live" | "cache" | "unavailable";
}

const cache = new TtlCache<OrcidProfile>(12 * 60 * 60 * 1000); // 12h

export async function getOrcidProfile(): Promise<OrcidProfile> {
  const cached = cache.fresh;
  if (cached) return { ...cached, source: "cache" };
  try {
    const data = await fetchJson<any>(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
      timeoutMs: 9000,
    });

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
    cache.set(profile);
    return profile;
  } catch (err: any) {
    logger.error("ORCID", err, "research");
    const stale = cache.any;
    if (stale) return { ...stale, source: "cache" };
    return { orcidId: ORCID_ID, total: 0, publications: [], updatedAt: new Date().toISOString(), source: "unavailable" };
  }
}
