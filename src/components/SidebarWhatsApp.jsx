import React, { useMemo } from 'react'
import { useWhatsappNumber } from '@/hooks/useWhatsappNumber'

export function SidebarWhatsApp({ currentPath }) {
  const whatsappNumber = useWhatsappNumber()
  const message = useMemo(() => {
    const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
    return encodeURIComponent(`Hi, I need help with the system. Page: ${path}`)
  }, [currentPath])

  if (!whatsappNumber) return null

  const href = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title="Chat with Support on WhatsApp"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#22c55e',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        <span role="img" aria-label="WhatsApp">💬</span>
        WhatsApp
      </a>
    </div>
  )
}
