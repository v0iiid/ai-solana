import type { Metadata } from "next";

import "./globals.css";
import { WalletContextProvider } from "./providers";

import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})


export const metadata: Metadata = {
  title: "AskSOL",
  description: "A simple AI tool to ask questions about Solana and perform tasks on the blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} bg-[#262624] ` }
      >
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
