import Image from "next/image";

/** Post cover image, or a hatched placeholder when the post has none. */
export function Cover({ src, alt, sizes, priority = false }: { src: string | null; alt: string; sizes: string; priority?: boolean }) {
  if (!src) return <span className="cover hatch" aria-hidden="true" style={{ display: "block" }} />;
  return (
    <span className="cover media" style={{ display: "block" }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </span>
  );
}
