import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSave, FaTrash, FaTimes } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const premadeColors = [
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Gray", hex: "#808080" },
];

const Colors = ({ onSelectColor, onResetColors, onDoneColoring }) => {
  const [customColors, setCustomColors] = useState([]);
  const [editingColor, setEditingColor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const addCustomColor = async (newColor) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/usercolors`,
        newColor,
        getAuthConfig()
      );
      console.log("Color saved:", response.data);
      setCustomColors((prevColors) => [...prevColors, response.data]);
    } catch (error) {
      console.error(
        "Error saving color:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const updateCustomColor = async (color) => {
    console.log("Starting updateCustomColor with color:", color);
    try {
      const response = await axios.put(
        `${API_URL}/api/usercolors/${color.id}`,
        {
          name: color.name,
          hex: color.hex,
        },
        getAuthConfig()
      );
      console.log("Color updated on server:", response.data);

      setCustomColors((prevColors) =>
        prevColors.map((c) => (c.id === color.id ? response.data.color : c))
      );

      setEditingColor(null);
    } catch (error) {
      console.error(
        "Error updating color:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const deleteCustomColor = async (colorId) => {
    console.log("Starting deleteCustomColor with colorId:", colorId);
    try {
      const response = await axios.delete(
        `${API_URL}/api/usercolors/${colorId}`,
        getAuthConfig()
      );
      console.log("Color deleted:", response.data);
      setCustomColors((prevColors) =>
        prevColors.filter((c) => c.id !== colorId)
      );
    } catch (error) {
      console.error(
        "Error deleting color:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const loadCustomColors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/usercolors`,
        getAuthConfig()
      );
      console.log("Colors loaded:", response.data);
      setCustomColors(response.data);
    } catch (error) {
      console.error("Error loading colors:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomColors();
  }, [loadCustomColors]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Choose a Color:</h3>
      {isLoading ? (
        <p className="text-gray-500">Loading colors...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[...premadeColors, ...customColors].map((color) => (
            <div key={color.id || color.name} className="relative group">
              <div
                className="w-10 h-10 rounded-full cursor-pointer transform transition-transform duration-200 ease-in-out hover:scale-110"
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  onSelectColor(color.hex);
                }}
                onDoubleClick={
                  color.id ? () => setEditingColor({ ...color }) : null
                }
              ></div>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {color.name}
              </span>
            </div>
          ))}
          <button
            onClick={() => setEditingColor({ name: "", hex: "#000000" })}
            className="flex items-center justify-center bg-blue-600 text-white w-10 h-10 rounded-full transform transition-transform duration-200 ease-in-out hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between mb-4">
        <button
          onClick={onResetColors}
          className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-all duration-200 mr-2"
        >
          Reset Colors
        </button>

        <button
          onClick={onDoneColoring}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-all duration-200 ml-2"
        >
          Done Coloring
        </button>
      </div>

      {editingColor && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Edit Color</h4>
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={editingColor.name}
              onChange={(e) =>
                setEditingColor({ ...editingColor, name: e.target.value })
              }
              placeholder="Color name"
              className="w-full sm:w-2/3 border p-2 rounded"
            />
            <input
              type="color"
              value={editingColor.hex}
              onChange={(e) =>
                setEditingColor({ ...editingColor, hex: e.target.value })
              }
              className="w-10 h-10 p-0 border-0"
            />
          </div>

          <div className="flex justify-around mt-4 space-x-2">
            <button
              onClick={() => {
                if (editingColor.name && editingColor.hex) {
                  if (editingColor.id) {
                    updateCustomColor(editingColor);
                  } else {
                    addCustomColor(editingColor);
                  }
                  setEditingColor(null);
                }
              }}
              className="flex-1 bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition-all duration-200 flex justify-center items-center"
            >
              <FaSave />
            </button>

            {editingColor.id && (
              <button
                onClick={() => {
                  deleteCustomColor(editingColor.id);
                  setEditingColor(null);
                }}
                className="flex-1 bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 transition-all duration-200 flex justify-center items-center"
              >
                <FaTrash />
              </button>
            )}

            <button
              onClick={() => setEditingColor(null)}
              className="flex-1 bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600 transition-all duration-200 flex justify-center items-center"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colors;
