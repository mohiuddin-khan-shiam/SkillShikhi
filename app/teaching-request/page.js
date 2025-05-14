import { Suspense } from 'react';
import '../styles.css';
import dynamic from 'next/dynamic';

// Import the client component with dynamic import to avoid SSR issues
const TeachingRequestClient = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <div className="container mx-auto px-4 py-8 max-w-4xl">Loading...</div>
});

// Main page component
export default function TeachingRequestPage() {
  return <TeachingRequestClient />;
}

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Metadata for the page
export const metadata = {
  title: 'Request Teaching Session - SkillShikhi',
  description: 'Request a teaching session from a skilled instructor on SkillShikhi.'
};
