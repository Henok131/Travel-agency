const jsonHeaders = { 'Content-Type': 'application/json' }

const handleResponse = async (resp) => {
  const body = await resp.json().catch(() => ({}))
  if (!resp.ok || body?.error) {
    const message = body?.error || resp.statusText || 'Amadeus proxy error'
    const error = new Error(message)
    error.details = body?.details || body
    throw error
  }
  return body
}

export const amadeusHold = async (payload) => {
  console.log('🟡 PNR create request', payload)
  const resp = await fetch('/api/amadeus/hold', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
  const body = await handleResponse(resp)
  console.log('🟡 PNR created', body?.data?.amadeus_pnr || body?.data?.amadeus_order_id || body?.data?.id)
  return body
}

export const amadeusTicket = async (payload) => {
  console.log('🟢 Ticket issue request', payload)
  const resp = await fetch('/api/amadeus/ticket', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
  const body = await handleResponse(resp)
  console.log('🟢 Ticket issued', body?.data?.amadeus_ticket_number || body?.data?.amadeus_order_id || body?.data?.id)
  return body
}

export const amadeusSearch = async (payload) => {
  const requestPayload = {
    adults: 1,
    children: 0,
    infants: 0,
    currencyCode: 'EUR',
    travelClass: 'ECONOMY',
    nonStop: false,
    ...payload
  }

  console.log('🔍 Amadeus search', requestPayload)
  const resp = await fetch('/api/amadeus/search', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(requestPayload)
  })
  return handleResponse(resp)
}
