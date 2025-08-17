'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  language: string;
  loanStatus?: {
    applicationSubmitted: boolean;
    documentsVerified: boolean;
    creditCheckComplete: boolean;
    loanApproved: boolean;
    emiSchedule: Array<{
      dueDate: string;
      amount: number;
      status: 'pending' | 'paid' | 'overdue';
    }>;
  };
}

export const useCustomer = () => {
  const [customer] = useState<Customer | null>({
    id: 'demo-customer-001',
    name: 'Ram Sharma',
    phone: '+91-9876543210',
    email: 'ram.sharma@example.com',
    language: 'en',
    loanStatus: {
      applicationSubmitted: true,
      documentsVerified: true,
      creditCheckComplete: true,
      loanApproved: false,
      emiSchedule: [
        {
          dueDate: '2024-02-15',
          amount: 3500,
          status: 'pending'
        }
      ]
    }
  });

  return {
    customer
  };
};