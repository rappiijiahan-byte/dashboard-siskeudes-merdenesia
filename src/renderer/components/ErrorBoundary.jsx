import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 font-sans">
                    <div className="glass-card max-w-2xl w-full p-8 border-red-500/30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">System Error Detected</h1>
                        </div>

                        <p className="text-gray-400 mb-6 font-medium">
                            A critical runtime error has occurred. The application state might be unstable.
                        </p>

                        <div className="bg-dark-800/80 rounded-lg p-4 mb-6 border border-dark-600">
                            <p className="text-red-400 font-mono text-sm break-all mb-4">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                <pre className="text-gray-500 font-mono text-xs leading-relaxed">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-gradient-cyber text-white rounded-lg font-bold hover:scale-105 transition-transform"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-6 py-2 btn-ghost"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
