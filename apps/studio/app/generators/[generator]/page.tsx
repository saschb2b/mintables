import { notFound } from "next/navigation";
import { bySlug } from "@/lib/registry";
import { generatorSlugs } from "@/lib/generator-slugs";
import { GeneratorPageView } from "./generator-page-view";

export function generateStaticParams() {
  return generatorSlugs.map((generator) => ({ generator }));
}

interface GeneratorPageProps {
  params: Promise<{ generator: string }>;
}

export async function generateMetadata({ params }: GeneratorPageProps) {
  const { generator } = await params;
  if (!(generator in bySlug)) return {};
  const gen = bySlug[generator];
  return {
    title: `${gen.meta.name} — Mintables`,
    description: gen.meta.description,
  };
}

export default async function GeneratorPage({ params }: GeneratorPageProps) {
  const { generator } = await params;
  if (!(generator in bySlug)) {
    notFound();
  }
  return <GeneratorPageView slug={generator} />;
}
