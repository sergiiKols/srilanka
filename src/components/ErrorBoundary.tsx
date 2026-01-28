/**
 * ErrorBoundary - обработчик ошибок React компонентов
 * Перехватывает ошибки и показывает fallback UI
 */

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Вызываем callback если он есть
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Если передан custom fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем дефолтный UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Произошла ошибка
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Компонент не смог загрузиться из-за ошибки.</p>
                  {this.state.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer hover:underline">
                        Подробности
                      </summary>
                      <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.toString()}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.reload();
                    }}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Перезагрузить страницу →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
