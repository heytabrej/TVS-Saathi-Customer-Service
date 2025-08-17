// File: /tvs-saathi-assistant/tvs-saathi-assistant/src/types/index.ts

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  language: string
  loanStatus?: {
    applicationSubmitted: boolean
    documentsPending: boolean
    verificationInProgress: boolean
    loanApproved: boolean
    emiSchedule: Array<{
      dueDate: string
      amount: number
      status: 'paid' | 'pending' | 'overdue'
    }>
  }
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export interface AgentConfig {
  name: string
  systemPrompt: string
  capabilities: string[]
}

export interface CustomerContext {
  id: string
  name: string
  language: string
  loanStatus: string
  emiDueDate: string
  emiAmount: number
}