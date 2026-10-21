import { notFound } from "next/navigation";
import FontDetail from "@/components/font-detail";
import { meta } from "@/lib/seo";
import { getFonts } from "@/lib/fonts/api";
import { slug } from "@/lib/fonts/data";
type P = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  return (await getFonts()).map((f) => ({ slug: slug(f.family) }));
}
export async function generateMetadata({ params }: P) {
  const s = (await params).slug,
    f = (await getFonts()).find((x) => slug(x.family) === s);
  if (!f) return {};
  return meta(
    `${f.family} Font – Similar Fonts & Pairings`,
    `Preview ${f.family}, copy its CSS, and find fonts similar to ${f.family} plus pairings that work well with it.`,
    `/fonts/${s}`,
  );
}
export default async function Page({ params }: P) {
  const s = (await params).slug,
    fonts = await getFonts(),
    f = fonts.find((x) => slug(x.family) === s);
  if (!f) notFound();
  return <FontDetail font={f} fonts={fonts} />;
}
