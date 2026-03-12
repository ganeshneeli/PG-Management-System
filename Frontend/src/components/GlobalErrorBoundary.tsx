import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Uncaught Error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center shadow-2xl shadow-destructive/20 mb-8 blur-none">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter">Something went <span className="text-destructive italic">wrong</span></h1>
              <p className="text-muted-foreground font-medium">
                The application encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border text-left text-xs font-mono overflow-auto max-h-32 text-muted-foreground">
              {this.state.error?.message}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button 
                variant="outline" 
                className="rounded-xl font-bold h-12"
                onClick={this.handleGoHome}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button 
                className="rounded-xl font-bold h-12 shadow-lg shadow-primary/20"
                onClick={this.handleReset}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
