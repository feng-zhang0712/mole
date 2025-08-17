import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer>
      <div>
        <div>
          <p>&copy; 2024 SSR React App. All rights reserved.</p>
          <div>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
