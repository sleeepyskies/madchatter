import React, { useEffect, useRef } from "react";

export default function SubtitlePanel({ userText, aiText, loading }) {
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
        backgroundColor: "#f0f0f0",
        padding: "15px",
        overflowY: "auto",
        fontFamily: "sans-serif",
        fontSize: "16px",
        lineHeight: "1.5",
        borderTop: "1px solid #ccc",
      }}
    >
      {userText && (
        <div style={{ marginBottom: "10px", color: "#333" }}>
          <strong style={{ color: "#2563eb" }}>You:</strong> {userText}
        </div>
      )}
      
      {aiText && (
        <div style={{ color: "#333" }}>
          <strong style={{ color: "#dc2626" }}>Agent:</strong> {aiText}
        </div>
      )}

      {loading && !aiText && (
        <div style={{ color: "#999", fontStyle: "italic" }}>
          Waiting for response...
        </div>
      )}
    </div>
  );
}
