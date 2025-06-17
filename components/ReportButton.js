'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ReportModal component with SSR disabled
const ReportModal = dynamic(() => import('./ReportModal'), { ssr: false });

const ReportButton = ({ userId, userName }) => {
    const [reportModalOpen, setReportModalOpen] = useState(false);

    return (
        <>
            <button 
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={() => setReportModalOpen(true)}
            >
                🚩 Report to Admin
            </button>

            <ReportModal 
                isOpen={reportModalOpen} 
                onClose={() => setReportModalOpen(false)} 
                userId={userId} 
                userName={userName} 
            />
        </>
    );
};

export default ReportButton;
