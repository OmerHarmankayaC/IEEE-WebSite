import Image from "next/image";

/** Post cover image, or a light block with the category name when the post has none. */
export function Cover({
  src,
  alt,
  sizes,
  label,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  label?: string | null;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <span className="cover cover--empty" aria-hidden="true">
        <span className="cover__label">{label || "IEEE TEDU"}</span>
      </span>
    );
  }
  return (
    <span className="cover">
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </span>
  );
}
