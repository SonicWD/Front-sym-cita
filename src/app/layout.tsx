import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Citas Médicas',
  description: 'Aplicación para gestionar citas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="bg-primary text-primary-foreground py-4">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold">Sistema de Citas Médicas</h1>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-secondary text-secondary-foreground py-4 mt-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 Sistema de Citas Médicas. Todos los derechos reservados.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}