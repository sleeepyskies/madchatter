import React, { useEffect, useRef } from "react";

export default function SubtitlePanel({ userText, aiText, loading, style = {} }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [userText, aiText]);

  return (
    <div
      ref={panelRef}
      style={{
        height: "140px",
        backgroundColor: "transparent",
        color: "#fff",
        padding: "15px",
        overflowY: "auto",
        fontFamily: "sans-serif",
        fontSize: "16px",
        lineHeight: "1.5",
        borderTop: "none",
        borderBottom: "none",
        borderRadius: "0",
        textShadow: "0 0 4px rgba(0, 0, 0, 0.85)",
        ...style,
      }}
    >
      {userText && (
        <div style={{ marginBottom: "10px", color: "#fff" }}>
          <strong style={{ color: "#60a5fa" }}>You:</strong> {userText}
        </div>
      )}
      
      {aiText && (
        <div style={{ color: "#fff" }}>
          <strong style={{ color: "#f87171" }}>Agent:</strong> {aiText}
        </div>
      )}

      {loading && !aiText && (
        <div style={{ color: "#d1d5db", fontStyle: "italic" }}>
          Waiting for response...
        </div>
      )}
    </div>
  );
}
