import web101 from "@/content/workshops/web101-web-scraping";

/** Operating systems the installation guides cover. */
export type OS = "windows" | "macos" | "linux";
export const SYSTEMS: { id: OS; label: string }[] = [
  { id: "windows", label: "Windows" },
  { id: "macos", label: "macOS" },
  { id: "linux", label: "Linux" },
];

/** A paragraph, a command to copy or a link. */
export type Block = string | { code: string; lang?: string } | { href: string; label: string };
export type PerOS<T> = Partial<Record<OS, T>>;

export type Tool = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  url?: string;
  urlLabel?: string;
  extraLinks?: { label: string; url: string }[];
  install: PerOS<Block[]>;
  videos?: PerOS<{ url: string; title: string; thumbnail?: string }>;
  tips?: PerOS<Block[]>;
  verify?: string | PerOS<string | Block[]>;
  published?: boolean;
  order?: number;
};

export type Workshop = {
  slug: string;
  title: string;
  organizer: string;
  summary: string;
  duration?: string;
  audience?: string;
  tools: Tool[];
  published?: boolean;
};

/** To add a workshop: create a file in content/workshops/ and add it to this list. */
const ALL: Workshop[] = [web101];

const visible = <T extends { published?: boolean }>(items: T[]) => items.filter((item) => item.published !== false);

export function getWorkshops(): Workshop[] {
  return visible(ALL);
}

export function getWorkshop(slug: string): Workshop | null {
  const workshop = getWorkshops().find((item) => item.slug === slug);
  if (!workshop) return null;
  const tools = visible(workshop.tools)
    .map((tool, index) => ({ tool, index }))
    .sort((a, b) => (a.tool.order ?? a.index) - (b.tool.order ?? b.index))
    .map(({ tool }) => tool);
  return { ...workshop, tools };
}

/** The YouTube video id of a youtube.com or youtu.be link. */
export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    if (parsed.hostname.endsWith("youtube.com")) return parsed.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}
