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
                className="report-button"
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

            <style jsx>{`
                .report-button {
                    background-color: #f87171;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .report-button:hover {
                    background-color: #ef4444;
                }
            `}</style>
        </>
    );
};

export default ReportButton;
