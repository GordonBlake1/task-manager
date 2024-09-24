// src/components/Calendar.js

import React, { useState, useEffect } from "react";
import DayFunctionalities from "./DayFunctionalities";
import TaskModal from "./TaskModal";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const Calendar = ({ isMenuOpen }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayColors, setDayColors] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState({});
  const [taskColors, setTaskColors] = useState({});
  const [taskImages, setTaskImages] = useState({});

  // Load day colors from localStorage on mount
  useEffect(() => {
    const storedColors = localStorage.getItem("dayColors");
    if (storedColors) {
      setDayColors(JSON.parse(storedColors));
    }
  }, []);

  // Fetch tasks when the current month changes
  useEffect(() => {
    fetchTasksForMonth(currentMonth);
  }, [currentMonth]);

  // Fetch tasks when the selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTasksForDate(selectedDate);
    }
  }, [selectedDate]);

  // Function to update a task's color
  const updateTaskColor = async (id, color) => {
    try {
      setTasksForSelectedDate((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? { ...task, color } : task))
      );
      const response = await axios.put(
        `${API_URL}/api/tasks/${id}`,
        { color },
        getAuthConfig()
      );
      setTasksForSelectedDate((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, color: response.data.color } : task
        )
      );
      setTaskColors((prevTaskColors) => ({
        ...prevTaskColors,
        [id]: response.data.color,
      }));
      const dateKey = selectedDate.toISOString().split("T")[0];
      setTasks((prevTasks) => ({
        ...prevTasks,
        [dateKey]: prevTasks[dateKey].map((task) =>
          task.id === id ? { ...task, color: response.data.color } : task
        ),
      }));
    } catch (err) {
      console.error("Error updating task color:", err);
    }
  };

  // Function to toggle task completion status
  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}`,
        { completed },
        getAuthConfig()
      );
      const taskDate = new Date(response.data.date);
      const dateKey = `${taskDate.getFullYear().toString().padStart(4, "0")}-${(
        taskDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${taskDate.getDate().toString().padStart(2, "0")}`;
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks[dateKey].map((task) =>
          task.id === taskId
            ? { ...task, completed: response.data.completed }
            : task
        );
        return {
          ...prevTasks,
          [dateKey]: updatedTasks,
        };
      });
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  // Fetch tasks for the entire month
  const fetchTasksForMonth = async (month) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`, {
        params: {
          year: month.getFullYear(),
          month: month.getMonth() + 1,
        },
        ...getAuthConfig(),
      });
      const tasksByDate = response.data.reduce((acc, task) => {
        const taskDate = new Date(task.date);
        const utcDate = new Date(
          taskDate.getUTCFullYear(),
          taskDate.getUTCMonth(),
          taskDate.getUTCDate()
        );
        const dateKey = `${utcDate
          .getFullYear()
          .toString()
          .padStart(4, "0")}-${(utcDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${utcDate.getDate().toString().padStart(2, "0")}`;
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push({
          id: task.id,
          text: task.text,
          color: task.color,
          completed: task.completed,
          image: task.image,
        });
        return acc;
      }, {});
      setTasks(tasksByDate);
      setTaskColors((prevTaskColors) => ({
        ...prevTaskColors,
        ...response.data.reduce((acc, task) => {
          acc[task.id] = task.color;
          return acc;
        }, {}),
      }));
      setTaskImages((prevTaskImages) => ({
        ...prevTaskImages,
        ...response.data.reduce((acc, task) => {
          if (task.image) {
            acc[task.id] = task.image;
          }
          return acc;
        }, {}),
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  };

  // Fetch tasks for a specific date
  const fetchTasksForDate = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`, {
        params: { date: date.toISOString().split("T")[0] },
        ...getAuthConfig(),
      });
      setTasksForSelectedDate(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Navigate to the previous month
  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  // Navigate to the next month
  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Handle color change for a specific day
  const handleDayColorChange = (date, color) => {
    const dayKey = `${date.getFullYear().toString().padStart(4, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    setDayColors((prevColors) => {
      const updatedColors = {
        ...prevColors,
        [dayKey]: color,
      };
      localStorage.setItem("dayColors", JSON.stringify(updatedColors));
      return updatedColors;
    });
  };

  // Reset colors for the current month
  const resetAllColors = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const updatedColors = Object.keys(dayColors).reduce((acc, dayKey) => {
      const [dayYear, dayMonth] = dayKey.split("-").map(Number);
      if (dayYear !== year || dayMonth - 1 !== month) {
        acc[dayKey] = dayColors[dayKey];
      }
      return acc;
    }, {});
    setDayColors(updatedColors);
    localStorage.setItem("dayColors", JSON.stringify(updatedColors));
  };

  // Open the task modal for a specific date
  const handleOpenTaskModal = (date) => {
    setSelectedDate(date);
    fetchTasksForDate(date);
    setIsTaskModalOpen(true);
  };

  // Handle updates to tasks
  const handleTasksUpdated = (updatedTasks) => {
    if (!selectedDate) {
      console.error("selectedDate is null, cannot update tasks.");
      return;
    }

    setTaskColors((prevTaskColors) => ({
      ...prevTaskColors,
      ...updatedTasks.reduce((acc, task) => {
        acc[task.id] = task.color;
        return acc;
      }, {}),
    }));

    const dateKey = selectedDate.toISOString().split("T")[0];
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      if (updatedTasks.length === 0) {
        delete newTasks[dateKey];
      } else {
        newTasks[dateKey] = updatedTasks.map((task) => ({
          id: task.id,
          text: task.text,
          color: task.color || null,
          completed: task.completed,
          image: task.image,
        }));
      }
      return newTasks;
    });

    setTasksForSelectedDate(updatedTasks);

    // Update taskImages if necessary
    updatedTasks.forEach((task) => {
      if (task.image) {
        setTaskImages((prevTaskImages) => ({
          ...prevTaskImages,
          [task.id]: task.image,
        }));
      }
    });
  };

  // Close the task modal
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    fetchTasksForDate(selectedDate);
  };

  // Render the calendar grid
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const days = [];

    // Add empty divs for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-transparent border-none"></div>
      );
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dayKey = `${date.getUTCFullYear().toString().padStart(4, "0")}-${(
        date.getUTCMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
      const dayColor = dayColors[dayKey] || "#D1D5DB";
      const tasksForDay = tasks[dayKey] || [];
      const sortedTasksForDay = tasksForDay.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return a.id - b.id;
      });
      const displayedTasks = sortedTasksForDay.slice(0, 3);
      const remainingTasksCount = tasksForDay.length - displayedTasks.length;

      days.push(
        <div
          key={day}
          className={`relative border-4 border-transparent text-center text-lg flex flex-col items-center justify-start p-2 flex-grow flex-shrink hover:border-green-500 hover:text-white hover:rounded-lg transition-all duration-200 cursor-pointer day`}
          style={{
            backgroundColor: dayColor,
            backgroundImage: taskImages[tasksForDay[0]?.id]
              ? `url(${taskImages[tasksForDay[0].id]})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={() => {
            if (selectedColor) {
              handleDayColorChange(date, selectedColor);
            } else {
              handleOpenTaskModal(date);
            }
          }}
        >
          <div className="font-bold text-xl mb-2">{day}</div>
          <div className="absolute top-10 left-2 w-full text-left task-list">
            {sortedTasksForDay.length > 0 ? (
              <>
                {displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task flex items-center mb-1 p-1 rounded mr-4"
                    style={{
                      backgroundColor: taskColors[task.id] || "#f3f4f6",
                      color: taskColors[task.id] ? "#FFFFFF" : "#000000",
                    }}
                    onClick={(e) => {
                      // Prevent event bubbling if clicking on the checkbox
                      if (!e.target.matches("input[type='checkbox']")) {
                        if (selectedColor) {
                          e.stopPropagation();
                          updateTaskColor(task.id, selectedColor);
                        } else {
                          handleOpenTaskModal(date);
                        }
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!task.completed}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onChange={(e) => {
                        toggleTaskCompletion(task.id, e.target.checked);
                      }}
                      className="mr-2"
                    />
                    <span
                      className={task.completed ? "line-through" : ""}
                      style={{
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {truncateText(task.text, 28)}
                    </span>
                  </div>
                ))}
                {remainingTasksCount > 0 && (
                  <div className="more-tasks text-sm text-gray-700">
                    +{remainingTasksCount} more
                  </div>
                )}
              </>
            ) : (
              <div></div>
            )}
          </div>
          {tasksForDay.length > 0 && (
            <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-full">
              {tasksForDay.length}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold my-6">
          <div>Sunday</div>
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
          <div>Saturday</div>
        </div>
        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 h-full">{days}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-full w-full">
      {/* Sidebar: DayFunctionalities */}
      <div
        className={`h-full transition-all duration-300 ${
          isMenuOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        {/* Render DayFunctionalities only when the menu is open to prevent unwanted space */}
        {isMenuOpen && (
          <DayFunctionalities
            date={currentMonth}
            onColorChange={handleDayColorChange}
            onSelectColor={setSelectedColor}
            onResetColors={resetAllColors}
          />
        )}
      </div>

      {/* Main Calendar Content */}
      <div className="flex flex-col mb-1 mt-2 mx-2 flex-grow transition-all duration-300">
        {/* Navigation Buttons and Current Month Display */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Previous
          </button>
          <h2 className="text-xl font-bold">
            {currentMonth.toLocaleString("default", { month: "long" })}{" "}
            {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Next
          </button>
        </div>
        {/* Calendar Grid */}
        <div className="flex-grow overflow-hidden">{renderCalendar()}</div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          date={selectedDate}
          existingTasks={tasksForSelectedDate}
          onClose={handleCloseTaskModal}
          onTasksUpdated={handleTasksUpdated}
        />
      )}
    </div>
  );
};

export default Calendar;
