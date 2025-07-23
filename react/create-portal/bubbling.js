import React from 'react';
import ReactDOM from 'react-dom';

class Modal extends React.Component {
  render() {
    return ReactDOM.createPortal(
      <div className="modal" onClick={this.props.onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {this.props.children}
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
      showModal: !prevState.showModal,
    }));
  }

  render() {
    return (
      <div onClick={() => console.log('App clicked')}>
        <button onClick={this.toggleModal}>Toggle Modal</button>
        {this.state.showModal && (
          <Modal onClose={this.toggleModal}>
            <p>This is a modal rendered using a Portal.</p>
          </Modal>
        )}
      </div>
    );
  }
}

export default App;