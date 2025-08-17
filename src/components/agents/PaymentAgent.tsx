import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useCustomer } from '../../hooks/useCustomer';

const PaymentAgent: React.FC = () => {
    const { sendMessage } = useChat();
    const { getCustomerPaymentInfo } = useCustomer();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePaymentQuery = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const paymentInfo = await getCustomerPaymentInfo();
            sendMessage(`Your current EMI due is: ${paymentInfo.dueAmount}. Due date is: ${paymentInfo.dueDate}.`);
        } catch (err) {
            setError('Failed to retrieve payment information. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading && <p>Loading payment information...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={() => handlePaymentQuery('EMI due?')} className="btn">
                Check EMI Due
            </button>
        </div>
    );
};

export default PaymentAgent;