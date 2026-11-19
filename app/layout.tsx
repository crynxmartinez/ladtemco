import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ladtemco Cooperative System",
  description: "Local cooperative management and transparency system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
