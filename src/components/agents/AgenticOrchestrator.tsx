import React, { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useCustomer } from '../../hooks/useCustomer';
import { SaathiAI } from '../../lib/gemini-wrapper';

interface AgentResponse {
  message: string;
  agent: string;
  nextAction?: string;
  confidence: number;
  requiresEscalation: boolean;
}

export const AgenticOrchestrator: React.FC = () => {
  const { messages, addMessage, clearMessages } = useChat();
  const { customer } = useCustomer();
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saathiAI] = useState(() => new SaathiAI());

  const processUserQuery = async (query: string): Promise<void> => {
    setIsProcessing(true);
    
    try {
      // Add user message
      addMessage(query, true);
      
      // Get AI response through orchestrator
      const response = await saathiAI.processQuery(query, {
        customerId: customer?.id || '',
        customerContext: {
          name: customer?.name || '',
          language: customer?.language || 'en',
          loanStatus: customer?.loanStatus?.applicationSubmitted ? 'active' : 'new',
          emiDueDate: customer?.loanStatus?.emiSchedule?.[0]?.dueDate || '',
          emiAmount: customer?.loanStatus?.emiSchedule?.[0]?.amount || 0
        }
      });

      setCurrentAgent(response.agent);
      
      // Add AI response
      addMessage(response.message, false);
      
      // Execute next action if required
      if (response.nextAction) {
        await executeNextAction(response.nextAction);
      }
      
    } catch (error) {
      console.error('Error processing query:', error);
      addMessage("I apologize, but I'm having trouble understanding. Could you please rephrase your question?", false);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeNextAction = async (action: string): Promise<void> => {
    switch (action) {
      case 'fetch_payment_info':
        // Fetch and display payment information
        break;
      case 'initiate_loan_application':
        // Start loan application process
        break;
      case 'escalate_to_human':
        // Escalate to human agent
        break;
    }
  };

  return {
    processUserQuery,
    currentAgent,
    isProcessing,
    messages
  };
};