import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";

export const metadata: Metadata = {
  title: "FARHAD365 - Premium E-Commerce Store",
  description: "Explore curated clothing, footwear, accessories and brands at FARHAD365.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        suppressHydrationWarning
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
