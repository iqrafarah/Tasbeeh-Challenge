import React, { useRef, useEffect } from "react";
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
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={baseBgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      
      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgcolor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.2s ease-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
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

export default React.memo(CircleProgressBar);
