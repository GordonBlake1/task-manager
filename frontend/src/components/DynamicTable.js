// src/components/DynamicTable.js
import React, { useState } from "react";

const DynamicTable = () => {
  const [rows, setRows] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddRow = () => {
    if (inputValue) {
      setRows([...rows, inputValue]);
      setInputValue(""); // Clear the input field
    }
  };

  return (
    <div className="max-h-[50vh] overflow-auto">
      {/* Set a maximum height of 50% of the viewport height and allow scrolling */}
      <h2 className="text-xl font-bold mb-4">Dynamic Table</h2>
      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-300 p-2 rounded"
          placeholder="Enter a value"
        />
        <button
          onClick={handleAddRow}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ml-2"
        >
          Add Row
        </button>
      </div>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{row}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
