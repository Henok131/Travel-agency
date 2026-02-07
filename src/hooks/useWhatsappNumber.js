import { useEffect, useState } from 'react'
import { getAppSetting } from '@/lib/appSettings'

export function useWhatsappNumber() {
  const [number, setNumber] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const settings = await getAppSetting('invoice_settings', null)
        const raw = settings?.whatsapp_number || ''
        const normalized = typeof raw === 'string' ? raw.trim() : ''
        if (/^\+\d+$/.test(normalized)) {
          if (mounted) setNumber(normalized)
        } else if (mounted) {
          setNumber(null)
        }
      } catch (err) {
        if (mounted) setNumber(null)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return number
}
