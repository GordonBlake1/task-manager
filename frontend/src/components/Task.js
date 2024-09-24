// src/components/Task.js
import { React, useEffect, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";

const Task = ({ task, onDragStop, onResizeStop, currentMonth }) => {
  const { description, startDate, endDate } = task;
  const [dayWidth, setDayWidth] = useState(100);

  useEffect(() => {
    const dayElement = document.querySelector(".day");
    if (dayElement) {
      setDayWidth(dayElement.offsetWidth);
    }
  }, [currentMonth]);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const daySpan = (end - start) / (1000 * 60 * 60 * 24) + 1;

  return (
    <Draggable axis="x" onStop={(e, data) => onDragStop(e, data, task)}>
      <ResizableBox
        width={dayWidth * daySpan}
        height={30}
        axis="x"
        minConstraints={[dayWidth, 30]}
        maxConstraints={[Infinity, 30]}
        onResizeStop={(e, { size }) => onResizeStop(e, size, task)}
        handle={
          <span className="cursor-ew-resize absolute right-0 top-0 bottom-0 w-2 bg-transparent z-50" />
        }
        style={{ zIndex: 10 }}
      >
        <div
          className="bg-blue-500 text-white p-1 cursor-move z-50 relative"
          style={{
            pointerEvents: "all",
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </div>
      </ResizableBox>
    </Draggable>
  );
};

export default Task;
