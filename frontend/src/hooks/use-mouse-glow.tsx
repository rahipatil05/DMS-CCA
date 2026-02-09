import { useEffect, useRef } from "react";

export const useBorderGlow = <T extends HTMLElement = HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => {
      el.style.setProperty("--glow-opacity", "1");
    };

    const onLeave = () => {
      el.style.setProperty("--glow-opacity", "0");
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return ref;
};
