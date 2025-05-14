import TeachingRequestClient from './client';
import '../styles.css';

// Metadata for the page
export const metadata = {
  title: 'Request Teaching Session - SkillShikhi',
  description: 'Request a teaching session from a skilled instructor on SkillShikhi.'
};

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Main page component
export default function TeachingRequestPage() {
  return <TeachingRequestClient />;
}
