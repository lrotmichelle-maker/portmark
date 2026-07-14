import React from 'react';

export function EditableText({ value, onChange, placeholder = 'Enter text' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
    />
  );
}
