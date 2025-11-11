import React, { useRef } from 'react';
import './SegmentedButton.css';

const SegmentedButton = ({ options, value, onChange }) => {
  const buttonRefs = useRef({});

  const handleButtonClick = (optionValue, e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    // Store reference to the button element for scrolling
    const buttonElement = buttonRefs.current[optionValue];
    if (buttonElement) {
      // Scroll to the button with smooth behavior
      buttonElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Call the original onChange handler
    onChange(optionValue);
  };

  return (
    <div className="segmented-container">
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => (buttonRefs.current[option.value] = el)}
          type="button"
          className={`segmented-button ${value === option.value ? 'active' : ''}`}
          onClick={(e) => handleButtonClick(option.value, e)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButton;
