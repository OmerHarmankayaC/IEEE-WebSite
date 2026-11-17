import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Self-hosted by Next.js at build time, preloaded, with size-matched fallbacks so the
// layout does not jump when the real fonts arrive. latin-ext covers ğ, ş, İ and ı.
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jetbrains-mono", display: "swap" });

export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`;
