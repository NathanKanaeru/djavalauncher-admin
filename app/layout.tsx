import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DjavaLauncher Admin",
  description: "Admin panel for DjavaLauncher",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
