"use client";

import { useState, useEffect } from "react";

const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const useViewportSize = () => {
  const [viewportSize, setViewportSize] = useState(getViewportSize);

  useEffect(() => {
    const handleResize = () => {
      setViewportSize(getViewportSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return viewportSize;
};

export { getViewportSize, useViewportSize };
