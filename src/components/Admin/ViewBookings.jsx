import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { saveToRecyclingBin, getItemDisplayName } from '../../lib/recyclingBin'
import './ViewBookings.css'

function ViewBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  useEffect(() => {
    loadBookings()
  }, [selectedDate])

  const loadBookings = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings for the selected date
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', selectedDate)
        .order('time', { ascending: true })

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      // If bookings table doesn't exist, use empty array
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return
    }

    try {
      // Get the booking data before deleting
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (!bookingData) {
        throw new Error('Booking not found')
      }

      // Save to recycling bin
      const itemName = getItemDisplayName(bookingData, 'bookings', bookingId)
      
      const { error: recycleError } = await saveToRecyclingBin({
        originalId: bookingId,
        originalTable: 'bookings',
        itemData: bookingData,
        itemName: itemName
      })

      if (recycleError) {
        console.error('Error saving to recycling bin:', recycleError)
        // Continue with deletion even if recycling bin save fails
      }

      // Delete from bookings table
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      // Reload bookings
      loadBookings()
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Error deleting booking: ' + (error.message || 'Unknown error'))
    }
  }

  const handleRefresh = () => {
    loadBookings()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const totalBookings = bookings.length
  const uniqueCustomers = new Set(bookings.map(b => b.phone)).size

  return (
    <div className="view-bookings">
      <div className="bookings-header">
        <h2>View Bookings</h2>
      </div>

      <div className="bookings-controls">
        <div className="bookings-date-input">
          <label>Date</label>
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bookings-date-picker"
            placeholder="DD.MM.YYYY"
          />
        </div>
        <button className="bookings-refresh-btn" onClick={handleRefresh}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bookings-loading">Loading bookings...</div>
      ) : (
        <>
          {bookings.length > 0 && (
            <>
              <div className="bookings-table-header">
                <div className="bookings-col-customer">CUSTOMER</div>
                <div className="bookings-col-phone">PHONE</div>
                <div className="bookings-col-actions">ACTIONS</div>
              </div>

              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bookings-row">
                    <div className="bookings-col-customer">
                      {booking.customer_name || 'Unknown'}
                    </div>
                    <div className="bookings-col-phone">
                      {booking.phone || '-'}
                    </div>
                    <div className="bookings-col-actions">
                      <button
                        className="bookings-delete-btn"
                        onClick={() => handleDelete(booking.id)}
                        title="Delete booking"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bookings-summary">
                <div className="bookings-summary-item">
                  <span className="bookings-summary-number">{totalBookings}</span>
                  <span className="bookings-summary-label">Total Bookings</span>
                </div>
                <div className="bookings-summary-item">
                  <span className="bookings-summary-number customers">{uniqueCustomers}</span>
                  <span className="bookings-summary-label">Total Customers</span>
                </div>
              </div>
            </>
          )}

          {bookings.length === 0 && (
            <div className="bookings-empty">
              <p>No bookings found for {formatDate(selectedDate)}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ViewBookings
