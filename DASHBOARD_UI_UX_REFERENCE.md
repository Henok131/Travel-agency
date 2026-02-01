# Dashboard UI/UX Design Reference
## Target Design Patterns for Travel Agency Dashboard

---

## Design Patterns to Implement

### 1. KPI Cards Grid (2x4 Layout)

**Structure:**
- 8 KPI cards in a 2-row, 4-column grid
- Each card contains:
  - **Title**: Uppercase, bold (e.g., "TOTAL REVENUE")
  - **Value**: Large, prominent number (e.g., "€79.5K")
  - **Detail Text**: Smaller text below value (e.g., "12.5% vs last month")
  - **Icon**: Colored icon in rounded square background
  - **Trend Indicator**: Arrow (↑/↓) with percentage change

**Visual Features:**
- Dark theme background
- Cards have subtle borders/shadows
- Color-coded icons (green for positive, orange for neutral/warning, red for negative)
- Highlighted cards can have colored borders (orange for warnings)
- Clean, minimalist design
- Icons in rounded squares with matching background colors

**Travel Agency Adaptations:**
- TOTAL REVENUE → Total Bookings Revenue
- GROSS PROFIT → Net Profit
- COGS → Total Expenses
- INVENTORY VALUE → Total Bookings Value
- ORDERS → Total Bookings Count
- STOCK TURNOVER → Booking Conversion Rate
- LOW STOCK → Pending Payments / Outstanding Bookings
- OVERSTOCK → Overbooked / Cancelled Bookings

---

### 2. Revenue Trend Chart with Toggle Buttons

**Structure:**
- Large left panel with chart
- Title: "Revenue Trend" (large, bold, white)
- Subtitle: Descriptive text (smaller, lighter)
- **Toggle Buttons**: Pill-shaped buttons in top-right
  - Options: "Revenue", "Profit", "Compare"
  - Active button is highlighted
  - Inactive buttons are subtle

**Chart Features:**
- Line chart with filled area beneath
- Smooth, flowing line
- Area fill with gradient/transparency
- Y-axis: Currency values (€0, €750, €2K, €3K)
- X-axis: Date labels (formatted dates)
- Golden/yellow color scheme for revenue line
- Dark background

**Travel Agency Adaptations:**
- Revenue Trend → Booking Revenue Trend
- Show daily/weekly/monthly revenue over time
- Toggle between Revenue, Profit, and Compare views
- Compare current vs previous period

---

### 3. Revenue by Category (Donut Chart with Toggle)

**Structure:**
- Right panel (smaller than trend chart)
- Title: "Revenue by Category" (large, bold, white)
- Subtitle: "Top 5 categories • Total €79.5K"
- **Toggle Buttons**: "Donut" and "Bar" views
  - Active button highlighted
  - Switches between chart types

**Donut Chart Features:**
- Donut/pie chart with hole in center
- Top 5 categories displayed
- Each segment:
  - Color-coded (orange, green, blue, purple, red)
  - Label with percentage (e.g., "Coffee 41%")
  - Text color matches segment color
- Legend or labels positioned around chart

**Travel Agency Adaptations:**
- Categories → Revenue Sources (Airlines, Service Fees, Visa Fees, etc.)
- Or → Destination Categories
- Or → Booking Types (Individual, Group, Corporate)
- Show top 5 revenue sources

---

### 4. Stock Movement Area Chart

**Structure:**
- Left panel: "Stock Movement"
- Subtitle: "Stock In vs Stock Out trend"
- **Area Chart** with two overlapping filled areas:
  - Stock In (Green line/area)
  - Stock Out (Red line/area)
- Current totals displayed: "In: 1,915" and "Out: 2,071"
- X-axis: Dates (formatted)
- Y-axis: Quantity (0-600)

**Visual Features:**
- Two overlapping area charts
- Green for incoming, Red for outgoing
- Smooth curves
- Filled areas with transparency
- Clear legend/indicators

**Travel Agency Adaptations:**
- Stock In → New Bookings / Bookings Created
- Stock Out → Completed Bookings / Bookings Fulfilled
- Or → Revenue In vs Expenses Out
- Show booking flow trends

---

### 5. Stock Health Donut Chart

**Structure:**
- Right panel: "Stock Health"
- Subtitle: "190 total SKUs" (or equivalent metric)
- **Donut Chart** with central value: "83% Healthy"
- **Legend with Icons:**
  - Healthy (Green checkmark): 158 SKUs
  - Low (Yellow warning triangle): 17 SKUs
  - Critical (Red cross): 5 SKUs
  - Overstock (Blue box): 8 SKUs
  - Dead (Grey skull): 2 SKUs

**Visual Features:**
- Large percentage in center
- Color-coded segments
- Icons for each category
- Legend with counts
- Green = healthy, Yellow = warning, Red = critical, Blue = overstock, Grey = dead

**Travel Agency Adaptations:**
- Stock Health → Booking Health / Payment Status
- Categories:
  - Healthy → Paid Bookings
  - Low → Pending Payments
  - Critical → Overdue Payments
  - Overstock → Overbooked
  - Dead → Cancelled
- Or → Destination Health (Popular, Moderate, Low, Critical, Inactive)

---

## Common UI/UX Patterns

### Color Scheme
- **Dark Background**: Deep dark theme
- **Text Colors**: 
  - White for titles
  - Light gray for subtitles/details
- **Accent Colors**:
  - Green: Positive/Healthy
  - Yellow/Orange: Warning/Neutral
  - Red: Negative/Critical
  - Blue: Information/Neutral
  - Purple: Secondary categories
  - Grey: Inactive/Dead

### Typography
- **Titles**: Large, bold, white (sans-serif)
- **Subtitles**: Smaller, lighter gray
- **Values**: Very large, prominent numbers
- **Details**: Small, secondary text

### Interactive Elements
- **Toggle Buttons**: Pill-shaped, rounded
  - Active: Highlighted/filled
  - Inactive: Outlined/subtle
- **Hover Effects**: Subtle transitions
- **Icons**: Rounded square backgrounds
  - Matching color scheme
  - Consistent sizing

### Layout
- **Grid System**: Clean, organized grids
- **Card Design**: Subtle borders, shadows
- **Spacing**: Generous padding and margins
- **Responsive**: Adapts to screen size

### Charts
- **Smooth Lines**: Curved, flowing
- **Filled Areas**: Gradient/transparency
- **Clear Labels**: Readable, positioned well
- **Legends**: Clear, color-coded
- **Tooltips**: On hover (implied)

---

## Implementation Notes

### Components Needed
1. **KPI Card Component**: Reusable card with icon, value, detail
2. **Toggle Button Group**: Pill-shaped toggle buttons
3. **Area Chart Component**: Dual area chart (overlapping)
4. **Donut Chart Component**: With center value and legend
5. **Line Chart Component**: With area fill
6. **Grid Layout System**: Responsive grid for cards

### Data Adaptations
- Map travel agency data to these visualizations
- Maintain same visual structure
- Adapt labels and metrics appropriately
- Keep color coding consistent

### Styling Requirements
- Dark theme as default
- Modern, clean aesthetic
- Consistent spacing
- Professional appearance
- Smooth animations/transitions

---

## Next Steps

Waiting for user prompts to:
1. Build KPI Cards Grid (2x4 layout)
2. Build Revenue Trend with Toggle Buttons
3. Build Revenue by Category Donut/Bar Toggle
4. Build Stock Movement Area Chart
5. Build Stock Health Donut Chart
6. Integrate all components into Dashboard

Each prompt will be implemented exactly as shown in the reference images, adapted for travel agency data.
