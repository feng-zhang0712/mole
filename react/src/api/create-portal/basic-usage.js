import React from 'react';
import ReactDOM from 'react-dom';

class Modal extends React.Component {
  render() {
    return ReactDOM.createPortal(
      <div className='modal'>
        <div className='modal-content'>
          <span className='close' onClick={this.props.onClose}>&times;</span>
          <p>{this.props.children}</p>
        </div>
      </div>,
      document.body
    );
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
      showModal: prevState.showModal,
    }));
  }

  render() {
    return (
      <div>
        <button onClick={this.toggleModal}>Toggle Modal</button>
        {this.state.showModal && (
          <Modal onClose={this.toggleModal}>
            This is a modal rendered using a Portal.
          </Modal>
        )}
      </div>
    );
  }
}

export default App;
