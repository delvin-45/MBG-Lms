import React from 'react';

export default function Input({ type = 'text', placeholder = '', value, onChange, className = '', ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border rounded px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E040A0] ${className}`}
      {...props}
    />
  );
}
