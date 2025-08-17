import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { useCustomer } from '@/hooks/useCustomer';
import { cn } from '../../lib/utils';

const JourneyTracker: React.FC = () => {
  const { customer, loading } = useCustomer();

  const journeySteps = [
    { title: 'Application Submitted', completed: customer?.loanStatus?.applicationSubmitted },
    { title: 'Documents Verified', completed: !customer?.loanStatus?.documentsPending },
    { title: 'Credit Check Passed', completed: !customer?.loanStatus?.verificationInProgress },
    { title: 'Loan Approved', completed: customer?.loanStatus?.loanApproved },
  ];

  if (loading) {
    return <div className="bg-card p-4 rounded-lg border"><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div></div>;
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-4">Your Loan Journey</h3>
      <ul className="space-y-4">
        {journeySteps.map((step, index) => (
          <li key={index} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold',
                  step.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-success-foreground" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              {index < journeySteps.length - 1 && (
                <div className="w-0.5 h-12 bg-border mt-1"></div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                {step.title}
                {step.completed && <span className="text-green-600 text-[10px] bg-green-50 px-2 py-0.5 rounded-full">Done</span>}
              </h4>
              <p className="text-sm text-muted-foreground">
                {step.completed ? 'Completed' : 'Pending'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JourneyTracker;