import React, { useEffect, useRef } from "react";

export default function ListeningAnimation({ isActive = false }) {
  const containerRef = useRef(null);
  const barsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        const update = () => {
          analyser.getByteFrequencyData(dataArray);

          // Map frequency data to 9 bars using exponential distribution
          // This focuses on mid-to-high frequencies where speech is
          const barCount = 9;
          const startFreq = 40; // Skip very low frequencies (DC + sub-bass)
          const endFreq = bufferLength * 0.8; // Use up to 80% of spectrum
          const freqRange = endFreq - startFreq;

          for (let i = 0; i < barCount; i++) {
            // Exponential distribution gives more spread to higher frequencies
            const normalizedPos = i / (barCount - 1);
            const exponentialPos = Math.pow(normalizedPos, 1.2);
            const freqIndex = Math.floor(startFreq + exponentialPos * freqRange);
            const frequency = dataArray[Math.min(freqIndex, bufferLength - 1)] || 0;

            // Scale frequency to bar height (10-80px)
            const height = Math.max(10, (frequency / 255) * 70 + 10);

            if (barsRef.current[i]) {
              barsRef.current[i].style.height = height + "px";
            }
          }

          animationFrameRef.current = requestAnimationFrame(update);
        };

        animationFrameRef.current = requestAnimationFrame(update);
      } catch (err) {
        console.error("Audio access denied:", err);
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          height: "100px",
        }}
      >
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
              style={{
                width: "6px",
                height: "10px",
                backgroundColor: "#3b82f6",
                borderRadius: "3px",
                transition: "none",
              }}
            ></div>
          ))}
      </div>
      <p style={{ marginTop: "10px", color: "#666", fontSize: "12px" }}>
        Listening...
      </p>
    </div>
  );
}
