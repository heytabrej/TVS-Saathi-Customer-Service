import React, { useState } from 'react';

const DocumentUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setError(null);
            setSuccess(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        // Simulate file upload
        try {
            // Replace with actual upload logic
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setSuccess('File uploaded successfully!');
        } catch (err) {
            setError('File upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="document-upload">
            <h2>Upload Document</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default DocumentUpload;