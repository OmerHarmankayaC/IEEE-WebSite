import Image from "next/image";

/** Post cover image, or a light block with a yellow circle when the post has none. */
export function Cover({ src, alt, sizes, priority = false }: { src: string | null; alt: string; sizes: string; priority?: boolean }) {
  if (!src) return <span className="cover cover--empty" aria-hidden="true" />;
  return (
    <span className="cover">
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </span>
  );
}
