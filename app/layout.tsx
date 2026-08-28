import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@/styles/globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlameCity RolePlay",
  description: "Experience a dynamic world where culture, community, and creativity thrive in FlameCity RolePlay",
  openGraph: {
    title: "FlameCity RolePlay",
    description: "Experience a dynamic world where culture, community, and creativity thrive in FlameCity RolePlay",
    url: "https://flamecityroleplay.com",
    images: [
      {
        url: "https://r2.fivemanage.com/vSgbk1zUCvPYJUM2qKhxY/bannerimage.png",
        width: 1200,
        height: 630,
        alt: "FlameCity RolePlay",
      },
    ],
  },
}

export const viewport = {
  themeColor: "#5E23C6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" href="https://r2.fivemanage.com/vSgbk1zUCvPYJUM2qKhxY/image-removebg-preview.png" />
      </head>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
