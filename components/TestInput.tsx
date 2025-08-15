"use client";

import React, { useState, useCallback, useRef } from "react";

export const TestInput: React.FC = () => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input change:", e.target.value);
    setValue(e.target.value);
  }, []);

  console.log("TestInput render", Date.now());

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Test Input Component</h3>
      <p className="text-sm text-gray-600 mb-4">
        This is a minimal test component to isolate focus issues. Type in the
        input below to see if focus is maintained.
      </p>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type here to test focus..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="mt-2 text-sm text-gray-500">
        Current value: {value || "(empty)"}
      </p>
      <p className="mt-1 text-xs text-gray-400">Render count: {Date.now()}</p>
    </div>
  );
};
