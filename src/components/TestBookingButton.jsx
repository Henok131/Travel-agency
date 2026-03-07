import { useState } from 'react'

export default function TestBookingButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleTestBooking = async () => {
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/test-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await res.json()
            console.log('Test Booking Response:', data)

            if (data.success) {
                setResult({ type: 'success', message: `Booking created! ID: ${data.data.booking_id}` })
                alert(`✅ Booking created!\nID: ${data.data.booking_id}`)
            } else {
                setResult({ type: 'error', message: data.error })
                alert(`❌ Error: ${data.error}`)
            }
        } catch (err) {
            console.error('Network error:', err)
            setResult({ type: 'error', message: err.message })
            alert(`❌ Network error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <button
                onClick={handleTestBooking}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: loading ? '#999' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? '⏳ Creating...' : '🧪 Test Booking (RPC)'}
            </button>

            {result && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: result.type === 'success' ? '#e8f5e9' : '#ffebee',
                    color: result.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                    {result.message}
                </div>
            )}
        </div>
    )
}
