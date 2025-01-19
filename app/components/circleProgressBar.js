import React from "react";
import PropTypes from "prop-types";

const CircleProgressBar = ({
  completed = 0,
  bgcolor = "#000",
  baseBgColor = "#E5E5E5",
  size = 100,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <svg width={size} height={size}>
      {/* Background Circle */}
      <circle
        stroke={baseBgColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress Circle */}
      <circle
        stroke={bgcolor}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
      />
    </svg>
  );
};

// Validate props with PropTypes
CircleProgressBar.propTypes = {
  completed: PropTypes.number,
  bgcolor: PropTypes.string,
  baseBgColor: PropTypes.string,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
};

export default CircleProgressBar;
