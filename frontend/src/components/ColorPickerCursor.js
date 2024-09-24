// src/components/ColorPickerCursor.js
import { useEffect, useRef } from "react";

const ColorPickerCursor = ({ selectedColor, onColorSelect, isActive }) => {
  const circleRef = useRef(null); // Create a ref to hold the circle element

  useEffect(() => {
    if (isActive) {
      const circleDiv = document.createElement("div");
      circleDiv.style.position = "fixed";
      circleDiv.style.width = "20px";
      circleDiv.style.height = "20px";
      circleDiv.style.borderRadius = "50%";
      circleDiv.style.backgroundColor = selectedColor;
      circleDiv.style.pointerEvents = "none";
      circleDiv.style.zIndex = 1000; // Ensure it stays on top

      circleRef.current = circleDiv; // Store the circle in the ref
      document.body.appendChild(circleDiv);

      const handleMouseMove = (e) => {
        if (isActive) {
          circleDiv.style.top = `${e.clientY - 10}px`;
          circleDiv.style.left = `${e.clientX - 10}px`;
        }
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        document.body.removeChild(circleDiv);
      };
    }
  }, [selectedColor, isActive]); // Re-create the circle when color or isActive changes

  return null;
};

export default ColorPickerCursor;
