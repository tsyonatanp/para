import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a0f',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64 }}>🥩</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
            משהו השתבש
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
            אירעה שגיאה בלתי צפויה. ניתן לנסות לטעון מחדש את הדף.
          </p>
          {this.state.error && (
            <code style={{
              fontSize: 12, color: '#6b7280',
              background: '#16161f', padding: '8px 14px',
              borderRadius: 8, maxWidth: 480,
              wordBreak: 'break-all' as const,
            }}>
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReset}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: 'white', border: 'none',
              padding: '12px 28px', borderRadius: 12,
              fontFamily: 'Heebo, sans-serif', fontSize: 16,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            חזור לדף הבית
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
