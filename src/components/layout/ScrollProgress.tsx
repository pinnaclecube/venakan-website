import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
      } else {
        setProgress(0);
      }
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-[2px] z-[1001]"
      style={{ 
        width: `${progress}%`, 
        background: "linear-gradient(90deg, var(--color-brand-blue), var(--color-brand-violet), var(--color-cyan))",
        transition: "width 0.1s ease-out"
      }}
    />
  );
}
