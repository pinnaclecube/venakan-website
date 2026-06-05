import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
        window.scrollTo(0, 0);
      }, 350); // match fade out duration
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [location, displayLocation]);

  return (
    <div
      style={{
        transition: "opacity 0.35s ease-in-out",
        opacity: transitionStage === "fadeIn" ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
