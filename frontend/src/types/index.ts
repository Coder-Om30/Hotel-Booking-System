export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface Hotel {
  id: number;
  name: string;
  description?: string;
  addressLine?: string;
  city: string;
  stateRegion?: string;
  country: string;
  postalCode?: string;
  imageUrl?: string;
  starRating?: number;
  active: boolean;
}

export interface RoomType {
  id: number;
  hotelId: number;
  hotelName?: string;
  name: string;
  description?: string;
  maxOccupancy: number;
  totalRooms: number;
  pricePerNight: number;
  imageUrl?: string;
  amenities?: string;
  active: boolean;
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED' | 'EXPIRED';

export interface Booking {
  id: number;
  bookingReference: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelImageUrl?: string;
  roomTypeId: number;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  guestCount: number;
  nightCount: number;
  pricePerNight: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  holdExpiresAt?: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellable: boolean;
}

export type PaymentStatus = 'INITIATED' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface PaymentResponse {
  paymentReference: string;
  bookingId: number;
  bookingReference: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  completedAt?: string;
  message?: string;
}

export interface AvailabilityResponse {
  roomTypeId: number;
  hotelId: number;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nightCount: number;
  requestedRooms: number;
  totalInventory: number;
  occupiedRooms: number;
  availableRooms: number;
  available: boolean;
  pricePerNight: number;
  estimatedTotalPrice: number;
  currency: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  fieldErrors?: Array<{ field: string; message: string }>;
}
