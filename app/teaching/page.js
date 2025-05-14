import TeachingRequestsClient from './client';
import '../styles.css';

// Metadata for the page
export const metadata = {
  title: 'Teaching Requests - SkillShikhi',
  description: 'Manage your teaching requests on SkillShikhi'
};

// Disable static generation for this page
export const dynamic = 'force-dynamic';

// Main page component
export default function TeachingRequestsPage() {
  return <TeachingRequestsClient />;
}
