import './globals.css'

export const metadata = {
  title: 'EvoAI Commerce Assistant',
  description: 'AI-powered commerce assistant for product recommendations and order management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
