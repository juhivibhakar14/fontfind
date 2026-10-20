import { notFound } from "next/navigation";
import TestFontsClient from "./client";

export const dynamic = "force-dynamic";

export default function TestFontsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <TestFontsClient />;
}
