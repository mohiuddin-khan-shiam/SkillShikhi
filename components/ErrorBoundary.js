'use client';

import { Component } from 'react';
import Link from 'next/link';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <div className="alert alert-danger" role="alert">
                <h2 className="h4 mb-3">Something went wrong!</h2>
                <p className="mb-4">
                  We're sorry, but an unexpected error occurred. Our team has been notified.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                  >
                    Reload Page
                  </button>
                  <Link href="/" className="btn btn-outline-secondary">
                    Go to Home
                  </Link>
                </div>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-start">
                  <summary className="btn btn-sm btn-outline-danger mb-2">
                    View Error Details (Development Only)
                  </summary>
                  <pre className="p-3 bg-light rounded overflow-auto">
                    <code>{this.state.error?.toString()}</code>
                  </pre>
                  <pre className="p-3 bg-light rounded overflow-auto mt-2">
                    <code>{this.state.error?.stack}</code>
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Higher-order component for wrapping pages with ErrorBoundary
export const withErrorBoundary = (PageComponent) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <PageComponent {...props} />
      </ErrorBoundary>
    );
  };
};
