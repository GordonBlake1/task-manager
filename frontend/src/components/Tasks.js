import React, { useEffect } from "react";
import axios from "axios";

// Assuming API_URL is defined somewhere in your configuration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Helper function to get auth configuration
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const Tasks = ({
  date,
  tasks,
  setTasks,
  newTask,
  setNewTask,
  premadeTask,
  setPremadeTask,
  editTaskId,
  setEditTaskId,
  editTaskText,
  setEditTaskText,
}) => {
  // Fetch tasks from the server when the date changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tasks`, {
          params: { date },
          ...getAuthConfig(),
        });
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    if (date) {
      fetchTasks();
    }
  }, [date, setTasks]);

  // Add a new task
  const addTask = async () => {
    if (newTask) {
      try {
        const response = await axios.post(
          `${API_URL}/api/tasks`,
          {
            date,
            tasks: [...tasks.map((task) => task.text), newTask],
          },
          getAuthConfig()
        );
        setTasks(response.data);
        setNewTask("");
      } catch (err) {
        console.error("Error adding task:", err);
      }
    }
  };

  // Add a premade task
  const addPremadeTask = async (taskText) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/tasks`,
        {
          date,
          tasks: [...tasks.map((task) => task.text), taskText],
        },
        getAuthConfig()
      );
      setTasks(response.data);
    } catch (err) {
      console.error("Error adding premade task:", err);
    }
  };

  // Edit a task
  const editTask = async (id) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, text: editTaskText } : task
      );
      await axios.put(
        `${API_URL}/api/tasks/${id}`,
        {
          tasks: updatedTasks.map((task) => task.text),
          date,
        },
        getAuthConfig()
      );
      setTasks(updatedTasks);
      setEditTaskId(null);
      setEditTaskText("");
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, getAuthConfig());
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Duplicate a task
  const duplicateTask = async (id, newDate) => {
    try {
      await axios.post(
        `${API_URL}/api/tasks/${id}/duplicate`,
        { newDate },
        getAuthConfig()
      );
      // Optionally refetch tasks or update state to reflect duplication
    } catch (err) {
      console.error("Error duplicating task:", err);
    }
  };

  return (
    <div>
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
              addPremadeTask(premadeTask);
              setPremadeTask(""); // Clear selection
            }
          }}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Premade Task
        </button>
      </div>

      <h3 className="text-lg font-bold mb-2">Tasks:</h3>
      <ul>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center mb-2">
              {editTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    className="border p-2 rounded mr-2"
                  />
                  <button
                    onClick={() => editTask(task.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditTaskId(null);
                      setEditTaskText("");
                    }}
                    className="bg-red-500 text-white py-1 px-3 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      editTask(task.id, { ...task, completed: !task.completed })
                    }
                    className="mr-2"
                  />
                  <span
                    className={task.completed ? "line-through" : ""}
                    onDoubleClick={() => {
                      setEditTaskId(task.id);
                      setEditTaskText(task.text);
                    }}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded ml-4"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      const newDate = prompt("Enter new date (YYYY-MM-DD):");
                      if (newDate) {
                        duplicateTask(task.id, newDate);
                      }
                    }}
                    className="bg-yellow-500 text-white py-1 px-3 rounded ml-2"
                  >
                    Duplicate
                  </button>
                </>
              )}
            </li>
          ))
        ) : (
          <li>No tasks for this day.</li>
        )}
      </ul>
    </div>
  );
};

export default Tasks;
