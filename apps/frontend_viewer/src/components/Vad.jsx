import React, { useState, useRef, useEffect } from "react";
import { useMicVAD, utils } from "@ricky0123/vad-react";

export default function Vad() {
  const [userText, setUserText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const [state, setState] = useState("LISTEN"); // LISTEN | THINKING | SPEAKING

  const audioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0);

  // Playback queue to prevent cutting off audio
  const audioQueueRef = useRef(new Set());

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (!vad) return;

    if (state === "LISTEN") {
      vad.start();
    } else {
      vad.pause();
    }
  }, [state]);


  const playPCMBuffer = (int16Array) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const MODEL_SAMPLE_RATE = 16000;
    const TARGET_SAMPLE_RATE = audioCtx.sampleRate;

    const float32 = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32[i] = int16Array[i] / 32768;
    }

    const ratio = MODEL_SAMPLE_RATE / TARGET_SAMPLE_RATE;
    const resampled = new Float32Array(Math.round(int16Array.length / ratio));

    for (let i = 0; i < resampled.length; i++) {
      const src = i * ratio;
      const i0 = Math.floor(src);
      const i1 = Math.min(i0 + 1, int16Array.length - 1);
      const w = src - i0;

      resampled[i] =
        float32[i0] * (1 - w) +
        float32[i1] * w;
    }

    const buffer = audioCtx.createBuffer(1, resampled.length, TARGET_SAMPLE_RATE);
    buffer.getChannelData(0).set(resampled);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    audioQueueRef.current.add(source);

    source.onended = () => {
      audioQueueRef.current.delete(source);

      if (audioQueueRef.current.size === 0) {
        setState("LISTEN");
        setLoading(false);
      }
    };
  };


  const vad = useMicVAD({
    model: "v5",
    baseAssetPath: "/",
    onnxWASMBasePath: "/",

    onSpeechEnd: async (audioData) => {
      if (state !== "LISTEN") return;

      setState("THINKING");
      setLoading(true);
      setAiText("");

      initAudioContext();

      try {
        const wavBuffer = utils.encodeWAV(audioData);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });

        const form = new FormData();
        form.append("file", blob, "input.wav");

        const res = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Server error");

        const xUserText = res.headers.get("X-User-Text");
        if (xUserText) {
          setUserText(decodeURIComponent(escape(xUserText)));
        }

        setState("SPEAKING");

        const reader = res.body.getReader();
        let leftover = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const combined = new Uint8Array(leftover.length + value.length);
          combined.set(leftover);
          combined.set(value, leftover.length);

          const playable = combined.length - (combined.length % 2);
          leftover = combined.slice(playable);

          if (playable > 0) {
            const clean = combined.buffer.slice(0, playable);
            const int16 = new Int16Array(clean);
            playPCMBuffer(int16);
          }
        }


        const replyRes = await fetch("http://127.0.0.1:8000/api/chat/latest_reply");
        const replyData = await replyRes.json();

        setAiText(replyData.reply);

      } catch (err) {
        console.error(err);
        setLoading(false);
        setState("LISTEN");
      }
    },
  });


  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>AI Voice Assistant</h1>

      <button
        onClick={() => {
          initAudioContext();
          vad.toggle();
        }}
        style={{ padding: "10px 20px", fontSize: 16 }}
      >
        {vad.listening ? "🛑 Stop Listening" : "🎙️ Start Voice Chat"}
      </button>

      <div style={{ marginTop: 15, fontWeight: "bold" }}>
        {state === "LISTEN" && "Listening..."}
        {state === "THINKING" && "Thinking..."}
        {state === "SPEAKING" && "Speaking..."}
      </div>

      <hr />

      <p><b>User:</b> {userText}</p>
      <p><b>Agent:</b> {aiText || (loading ? "" : "")}</p>
    </div>
  );
}