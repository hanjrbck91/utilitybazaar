import { Geist, Geist_Mono } from "next/font/google";

/**
 * Shared across both root layouts, so the localized calculator and the
 * supporting pages load one copy of each face rather than two.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
