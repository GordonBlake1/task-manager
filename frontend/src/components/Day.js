// src/components/Day.js
import React, { useState } from "react";

const Day = ({ date, onClose, onColorChange }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [premadeTask, setPremadeTask] = useState("");
  const [pickerColor, setPickerColor] = useState("#ffffff");
  const [image, setImage] = useState(null);

  const addTask = () => {
    if (newTask) {
      setTasks([...tasks, { text: newTask, completed: false }]);
      setNewTask(""); // Clear input
    }
  };

  const handleCheckboxChange = (index) => {
    const updatedTasks = tasks.map((task, i) => {
      if (i === index) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color) => {
    setPickerColor(color); // Update the color picker state
    onColorChange(date, color); // Call the color change handler with the selected date and color
  };

  const resetColor = () => {
    setPickerColor("#ffffff"); // Reset the color picker to white (or any default color)
    onColorChange(date, "#D1D5DB"); // Reset the day color in the calendar to gray
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-500 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg p-6 relative z-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          x
        </button>
        <h2 className="text-xl font-bold mb-4">{date.toDateString()}</h2>

        <label className="block mb-2">Background Color:</label>
        <input
          type="color"
          value={pickerColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="mb-4"
        />

        <button
          onClick={resetColor}
          className="bg-red-500 text-white py-2 px-4 rounded mb-4"
        >
          Reset Color
        </button>

        <div className="mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="border p-2 rounded mr-2"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Add Task
          </button>
        </div>

        <div className="mb-4">
          <select
            value={premadeTask}
            onChange={(e) => setPremadeTask(e.target.value)}
            className="border p-2 rounded mr-2"
          >
            <option value="">Select a premade task</option>
            <option value="Grocery Shopping">Grocery Shopping</option>
            <option value="Doctor Appointment">Doctor Appointment</option>
            <option value="Meeting with Team">Meeting with Team</option>
          </select>
          <button
            onClick={() => {
              if (premadeTask) {
                setTasks([...tasks, { text: premadeTask, completed: false }]);
                setPremadeTask(""); // Clear selection
              }
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Add Premade Task
          </button>
        </div>

        <div className="mb-4">
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className="mb-2"
          />
          {image && (
            <img
              src={image}
              alt="Uploaded"
              className="mt-2 w-32 h-32 object-cover"
            />
          )}
        </div>

        <h3 className="text-lg font-bold mb-2">Tasks:</h3>
        <ul>
          {tasks.map((task, index) => (
            <li key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleCheckboxChange(index)}
                className="mr-2"
              />
              <span className={task.completed ? "line-through" : ""}>
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Day;
