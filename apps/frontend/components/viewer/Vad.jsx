"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import VideoPlayer from "./VideoPlayer.jsx";
import ListeningAnimation from "./ListeningAnimation.jsx";
import SubtitlePanel from "./SubtitlePanel.jsx";

export default function Vad() {
  const [activeSubtitle, setActiveSubtitle] = useState({ text: "", role: "" });
  const [state, setState] = useState("LISTEN"); // LISTEN | THINKING | SPEAKING
  const [showWaveform, setShowWaveform] = useState(true);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const audioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const audioQueueRef = useRef(new Set());
  const waveformTimerRef = useRef(null);

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      const fallbackVideos = [
        {
          id: 1,
          label: "Default Avatar",
          filename: "avatar.mp4",
          description: "Static avatar video for development",
          fileUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
        },
      ];

      try {
        const res = await fetch("http://127.0.0.1:8000/api/projects");
        if (!res.ok) throw new Error(`Project fetch failed: ${res.status}`);

        const projects = await res.json();
        if (!Array.isArray(projects) || projects.length === 0) {
          setVideos(fallbackVideos);
          setCurrentVideoIndex(0);
          setCurrentVideoUrl(fallbackVideos[0].fileUrl);
          return;
        }

        const project = projects[0];
        const projectVideos =
          project.videos?.map((video) => ({
            ...video,
            fileUrl: `http://127.0.0.1:8000/files/${video.filename}`,
          })) ?? [];

        setVideos(projectVideos);

        if (project.idleVideo?.filename) {
          setCurrentVideoUrl(`http://127.0.0.1:8000/files/${project.idleVideo.filename}`);
          const idleIndex = projectVideos.findIndex((v) => v.id === project.idleVideo.id);
          setCurrentVideoIndex(idleIndex !== -1 ? idleIndex : 0);
        } else if (projectVideos.length > 0) {
          setCurrentVideoIndex(0);
          setCurrentVideoUrl(projectVideos[0].fileUrl);
        } else {
          setVideos(fallbackVideos);
          setCurrentVideoIndex(0);
          setCurrentVideoUrl(fallbackVideos[0].fileUrl);
        }
      } catch (err) {
        console.error("Failed to fetch project videos:", err);
        setVideos(fallbackVideos);
        setCurrentVideoIndex(0);
        setCurrentVideoUrl(fallbackVideos[0].fileUrl);
      }
    };

    fetchProject();
  }, []);

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
      resampled[i] = float32[i0] * (1 - w) + float32[i1] * w;
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

        // Hide waveform immediately, subtitle fades out over 1.5s,
        // then show waveform after subtitle is gone
        setShowWaveform(false);
        setActiveSubtitle({ text: "", role: "" }); // triggers SubtitlePanel fade-out (0.4s)

        clearTimeout(waveformTimerRef.current);
        waveformTimerRef.current = setTimeout(() => {
          setShowWaveform(true);
        }, 1500);
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
      setShowWaveform(false);
      setActiveSubtitle({ text: "", role: "" });
      clearTimeout(waveformTimerRef.current);

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
          setActiveSubtitle({
            text: decodeURIComponent(escape(xUserText)),
            role: "user",
          });
        }

        setState("SPEAKING");

        const reader = res.body.getReader();
        let leftover = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

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

        setActiveSubtitle({ text: replyData.reply, role: "agent" });

        if (replyData.suggested_video_id) {
          const videoIndex = videos.findIndex((v) => v.id === replyData.suggested_video_id);
          if (videoIndex !== -1) {
            setCurrentVideoIndex(videoIndex);
            setCurrentVideoUrl(videos[videoIndex].fileUrl);
          }
        }
      } catch (err) {
        console.error(err);
        setState("LISTEN");
        setActiveSubtitle({ text: "", role: "" });
        setShowWaveform(true);
      }
    },
  });

  useEffect(() => {
    if (vad && state === "LISTEN") {
      initAudioContext();
      vad.start();
    }
  }, [vad]);

  const statusLabel =
    state === "THINKING" ? "Thinking" :
    state === "SPEAKING" ? "Speaking" :
    showWaveform ? "Listening" : "";

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden", backgroundColor: "black" }}>
      <VideoPlayer videoUrl={currentVideoUrl} />

      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "24px",
        pointerEvents: "none",
      }}>
        <SubtitlePanel
          text={activeSubtitle.text}
          role={activeSubtitle.role}
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: "1080px",
          }}
        />

        <div style={{
          marginTop: "16px",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          minHeight: "140px", // prevent layout shift when waveform appears/disappears
          justifyContent: "flex-end",
        }}>
          {statusLabel ? (
            <span style={{
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}>
              {statusLabel}
            </span>
          ) : null}
          <ListeningAnimation isActive={showWaveform && state === "LISTEN"} />
        </div>
      </div>
    </div>
  );
}