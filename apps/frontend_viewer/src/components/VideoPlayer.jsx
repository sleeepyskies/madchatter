import React, { useEffect, useRef } from "react";

export default function VideoPlayer({ videoUrl, className = "" }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(err => {
        console.error("Video playback failed:", err);
      });
    }
  }, [videoUrl]);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        onError={(e) => console.error("Video error:", e)}
      />
    </div>
  );
}
