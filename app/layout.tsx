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

  const routes = [
    {
      title: 'Create templates',
      href: '/templates',
      requireAdmin: true,
    },
    {
      title: 'Generate Questions',
      href: '/questionRequests',
    },
    {
      title: 'View Questions',
      href: '/questions',
    },
  ]
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Menu routes={routes}>
            {children}
          </Menu>
        </SessionProvider>
      </body>
    </html>
  );
}

function Menu(props: { children?: React.ReactNode, routes: any[] }) {
  const { children, routes } = props;
  const { data: session } = useSession();
  const isUserAdmin = () => {
    if (!session || !session.user) return false;
    return session.user.isAdmin === true;
  }
  return <div style={{ display: "flex" }}>
    <aside
      style={{
        width: "200px",
        background: "#f4f4f4",
        padding: "1rem",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
      }}
    >
      <SessionMenuItems />
      {routes
        .filter((route => !route.requireAdmin || isUserAdmin()))
        .map((route, index) =>
        (
          <Link key={index} href={route.href}>
            <button
              style={{
                background: "#0070f3",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "1.0rem",
              }}
            >
              {route.title}
            </button>
          </Link>))}
    </aside>
    <main style={{ flex: 1 }}>{children}</main>
  </div>
}

function SessionMenuItems() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button
            onClick={() => signOut()}
            style={{
              background: "#0070f3",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "1.0rem"
            }}
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          style={{
            background: "#0070f3",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1.0rem"
          }}
        >
          Sign In
        </button>
      )}
    </div>
  );
}