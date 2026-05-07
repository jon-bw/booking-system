
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-destructive font-mono text-2xl uppercase tracking-wider">Something went wrong</h1>
            <p className="text-text-muted">{this.state.error?.message}</p>
            <button
              className="font-mono text-sm uppercase border border-border rounded-full px-6 py-2 hover:bg-surface"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
