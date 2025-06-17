'use client';

import { useRouter } from 'next/navigation';

export default function ProfileInfo({
  user,
  displayName,
  displayBio,
  displaySkills,
  formatAvailability,
}) {
  const router = useRouter();

  return (
    <div className="card shadow-sm w-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-6 fw-bold text-primary mb-0">{displayName}</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => router.push('/profile/edit')}
          >
            Edit Profile
          </button>
        </div>
        <p className="text-secondary fst-italic mb-4">{displayBio}</p>

        <div className="mb-3">
          <strong className="fw-semibold">Skills:</strong> {displaySkills}
        </div>

        <div className="mb-3">
          <strong className="fw-semibold">Availability:</strong>
          {formatAvailability()}
        </div>

        <div className="mb-2">
          <strong className="fw-semibold">Location:</strong> {user.location || 'Not specified'}
        </div>
      </div>
    </div>
  );
}
