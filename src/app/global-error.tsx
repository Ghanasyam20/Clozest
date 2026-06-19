"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0F0F10] min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <h1 className="text-white text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            A critical error occurred. Please refresh or return to the home page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { window.location.href = "/"; }}
              className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:border-gray-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-[#C8A46B] text-black rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              Try again
            </button>
          </div>
          {error.digest && (
            <p className="text-xs text-gray-600 font-mono">ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
