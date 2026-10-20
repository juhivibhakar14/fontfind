export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://typematcher.com";
export const meta = (title: string, description: string, path: string) => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title,
    description,
    url: SITE + path,
    siteName: "TypeMatcher",
    type: "website" as const,
  },
  twitter: {
    card: "summary_large_image" as const,
    title,
    description,
  },
});

