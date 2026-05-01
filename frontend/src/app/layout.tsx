import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VegaStack - Social Network",
  description: "Share your moments with the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
