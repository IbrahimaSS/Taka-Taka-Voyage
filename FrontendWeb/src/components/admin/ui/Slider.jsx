// src/components/ui/Slider.jsx
import React from 'react';

const Slider = ({ min, max, step, value, onChange, className = '' }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-2 bg-gradient-to-r from-blue-200 to-teal-200 rounded-lg appearance-none cursor-pointer ${className}`}
    />
  );
};

export default Slider;