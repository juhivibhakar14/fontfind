import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getFonts } from "@/lib/fonts/api";
import { slug } from "@/lib/fonts/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const f = await getFonts();
  const fontLimit = Number(process.env.SITEMAP_FONT_LIMIT ?? 50);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE}/fonts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const fontRoutes: MetadataRoute.Sitemap = f.slice(0, fontLimit).map((font) => ({
    url: `${SITE}/fonts/${slug(font.family)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...fontRoutes];
}
