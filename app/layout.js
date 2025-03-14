import React from 'react'
import './globals.css'

export const metadata = {
  title: 'VOID - Espace Client',
  description: 'Espace client pour les clients de VOID',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-gray-100">
        {children}
      </body>
    </html>
  )
} 