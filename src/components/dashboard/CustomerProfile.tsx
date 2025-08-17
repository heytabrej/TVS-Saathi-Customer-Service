import React from 'react'
import { User, Phone, Mail, MapPin } from 'lucide-react'
import { useCustomer } from '@/hooks/useCustomer'

const CustomerProfile: React.FC = () => {
  const { customer, loading } = useCustomer()

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-sm text-gray-600 dark:text-gray-300">
        No customer loaded.
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white">
          <User size={18} />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
            {customer.name}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Profile
          </p>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {customer.phone && (
          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Phone size={14} className="text-blue-600 dark:text-blue-400" />
            {customer.phone}
          </li>
        )}
        {customer.email && (
          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Mail size={14} className="text-blue-600 dark:text-blue-400" />
            {customer.email}
          </li>
        )}
        {customer.address && (
          <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
            {customer.address}
          </li>
        )}
        <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium">
            {customer.loanStatus?.loanApproved
              ? 'Approved'
              : customer.loanStatus?.applicationSubmitted
              ? 'In Review'
              : 'New'}
          </span>
        </li>
      </ul>
    </div>
  )
}

export default CustomerProfile