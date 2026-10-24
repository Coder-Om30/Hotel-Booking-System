# UI / UX Design Specification
## Hotel Booking System

## 1. Design principles
- Make destination and dates the most prominent starting action.
- Keep prices, occupancy limits, date ranges, and cancellation information clear.
- Use a responsive layout, semantic HTML, keyboard-accessible controls, and visible focus states.
- Treat loading, empty, validation, unauthorized, and server-error states as first-class designs.
- Avoid implying that mock payment is a real charge.

## 2. Visual direction
Use a clean hospitality style: warm neutral surfaces, dark readable text, one restrained accent color, spacious hotel cards, and consistent spacing. Keep components reusable and avoid decorative motion that interferes with accessibility.

## 3. Shared layout
- Header: brand, search/navigation links, sign-in or account menu, admin link only for authorized users.
- Main content: clear page title and focused primary action.
- Footer: support/contact placeholder, terms/privacy placeholders, and project/demo note.
- Toast/alert region: success and error announcements with accessible semantics.

## 4. Screen specifications
### Home/search
- Search form: destination, check-in, check-out, guests, rooms.
- Validate required fields and date ordering before submission.
- Display featured/available hotels only if backed by API data; otherwise show a deliberate empty state.

### Search results
- Summary of destination and dates.
- Filter/sort controls only when supported by the API.
- Hotel cards show name, location, amenities summary, starting price, and a detail action.
- Include loading skeleton, no-results state, and retryable error state.
- Pagination should be server-driven for large result sets.

### Hotel details
- Hotel summary, location, amenities, room types, occupancy, nightly price, and total price estimate.
- Date and room-count controls.
- Make availability time-sensitive and revalidate on checkout.

### Registration and login
- Label every field; show password requirements and inline validation.
- Do not expose whether an email belongs to an account in a way that creates unnecessary account enumeration risk.
- Display general authentication errors without revealing whether username or password was wrong.
- On successful login, preserve intended navigation only after validating allowed internal destinations.

### Checkout and mock payment
- Summarize hotel, room, dates, guest count, nights, rate breakdown, and total.
- Clearly label the action as “Simulate payment” or equivalent.
- Do not render card-number, CVV, or real-payment fields.
- Provide success, failure, and cancellation outcomes.
- Prevent repeated clicks while a request is pending; backend must still enforce idempotency.

### My bookings
- Group or filter upcoming, completed, and cancelled bookings.
- Display booking reference, hotel, dates, status, and total.
- Cancellation action appears only when the backend indicates eligibility; server remains authoritative.
- Confirm cancellation before submission.

### Admin screens
- Use tables with pagination, sorting, clear status indicators, and accessible forms.
- Confirm destructive/deactivation actions.
- Display server validation messages near relevant fields.
- Never rely on hiding an admin route as the only access control.

## 5. Reusable React components
- `AppLayout`, `Header`, `Footer`
- `HotelSearchForm`, `HotelCard`, `HotelGrid`
- `DateRangeFields`, `GuestRoomSelector`
- `PriceBreakdown`, `StatusBadge`, `Pagination`
- `FormField`, `ErrorMessage`, `LoadingState`, `EmptyState`
- `ProtectedRoute`, `AdminRoute` (UI convenience only; API security is authoritative)
- `BookingSummary`, `MockPaymentPanel`, `BookingCard`
- Admin forms and data tables

## 6. Accessibility and responsive behavior
- Use proper headings and landmarks.
- Every input has a programmatic label.
- Do not use color alone to communicate booking/payment status.
- Dialogs must manage focus and support keyboard dismissal where appropriate.
- Support narrow mobile widths, tablet layouts, and desktop.
- Respect reduced-motion preferences.
- Ensure errors are announced to assistive technology.

## 7. Frontend state and API rules
- Keep API access in a shared client/service layer.
- Centralize base URL and error normalization.
- Do not treat client route protection as authorization.
- Do not place JWTs in URLs or logs. Prefer short-lived access tokens in memory; if persistent storage is selected, document the XSS trade-off and mitigation. Never claim `localStorage` is automatically safe.
- Avoid duplicate submission with UI state, but rely on backend idempotency for correctness.
