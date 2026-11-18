import { BIZ_UDPGothic, BIZ_UDPMincho, Dela_Gothic_One } from "next/font/google";

// Japanese typefaces whose Latin sets cover Turkish (ğ, ş, İ, ı). Self-hosted by
// Next.js at build time; only the latin and latin-ext slices are preloaded.
// Dela Gothic One: display headings. BIZ UDPMincho: reading text. BIZ UDPGothic: interface text.
const dela = Dela_Gothic_One({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-dela", display: "swap" });
const mincho = BIZ_UDPMincho({ weight: ["400", "700"], subsets: ["latin", "latin-ext"], variable: "--font-mincho", display: "swap" });
const gothic = BIZ_UDPGothic({ weight: ["400", "700"], subsets: ["latin", "latin-ext"], variable: "--font-gothic", display: "swap" });

export const fontVariables = `${dela.variable} ${mincho.variable} ${gothic.variable}`;
