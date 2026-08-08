import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="font-medium text-zinc-700">Something went wrong loading DesignDecode.</p>
          <p className="text-sm text-zinc-400">Try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
