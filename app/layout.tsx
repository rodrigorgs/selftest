'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Fragment, ReactNode, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'My App',
//   description: 'Responsive menu example in Next.js 15',
// }

const routes = [
  {
    title: 'Templates',
    href: '/templates',
    requireAdmin: true,
  },
  {
    title: 'Users',
    href: '/users',
    requireAdmin: true,
  },
  {
    title: 'Generate Questions',
    href: '/questionRequests/create',
  },
  {
    title: 'View Questions',
    href: '/questions',
  },
]

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>SelfTest</title>
        <meta name="description" content="SelfTest allows students to test their knowledge leveraging custom, AI-generated questions." />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          <main className="p-4">
            {children}
          </main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-800">
          SelfTest
        </Link>
        <button
          className="md:hidden text-gray-800"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
          {/* <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li> */}
          <MenuItems />
        </ul>
      </div>
      {open && (
        <ul className="md:hidden mt-2 space-y-2 text-gray-700 font-medium">
          {/* <li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link href="/about" onClick={() => setOpen(false)}>About</Link></li>
          <li><Link href="/contact" onClick={() => setOpen(false)}>Contact</Link></li> */}
          <MenuItems onClick={() => setOpen(false)} />
        </ul>
      )}
    </nav>
  )
}

function MenuItems(props: { onClick?: () => void }) {
  const { onClick } = props;
  const { data: session } = useSession();
  const isUserAdmin = () => {
    if (!session || !session.user) return false;
    return session.user.isAdmin === true;
  }

  return session ? (
    <Fragment>
      {routes
        .filter((route => !route.requireAdmin || isUserAdmin()))
        .map((route, index) =>
        (
          <Link key={index} href={route.href} onClick={onClick} className="block px-4 py-2 hover:bg-gray-100">
            {route.title}
          </Link>))}
      <Link href='/api/auth/signout' className="block px-4 py-2 hover:bg-gray-100">{session.user?.email}</Link>
    </Fragment>) : (
    <Link href='/api/auth/signin' >Sign in</Link>
  );

}
