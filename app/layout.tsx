'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider, useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { data: session } = useSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div style={{ display: "flex" }}>
            <aside
              style={{
                width: "200px",
                background: "#f4f4f4",
                padding: "1rem",
                boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
              }}
            >
              {/* {session ? ( */}
                <button
                  onClick={() => signOut()}
                  style={{
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              {/* ) : ( */}
                <button
                  onClick={() => signIn()}
                  style={{
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              {/* )} */}
            </aside>
            <main style={{ flex: 1 }}>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
