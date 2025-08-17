import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const LoanApplication = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [submissionStatus, setSubmissionStatus] = useState('');

    const onSubmit = async (data) => {
        try {
            // Here you would typically send the data to your API
            console.log(data);
            setSubmissionStatus('Loan application submitted successfully!');
        } catch (error) {
            setSubmissionStatus('Error submitting application. Please try again.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Loan Application Form</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block">Name</label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="border p-2 w-full"
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="amount" className="block">Loan Amount</label>
                    <input
                        id="amount"
                        type="number"
                        {...register('amount', { required: 'Loan amount is required' })}
                        className="border p-2 w-full"
                    />
                    {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
                </div>
                <div>
                    <label htmlFor="duration" className="block">Loan Duration (months)</label>
                    <input
                        id="duration"
                        type="number"
                        {...register('duration', { required: 'Duration is required' })}
                        className="border p-2 w-full"
                    />
                    {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2">Submit</button>
            </form>
            {submissionStatus && <p className="mt-4">{submissionStatus}</p>}
        </div>
    );
};

export default LoanApplication;