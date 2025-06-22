import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ErrorBoundary from '../components/ErrorBoundary';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Log page views or analytics here
      console.log(`App is changing to: ${url}`);
    };

    // When the component is mounted, subscribe to router events
    router.events.on('routeChangeComplete', handleRouteChange);

    // If the component is unmounted, unsubscribe from the event
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
