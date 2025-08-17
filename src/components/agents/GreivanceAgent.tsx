import React, { useState } from 'react';

const GreivanceAgent = () => {
    const [grievance, setGrievance] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        // Simulate API call to submit grievance
        try {
            // Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setStatus('Grievance submitted successfully!');
        } catch (error) {
            setStatus('Failed to submit grievance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grievance-agent">
            <h2>Submit Your Grievance</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={grievance}
                    onChange={(e) => setGrievance(e.target.value)}
                    placeholder="Describe your grievance"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

export default GreivanceAgent;