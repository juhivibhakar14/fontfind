export const dynamic = "force-dynamic";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();

  if (!client) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Remove any leading "ca-" prefix (e.g. ca-pub-1234567890 -> pub-1234567890)
  const pubId = client.replace(/^ca-/, "");

  return new Response(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
