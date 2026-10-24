import React from 'react';
import type { BookingStatus } from '../types';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="badge badge-confirmed">
          <CheckCircle2 size={13} /> Confirmed
        </span>
      );
    case 'PENDING_PAYMENT':
      return (
        <span className="badge badge-pending">
          <Clock size={13} /> Pending Payment
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={13} /> Cancelled
        </span>
      );
    case 'PAYMENT_FAILED':
      return (
        <span className="badge badge-cancelled">
          <AlertTriangle size={13} /> Payment Failed
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="badge badge-expired">
          <Clock size={13} /> Expired Hold
        </span>
      );
    default:
      return <span className="badge badge-expired">{status}</span>;
  }
};
