import React, { useState } from "react";
import Colors from "./Colors";
import ColorPickerCursor from "./ColorPickerCursor";

const DayFunctionalities = ({
  date,
  onColorChange,
  onSelectColor,
  onResetColors,
}) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);

  const applyColorToDays = (e) => {
    if (selectedColor && isColorPickerActive) {
      const dayElements = document.querySelectorAll(".day");
      dayElements.forEach((day) => {
        const rect = day.getBoundingClientRect();
        const isWithinBounds =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isWithinBounds) {
          const dayIndex = Number(day.textContent);
          onColorChange(
            new Date(date.getFullYear(), date.getMonth(), dayIndex),
            selectedColor
          );
        }
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex flex-col">
        <div className="flex-1">
          <Colors
            onSelectColor={(color) => {
              setSelectedColor(color);
              setIsColorPickerActive(true);
              onSelectColor(color);
            }}
            onResetColors={onResetColors}
            onDoneColoring={() => {
              setIsColorPickerActive(false);
              setSelectedColor(null);
              onSelectColor(null);
            }}
          />
        </div>

        {isColorPickerActive && (
          <div className="flex-1 mt-4 md:mt-0">
            <ColorPickerCursor
              selectedColor={selectedColor}
              onColorSelect={applyColorToDays}
              isActive={isColorPickerActive}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DayFunctionalities;
