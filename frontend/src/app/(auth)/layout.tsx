import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, rgba(26, 188, 156, 0.08) 0%, rgba(29, 196, 233, 0.08) 100%)',
      }}
    >
      {children}
    </div>
  )
}
