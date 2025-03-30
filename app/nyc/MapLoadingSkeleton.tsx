import React from "react";

export const MapLoadingSkeleton = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-pulse bg-gray-200"
    >
      {/* Hudson River */}
      <rect x="0" y="100" width="100" height="400" fill="#d1d5db" />

      {/* Manhattan */}
      <rect x="110" y="150" width="280" height="300" fill="#e5e7eb" />

      {/* East River */}
      <rect x="400" y="100" width="50" height="400" fill="#d1d5db" />

      {/* Brooklyn */}
      <rect x="460" y="200" width="300" height="300" fill="#e5e7eb" />

      {/* Major Roads */}
      <rect x="200" y="150" width="10" height="300" fill="#cbd5e1" />
      <rect x="250" y="200" width="10" height="300" fill="#cbd5e1" />
      <rect x="300" y="180" width="10" height="300" fill="#cbd5e1" />

      {/* Bridges */}
      <rect x="380" y="250" width="80" height="10" fill="#cbd5e1" />
      <rect x="380" y="350" width="80" height="10" fill="#cbd5e1" />

      {/* Airport Placeholder */}
      <circle cx="700" cy="150" r="40" fill="#d1d5db" />

      {/* Labels Placeholder */}
      <rect x="150" y="80" width="100" height="20" fill="#f3f4f6" />
      <rect x="650" y="80" width="100" height="20" fill="#f3f4f6" />
    </svg>
  );
};

export default MapLoadingSkeleton;
