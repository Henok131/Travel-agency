import { useState, useEffect } from 'react'

// Use same-origin /api when empty (Vite proxy) so we don't trigger failed fetch from wrong host
const API = import.meta.env.VITE_API_URL || ''

/**
 * Fetches /api/health and returns whether the flight provider (e.g. Amadeus) is available.
 * When ENV_PROVIDER=NONE, backend sets flightProviderAvailable: false.
 * On network error we treat as unavailable so flight actions stay disabled.
 */
export function useFlightProviderAvailable() {
  const [available, setAvailable] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const url = API ? `${API.replace(/\/$/, '')}/api/health` : '/api/health'
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setAvailable(d.flightProviderAvailable !== false)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailable(false) // backend unreachable → treat as unavailable, no Amadeus calls
          setLoaded(true)
        }
      })
    return () => { cancelled = true }
  }, [])

  return { flightProviderAvailable: available, loaded }
}
