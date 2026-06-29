import React, { useState, useEffect, useRef } from "react";

export default function SubtitlePanel({ text, role, style = {} }) {
  const [displayed, setDisplayed] = useState({ text: "", role: "" });
  const [opacity, setOpacity] = useState(0);
  const fadeTimer = useRef(null);

  useEffect(() => {
    clearTimeout(fadeTimer.current);

    if (!text) {
      setOpacity(0);
      fadeTimer.current = setTimeout(() => {
        setDisplayed({ text: "", role: "" });
      }, 400);
      return;
    }

    if (displayed.text) {
      // Cross-fade: fade out → swap → fade in
      setOpacity(0);
      fadeTimer.current = setTimeout(() => {
        setDisplayed({ text, role });
        fadeTimer.current = setTimeout(() => setOpacity(1), 20);
      }, 400);
    } else {
      // Nothing shown yet, just fade in
      setDisplayed({ text, role });
      fadeTimer.current = setTimeout(() => setOpacity(1), 20);
    }

    return () => clearTimeout(fadeTimer.current);
  }, [text, role]);

  const isAgent = displayed.role === "agent";

  return (
    <div
      style={{
        ...style,
        opacity,
        transition: "opacity 0.4s ease",
        minHeight: "60px",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      {displayed.text && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          width: "100%",
        }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: isAgent ? "rgba(248,113,113,0.8)" : "rgba(96,165,250,0.8)",
            textShadow: "0 0 4px rgba(0,0,0,0.8)",
            paddingLeft: "2px",
          }}>
            {isAgent ? "Agent" : "You"}
          </span>
          <p style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: 1.6,
            color: isAgent ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
            fontWeight: isAgent ? 400 : 300,
            fontFamily: "sans-serif",
            textShadow: "0 0 4px rgba(0,0,0,0.85)",
          }}>
            {displayed.text}
          </p>
        </div>
      )}
    </div>
  );
}
