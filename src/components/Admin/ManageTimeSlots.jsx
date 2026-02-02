import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { saveToRecyclingBin, getItemDisplayName } from '../../lib/recyclingBin'
import './ManageTimeSlots.css'

function ManageTimeSlots() {
  const [timeSlots, setTimeSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('tomorrow')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingDetail, setShowBookingDetail] = useState(false)

  useEffect(() => {
    loadTimeSlots()
  }, [dateFilter])

  const loadTimeSlots = async () => {
    try {
      setLoading(true)
      
      // Calculate the target date based on filter
      const targetDate = getTargetDate(dateFilter)
      setSelectedDate(targetDate)
      const dateStr = targetDate.toISOString().split('T')[0]

      // Generate time slots for the selected date if they don't exist
      await ensureTimeSlotsExist(targetDate)

      // Fetch time slots and bookings in parallel
      const [slotsResult, bookingsResult] = await Promise.all([
        supabase
          .from('time_slots')
          .select('*')
          .eq('date', dateStr)
          .order('time', { ascending: true }),
        supabase
          .from('bookings')
          .select('*')
          .eq('date', dateStr)
          .order('time', { ascending: true })
      ])

      if (slotsResult.error) throw slotsResult.error
      if (bookingsResult.error) {
        // Bookings table might not exist, that's okay
        console.warn('Bookings table not found:', bookingsResult.error)
      }

      setTimeSlots(slotsResult.data || [])
      setBookings(bookingsResult.data || [])
    } catch (error) {
      console.error('Error loading time slots:', error)
      alert('Error loading time slots')
    } finally {
      setLoading(false)
    }
  }

  const getBookingForSlot = (slot) => {
    return bookings.find(b => b.date === slot.date && b.time === slot.time)
  }

  const getSlotStatus = (slot) => {
    const booking = getBookingForSlot(slot)
    if (booking) return 'booked'
    return slot.status // 'open' or 'closed'
  }

  const getTargetDate = (filter) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (filter) {
      case 'today':
        return new Date(today)
      case 'tomorrow':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      case 'thisWeek':
        const thisWeek = new Date(today)
        const dayOfWeek = thisWeek.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        thisWeek.setDate(thisWeek.getDate() - daysToMonday)
        return thisWeek
      default:
        const defaultTomorrow = new Date(today)
        defaultTomorrow.setDate(defaultTomorrow.getDate() + 1)
        return defaultTomorrow
    }
  }

  const ensureTimeSlotsExist = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      
      // Check if slots exist for this date
      const { data: existing } = await supabase
        .from('time_slots')
        .select('id')
        .eq('date', dateStr)
        .limit(1)

      if (existing && existing.length > 0) {
        return // Slots already exist
      }

      // Generate slots for the day (9:00 to 18:00, every 20 minutes)
      const slots = []
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 20) {
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
          slots.push({
            date: dateStr,
            time: timeStr,
            status: 'open',
            created_at: new Date().toISOString()
          })
        }
      }

      // Insert slots
      const { error } = await supabase
        .from('time_slots')
        .insert(slots)

      if (error) throw error
    } catch (error) {
      console.error('Error ensuring time slots exist:', error)
    }
  }

  const toggleSlotStatus = async (slotId, currentStatus) => {
    // Don't toggle if slot is booked
    const slot = timeSlots.find(s => s.id === slotId)
    if (slot && getBookingForSlot(slot)) {
      // Show booking details instead
      handleSlotClick(slot)
      return
    }

    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open'
      
      const { error } = await supabase
        .from('time_slots')
        .update({ status: newStatus })
        .eq('id', slotId)

      if (error) throw error

      // Update local state
      setTimeSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, status: newStatus } : slot
      ))
    } catch (error) {
      console.error('Error updating slot status:', error)
      alert('Error updating slot status')
    }
  }

  const handleSlotClick = (slot) => {
    const booking = getBookingForSlot(slot)
    if (booking) {
      setSelectedBooking(booking)
      setShowBookingDetail(true)
    } else {
      // Toggle open/closed for non-booked slots
      toggleSlotStatus(slot.id, slot.status)
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
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

      // Delete booking
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (deleteError) throw deleteError

      // Reopen the time slot
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        const slot = timeSlots.find(s => s.date === booking.date && s.time === booking.time)
        if (slot) {
          await supabase
            .from('time_slots')
            .update({ status: 'open' })
            .eq('id', slot.id)
        }
      }

      // Reload data
      loadTimeSlots()
      setShowBookingDetail(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Error canceling booking')
    }
  }

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  return (
    <div className="manage-time-slots">
      <div className="time-slots-header">
        <h2>MANAGE TIME SLOTS</h2>
        <p>Open or close time slots. Closed slots won't appear for booking.</p>
      </div>

      <div className="time-slots-filter">
        <label>Filter by:</label>
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          className="time-slots-date-select"
        >
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="thisWeek">This Week</option>
        </select>
      </div>

      {loading ? (
        <div className="time-slots-loading">Loading time slots...</div>
      ) : (
        <>
          <div className="time-slots-grid">
            {timeSlots.map((slot) => {
              const slotStatus = getSlotStatus(slot)
              const booking = getBookingForSlot(slot)
              
              return (
                <button
                  key={slot.id}
                  className={`time-slot-card ${slotStatus}`}
                  onClick={() => handleSlotClick(slot)}
                >
                  <div className="time-slot-date">{formatDate(slot.date)}</div>
                  <div className="time-slot-time">
                    {slot.time}
                    {booking && (
                      <svg className="time-slot-phone-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    )}
                  </div>
                  <div className="time-slot-status">{slotStatus.toUpperCase()}</div>
                  {booking && (
                    <div className="time-slot-customer-preview">
                      {booking.customer_name ? `${booking.customer_name.substring(0, 8)}...` : ''}
                      {booking.phone ? ` ${booking.phone.substring(0, 8)}...` : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Booking Detail Modal */}
          {showBookingDetail && selectedBooking && (
            <div className="booking-detail-overlay" onClick={() => setShowBookingDetail(false)}>
              <div className="booking-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="booking-detail-header">
                  <h3>Booking Details</h3>
                  <button 
                    className="booking-detail-close"
                    onClick={() => setShowBookingDetail(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="booking-detail-content">
                  <div className="booking-detail-item">
                    <label>Date & Time</label>
                    <div className="booking-detail-value">
                      {formatDate(selectedBooking.date)} at {selectedBooking.time}
                    </div>
                  </div>

                  <div className="booking-detail-item">
                    <label>Customer Name</label>
                    <div className="booking-detail-value">
                      {selectedBooking.customer_name || 'Not provided'}
                    </div>
                  </div>

                  <div className="booking-detail-item">
                    <label>Phone Number</label>
                    <div className="booking-detail-value phone-number">
                      {selectedBooking.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="booking-detail-item">
                    <label>Status</label>
                    <div className="booking-detail-value">
                      <span className={`status-badge status-${selectedBooking.status || 'confirmed'}`}>
                        {(selectedBooking.status || 'confirmed').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-detail-actions">
                  {selectedBooking.phone && (
                    <button 
                      className="booking-detail-call-btn"
                      onClick={() => handleCall(selectedBooking.phone)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Call Customer
                    </button>
                  )}
                  <button 
                    className="booking-detail-cancel-btn"
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && timeSlots.length === 0 && (
        <div className="time-slots-empty">
          <p>No time slots found for the selected date.</p>
        </div>
      )}
    </div>
  )
}

export default ManageTimeSlots
