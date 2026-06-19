"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error:    Error | null;
}

interface ErrorBoundaryProps {
  children:  ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 gap-4">
          <div className="text-4xl mb-2">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-foreground-muted max-w-sm">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
