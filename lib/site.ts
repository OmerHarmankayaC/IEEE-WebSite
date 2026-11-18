/** Site wide settings that rarely change. Edit here, no admin panel needed. */
export const site = {
  email: "ieee@tedu.edu.tr",
  /** Academic year of the current board. */
  currentTerm: "2026-2027",
  /**
   * Wide photo under the hero. Put the file in public/images/ and set its path here
   * (for example "/images/club.jpg"). While this is null the photo band is hidden.
   */
  heroPhoto: null as null | { src: string; caption: { tr: string; en: string } },
  socials: [
    { label: "Instagram", handle: "@ieee.tedu", href: "https://www.instagram.com/ieee.tedu/" },
    { label: "CS", handle: "@ieeeteducomputersociety", href: "https://www.instagram.com/ieeeteducomputersociety/" },
    { label: "RAS", handle: "@tedu.ras", href: "https://www.instagram.com/tedu.ras/" },
    { label: "WIE", handle: "@teduwie", href: "https://www.instagram.com/teduwie/" },
    { label: "LinkedIn", handle: "IEEE TEDU Student Branch", href: "https://www.linkedin.com/company/ieeetedusb/" },
  ],
  committees: [
    {
      id: "cs" as const,
      code: "CS",
      name: "Computer Society",
      logo: "/images/brand/cs-logo.jpg",
      instagram: { handle: "@ieeeteducomputersociety", href: "https://www.instagram.com/ieeeteducomputersociety/" },
    },
    {
      id: "ras" as const,
      code: "RAS",
      name: "Robotics and Automation Society",
      logo: "/images/brand/ras-logo.jpg",
      instagram: { handle: "@tedu.ras", href: "https://www.instagram.com/tedu.ras/" },
    },
    {
      id: "wie" as const,
      code: "WIE",
      name: "Women in Engineering",
      logo: "/images/brand/wie-logo.jpg",
      instagram: { handle: "@teduwie", href: "https://www.instagram.com/teduwie/" },
    },
  ],
};
