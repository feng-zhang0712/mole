import React from 'react';
import ReactDOM from 'react-dom';

const ThemeContext = React.createContext('light');

class Modal extends React.Component {
  static themeContext = ThemeContext;
  render() {
    const theme = themeContext.value;
    return (
      ReactDOM.createPortal(
        <div className={`modal ${theme}`} onClick={this.props.onClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {this.props.children}
          </div>
        </div>,
        document.body
      )
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
    }));
  }

  render() {
    return (
      <ThemeContext.Provider value='dark'>
        <div onClick={() => console.log('App clicked')}>
          <button onClick={this.toggleModal}>Toggle Modal</button>
          {this.state.showModal && (
            <Modal onClose={this.toggleModal}>
              <p>This is a modal rendered using a Portal with context.</p>
            </Modal>
          )}
        </div>
      </ThemeContext.Provider>
    );
  }
}

export default App;
