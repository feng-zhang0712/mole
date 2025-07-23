import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: !!error,
    };
  }

  componentDidCatch(error, info) {
    console.log(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Oops, something went wrong.</h1>;
    }

    return this.props.children;
  }
}

class App extends React.Component {
  handleClick = () => {
    throw Error('You trigger an error.');
  };

  render() {
    return (
      <ErrorBoundary>
        <button onClick={this.handleClick}>Click me!</button>
      </ErrorBoundary>
    )
  }
}

export default App;
