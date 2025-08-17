import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useCustomer } from '../../hooks/useCustomer';

const OnboardingAgent: React.FC = () => {
    const { sendMessage } = useChat();
    const { getCustomerData } = useCustomer();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOnboarding = async (customerId: string) => {
        setLoading(true);
        setError(null);
        try {
            const customerData = await getCustomerData(customerId);
            sendMessage(`Welcome ${customerData.name}! How can I assist you with your loan application today?`);
        } catch (err) {
            setError('Failed to retrieve customer data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {/* Additional UI elements for onboarding can be added here */}
        </div>
    );
};

export default OnboardingAgent;