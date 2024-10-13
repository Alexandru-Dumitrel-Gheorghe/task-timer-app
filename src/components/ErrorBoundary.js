import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log("ErrorBoundary constructor: initialized with no error.");
  }

  static getDerivedStateFromError(error) {
    console.log(
      "ErrorBoundary getDerivedStateFromError: Error detected!",
      error
    );
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary componentDidCatch: ", error, errorInfo);
    console.log("Additional error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Log the error message being displayed
      console.log(
        "ErrorBoundary render: Rendering error message",
        this.state.error
      );
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Oops! Something went wrong.</h1>
          <p>
            {this.state.error
              ? this.state.error.toString()
              : "Unknown error occurred"}
          </p>
        </div>
      );
    }

    // Log when there is no error
    console.log("ErrorBoundary render: No error detected, rendering children.");
    return this.props.children;
  }
}

export default ErrorBoundary;
