import React from 'react';

interface Props {
    children?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h1>
                    <p className="text-slate-600 mb-4">Erros detectados na aplicação.</p>
                    <div className="bg-red-50 p-4 rounded text-left overflow-auto max-w-2xl mx-auto border border-red-200">
                        <code className="text-red-800 text-sm whitespace-pre-wrap">
                            {this.state.error?.message}
                        </code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;