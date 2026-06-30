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

          const barCount = 9;
          const startFreq = 40;
          const endFreq = bufferLength * 0.8;
          const freqRange = endFreq - startFreq;

          for (let i = 0; i < barCount; i++) {
            const normalizedPos = i / (barCount - 1);
            const exponentialPos = Math.pow(normalizedPos, 1.2);
            const freqIndex = Math.floor(startFreq + exponentialPos * freqRange);
            const frequency = dataArray[Math.min(freqIndex, bufferLength - 1)] || 0;

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
    <div style={{ textAlign: "center" }}>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          height: "40px",
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
            />
          ))}
      </div>
    </div>
  );
}
