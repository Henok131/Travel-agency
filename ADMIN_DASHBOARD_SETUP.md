# Admin Dashboard Setup Guide

## Overview

The unified admin dashboard provides a single interface for managing your hair salon booking system. It includes:

- **Persistent Login**: Once logged in, you stay logged in across browser sessions (24-hour session)
- **Unified Interface**: All admin and public features in one place
- **Mobile Responsive**: Optimized layout for mobile devices
- **Time Slot Management**: Open/close time slots for booking
- **Booking Management**: View and manage customer bookings
- **Public View**: See how customers see the booking interface

## Setup Instructions

### 1. Database Setup

Run the migration file to create the necessary tables:

```sql
-- Run this file in your Supabase SQL editor
009_create_admin_tables.sql
```

This creates:
- `time_slots` table - for managing available booking slots
- `bookings` table - for storing customer appointments

### 2. Authentication Setup

The admin dashboard uses simple authentication with hardcoded credentials. **For production, you should:**

1. Update `src/contexts/AuthContext.jsx` to use Supabase Auth or your backend
2. Store credentials securely (environment variables or database)
3. Implement proper password hashing

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

To change credentials, edit the `validCredentials` object in `src/contexts/AuthContext.jsx`:

```javascript
const validCredentials = {
  admin: 'your-secure-password',
  // Add more users as needed
}
```

### 3. Access the Admin Dashboard

1. Navigate to `/admin/login` in your browser
2. Enter your credentials
3. You'll be redirected to `/admin` dashboard
4. Your session persists for 24 hours

## Features

### View Bookings
- View all bookings for a selected date
- Delete bookings
- See total bookings and unique customers count
- Refresh to get latest data

### Manage Time Slots
- Filter by date (Today, Tomorrow, This Week)
- Toggle slots between OPEN and CLOSED
- Closed slots won't appear in public booking view
- Slots are automatically generated (9:00 AM to 6:00 PM, every 20 minutes)

### Public View
- See how customers see the booking interface
- Test booking flow
- View available slots
- Book appointments (creates booking and closes slot)

## Mobile Experience

The dashboard is fully responsive:

- **Mobile Header**: Hamburger menu for navigation
- **Touch-Friendly**: Large buttons and touch targets
- **Optimized Layout**: Stacked layout on small screens
- **Swipe Gestures**: Easy navigation between sections

## Session Management

- Sessions persist for **24 hours**
- Stored in `localStorage`
- Automatically checks session validity on page load
- Logout clears session immediately

## Security Notes

⚠️ **Important for Production:**

1. **Change Default Credentials**: Update the hardcoded credentials
2. **Use Supabase Auth**: Implement proper authentication with Supabase Auth
3. **Row Level Security**: RLS policies are set up but may need adjustment based on your needs
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Store sensitive data in environment variables

## File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # Authentication context
├── pages/
│   ├── AdminLogin.jsx           # Login page
│   ├── AdminLogin.css
│   ├── AdminDashboard.jsx       # Main dashboard
│   └── AdminDashboard.css
└── components/
    └── Admin/
        ├── ManageTimeSlots.jsx  # Time slot management
        ├── ManageTimeSlots.css
        ├── ViewBookings.jsx     # Booking viewer
        ├── ViewBookings.css
        ├── PublicBookingView.jsx # Public booking interface
        └── PublicBookingView.css
```

## Troubleshooting

### Can't Login
- Check credentials are correct
- Clear browser localStorage and try again
- Check browser console for errors

### Time Slots Not Showing
- Ensure database migration ran successfully
- Check Supabase connection
- Verify RLS policies allow access

### Bookings Not Appearing
- Check date filter is correct
- Verify bookings table exists
- Check RLS policies

### Session Expired
- Sessions last 24 hours
- Simply login again
- Check system time is correct

## Next Steps

1. **Customize Branding**: Update logo and colors in CSS files
2. **Add More Features**: Extend with notifications, email confirmations, etc.
3. **Improve Security**: Implement Supabase Auth
4. **Add Analytics**: Track booking trends and statistics
5. **Email Notifications**: Send confirmation emails to customers

## Support

For issues or questions, check:
- Browser console for errors
- Supabase logs for database errors
- Network tab for API issues
