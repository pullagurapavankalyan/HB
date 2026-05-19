import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center p-5" style={{ minHeight: '80vh' }}>
          <i className="bi bi-exclamation-triangle-fill text-danger display-1 mb-4"></i>
          <h2 className="fw-bold mb-3">Oops! Something went wrong.</h2>
          <p className="text-muted max-w-md mx-auto mb-4">
            We've encountered an unexpected error. Our team has been notified. 
            Please try refreshing the page or return to the dashboard.
          </p>
          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary px-4" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <Link to="/" className="btn btn-primary px-4" onClick={() => this.setState({ hasError: false })}>
              Return Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
