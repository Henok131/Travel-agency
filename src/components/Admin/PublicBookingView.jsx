import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import './PublicBookingView.css'

function PublicBookingView() {
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    loadAvailableSlots()
  }, [selectedDate])

  const loadAvailableSlots = async () => {
    try {
      setLoading(true)
      setBookingSuccess(false)

      // Fetch open time slots for the selected date
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', selectedDate)
        .eq('status', 'open')
        .order('time', { ascending: true })

      if (error) throw error

      setAvailableSlots(data || [])
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = async (slot) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number')
      return
    }

    try {
      // Check if slot is still available
      const { data: slotData, error: slotError } = await supabase
        .from('time_slots')
        .select('status')
        .eq('id', slot.id)
        .single()

      if (slotError) throw slotError

      if (slotData.status !== 'open') {
        alert('This slot is no longer available')
        loadAvailableSlots()
        return
      }

      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          date: selectedDate,
          time: slot.time,
          customer_name: customerName.trim(),
          phone: customerPhone.trim(),
          status: 'confirmed',
          created_at: new Date().toISOString()
        }])

      if (bookingError) throw bookingError

      // Close the slot
      await supabase
        .from('time_slots')
        .update({ status: 'closed' })
        .eq('id', slot.id)

      setBookingSuccess(true)
      setCustomerName('')
      setCustomerPhone('')
      setSelectedSlot(null)
      
      // Reload slots
      setTimeout(() => {
        loadAvailableSlots()
        setBookingSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error booking slot:', error)
      alert('Error booking slot. Please try again.')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  return (
    <div className="public-booking-view">
      <div className="public-booking-header">
        <h2>Book an Appointment</h2>
        <p>Select an available time slot</p>
      </div>

      <div className="public-booking-controls">
        <div className="public-booking-date-input">
          <label>Select Date</label>
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="public-booking-date-picker"
            placeholder="DD.MM.YYYY"
          />
        </div>
      </div>

      {bookingSuccess && (
        <div className="public-booking-success">
          ✓ Booking confirmed successfully!
        </div>
      )}

      {loading ? (
        <div className="public-booking-loading">Loading available slots...</div>
      ) : (
        <>
          {availableSlots.length > 0 ? (
            <>
              <div className="public-booking-form">
                <div className="public-booking-form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="public-booking-input"
                  />
                </div>
                <div className="public-booking-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="public-booking-input"
                  />
                </div>
              </div>

              <div className="public-booking-slots-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    className={`public-booking-slot ${selectedSlot === slot.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSlot(slot.id)
                      handleBookSlot(slot)
                    }}
                    disabled={!customerName.trim() || !customerPhone.trim()}
                  >
                    <div className="public-booking-slot-time">{slot.time}</div>
                    <div className="public-booking-slot-date">{formatDate(slot.date)}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="public-booking-empty">
              <p>No available slots for {formatDate(selectedDate)}</p>
              <p className="public-booking-empty-hint">Try selecting a different date</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PublicBookingView
