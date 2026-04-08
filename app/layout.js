import './globals.css'

export const metadata = {
  title: 'Clipload — Download Any Video',
  description: 'Paste a link, pick your quality, download instantly. Supports YouTube, TikTok, Instagram, Twitter, Reddit and more.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
