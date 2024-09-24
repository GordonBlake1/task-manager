import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaImage,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const TaskModal = ({
  isOpen,
  onClose,
  date,
  existingTasks = [],
  onTasksUpdated,
  selectedColor,
}) => {
  const [tasks, setTasks] = useState(existingTasks);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskImage, setNewTaskImage] = useState(null);
  const [newTaskImageUrl, setNewTaskImageUrl] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState("");
  const [editedTaskImage, setEditedTaskImage] = useState(null);
  const [editedTaskImageUrl, setEditedTaskImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const DEFAULT_BG_COLOR = "#f3f4f6";

  useEffect(() => {
    setTasks(existingTasks);
  }, [existingTasks]);

  const handleNewTaskImageChange = (e) => {
    const file = e.target.files[0];
    setNewTaskImage(file);
    if (file) {
      setNewTaskImageUrl(URL.createObjectURL(file));
    } else {
      setNewTaskImageUrl(null);
    }
  };

  const handleEditedTaskImageChange = (e) => {
    const file = e.target.files[0];
    setEditedTaskImage(file);
    if (file) {
      setEditedTaskImageUrl(URL.createObjectURL(file));
    } else {
      setEditedTaskImageUrl(null);
    }
  };

  const addTask = async () => {
    if (newTaskText.trim() === "") {
      setError("Task text cannot be empty.");
      return;
    }
    const formData = new FormData();
    formData.append("date", date.toISOString().split("T")[0]);
    formData.append("text", newTaskText);
    formData.append("color", selectedColor || "");
    if (newTaskImage) {
      formData.append("image", newTaskImage, newTaskImage.name);
    }

    try {
      const response = await axios.post(`${API_URL}/api/tasks`, formData, {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedTask = { ...response.data, image: response.data.image };
      const updatedTasks = [...tasks, updatedTask];
      setTasks(updatedTasks);
      onTasksUpdated(updatedTasks);
      setNewTaskText("");
      setNewTaskImage(null);
      setNewTaskImageUrl(null);
      setError(null);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, getAuthConfig());
      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
      onTasksUpdated(updatedTasks);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const toggleTaskCompletion = async (id, completed) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/tasks/${id}`,
        { completed },
        getAuthConfig()
      );
      const updatedTasks = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: response.data.completed,
            }
          : task
      );
      setTasks(updatedTasks);
      onTasksUpdated(updatedTasks);
    } catch (err) {
      console.error("Error updating task completion:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const updateTask = async (id) => {
    if (editedTaskText.trim() === "") {
      setError("Task text cannot be empty.");
      return;
    }
    const formData = new FormData();
    formData.append("text", editedTaskText);
    if (editedTaskImage) {
      formData.append("image", editedTaskImage, editedTaskImage.name);
    }

    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, formData, {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedTasks = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              text: response.data.text,
              image: response.data.image,
            }
          : task
      );
      setTasks(updatedTasks);
      onTasksUpdated(updatedTasks);
      setEditingTaskId(null);
      setEditedTaskText("");
      setEditedTaskImage(null);
      setEditedTaskImageUrl(null);
      setError(null);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return a.id - b.id;
  });

  const closeError = () => {
    setError(null);
  };

  return (
    isOpen && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 z-50"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4 sm:mx-0 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>

          {/* Modal Header */}
          <h2 className="text-2xl font-bold mb-4 text-center">
            Tasks for {date.toDateString()}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded relative">
              {error}
              <button
                onClick={closeError}
                className="absolute top-1 right-2 text-red-700"
                aria-label="Close Error Message"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Add New Task */}
          <div className="mb-4">
            <div className="flex items-stretch">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task"
                className="border p-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addTask}
                className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
                aria-label="Add Task"
              >
                <FaPlus />
              </button>
            </div>
            <div className="mt-2 flex items-center">
              <label
                htmlFor="newTaskImage"
                className="flex items-center cursor-pointer text-blue-500 hover:text-blue-600 transition-colors"
              >
                <FaImage className="mr-2" />
                <span>Attach Image</span>
              </label>
              <input
                id="newTaskImage"
                type="file"
                onChange={handleNewTaskImageChange}
                accept="image/*"
                className="hidden"
              />
              {newTaskImageUrl && (
                <img
                  src={newTaskImageUrl}
                  alt="Selected"
                  className="ml-4 h-12 w-12 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Task List */}
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className="p-2 rounded-lg shadow-sm"
                  style={{
                    backgroundColor: task.color || DEFAULT_BG_COLOR,
                    color:
                      task.color && task.color !== DEFAULT_BG_COLOR
                        ? "#FFFFFF"
                        : "#000000",
                  }}
                >
                  {editingTaskId === task.id ? (
                    // Editing view
                    <div>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editedTaskText}
                          onChange={(e) => setEditedTaskText(e.target.value)}
                          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                        />
                        <button
                          onClick={() => updateTask(task.id)}
                          className="bg-green-500 text-white p-2 rounded ml-2 hover:bg-green-600 transition-colors duration-200 flex items-center"
                          aria-label="Save"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaskId(null);
                            setEditedTaskText("");
                            setEditedTaskImage(null);
                            setEditedTaskImageUrl(null);
                          }}
                          className="bg-gray-500 text-white p-2 rounded ml-2 hover:bg-gray-600 transition-colors duration-200 flex items-center"
                          aria-label="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center">
                        <label
                          htmlFor={`editTaskImage-${task.id}`}
                          className="flex items-center cursor-pointer text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <FaImage className="mr-2" />
                          <span>Change Image</span>
                        </label>
                        <input
                          id={`editTaskImage-${task.id}`}
                          type="file"
                          onChange={handleEditedTaskImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {(editedTaskImageUrl || task.image_url) && (
                          <img
                            src={editedTaskImageUrl || task.image_url}
                            alt="Task"
                            className="ml-4 h-12 w-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    // Display view
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id, e.target.checked);
                          }}
                          className="mr-2"
                          aria-label="Mark as completed"
                        />
                        <span
                          className={`${task.completed ? "line-through" : ""}`}
                        >
                          {task.text}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {task.image_url && (
                          <img
                            src={task.image_url}
                            alt="Task"
                            className="h-12 w-12 object-cover rounded mr-2"
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTaskId(task.id);
                            setEditedTaskText(task.text);
                            setEditedTaskImage(null);
                            setEditedTaskImageUrl(null);
                          }}
                          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors duration-200 flex items-center mr-2"
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200 flex items-center"
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No tasks for this day.</li>
            )}
          </ul>
        </div>
      </div>
    )
  );
};

export default TaskModal;
