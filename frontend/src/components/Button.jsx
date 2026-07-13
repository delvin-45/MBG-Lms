import React from 'react';

export default function Button({ children, onClick, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-[#E040A0] text-white rounded hover:bg-[#c03080] transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
