'use client';

import { useEffect, useState } from 'react';

// This component ensures that children are only rendered on the client side
// This helps prevent hydration errors when server and client renders don't match
export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
