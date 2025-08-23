import Button from './components/Button';
import Loading from './components/Loading';
import Modal from './components/Modal';
import { formatDate, formatCurrency, debounce, throttle } from './utils';

const MicroFrontendShared = {
  components: {
    Button,
    Loading,
    Modal
  },
  utils: {
    formatDate,
    formatCurrency,
    debounce,
    throttle
  }
};

export default MicroFrontendShared;
export { Button, Loading, Modal, formatDate, formatCurrency, debounce, throttle };
