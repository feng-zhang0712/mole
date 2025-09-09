import React from 'react';
import { createRoot } from 'react-dom/client';
import { List } from '/lib/index.js';
import './styles.css';

// Fixed Size List Demo
function FixedSizeListDemo() {
  const Row = ({ index, style }) => {
    // Generate different image URLs for variety
    const imageId = (index % 1000) + 1; // Cycle through 1000 different images
    const imageUrl = `https://picsum.photos/40/40?random=${imageId}`;
    
    const handleImageLoad = (e) => {
      // Remove loading state
      e.target.style.background = 'transparent';
    };
    
    const handleImageError = (e) => {
      // Show error state
      e.target.classList.add('list__image--error');
    };
    
    return (
      <div className="list__row" style={style}>
        <div className="list__content">
          {/* Profile Image */}
          <img
            src={imageUrl}
            alt={`Profile ${index}`}
            className="list__image"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="list__info">
            <div className="list__username">User {index}</div>
            <div className="list__email">Email: user{index}@example.com</div>
            <div className="list__login">
              Last login: {new Date(Date.now() - index * 1000000).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <List
      height={400}
      rowCount={50000}
      rowHeight={80}
      rowComponent={Row}
      rowProps={{}}
    />
  );
}

// Variable Size List Demo
function VariableSizeListDemo() {
  const Row = ({ index, style }) => {
    // Calculate dynamic height based on content complexity
    const baseHeight = 80; // Minimum height for image + basic content
    const extraHeight = (index % 10) * 20; // Add 0-180px extra height
    const height = baseHeight + extraHeight;
    
    // Generate different image URLs for variety
    const imageId = (index % 1000) + 1; // Cycle through 1000 different images
    const imageUrl = `https://picsum.photos/60/60?random=${imageId}`;
    
    const handleImageLoad = (e) => {
      // Remove loading state
      e.target.style.background = 'transparent';
    };
    
    const handleImageError = (e) => {
      // Show error state
      e.target.classList.add('list__image--error');
    };
    
    return (
      <div 
        className="list__row list__row--variable" 
        style={{
          ...style,
          height: height,
          minHeight: height // Ensure minimum height
        }}
      >
        <div className="list__content">
          {/* Profile Image */}
          <img
            src={imageUrl}
            alt={`Profile ${index}`}
            className="list__image list__image--large"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="list__info">
            <div className="list__title">Row {index}</div>
            <div className="list__height">Height: {height}px</div>
            <div className="list__description">
              Content: This is a variable height row with index {index}
            </div>
            
            {/* Additional content based on height */}
            {extraHeight > 40 && (
              <div className="list__additional">
                Additional Info: This row has extra content to demonstrate variable height functionality.
              </div>
            )}
            
            {extraHeight > 80 && (
              <div className="list__more-details">
                More Details: Row {index} contains multiple lines of text to fill the available space.
              </div>
            )}
            
            {extraHeight > 120 && (
              <div className="list__extended">
                Extended Content: This demonstrates how virtual scrolling handles rows with significantly different heights.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getItemSize = (index) => {
    const baseHeight = 80;
    const extraHeight = (index % 10) * 20;
    return baseHeight + extraHeight; // Height range: 80px to 260px
  };

  return (
    <List
      height={400}
      rowCount={1000}
      rowHeight={getItemSize}
      rowComponent={Row}
      rowProps={{}}
    />
  );
}

// Render demos
const fixedListContainer = document.getElementById('fixed-list');
if (fixedListContainer) {
  const fixedListRoot = createRoot(fixedListContainer);
  fixedListRoot.render(<FixedSizeListDemo />);
}

const variableListContainer = document.getElementById('variable-list');
if (variableListContainer) {
  const variableListRoot = createRoot(variableListContainer);
  variableListRoot.render(<VariableSizeListDemo />);
}
