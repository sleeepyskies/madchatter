"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import VideoPlayer from "./VideoPlayer.jsx";
import ListeningAnimation from "./ListeningAnimation.jsx";
import SubtitlePanel from "./SubtitlePanel.jsx";
import { chatApi } from "../../api/chat";

const INACTIVITY_TIMEOUT = 60000;

export default function Vad() {
  const [activeSubtitle, setActiveSubtitle] = useState({ text: "", role: "" });
  const [state, setState] = useState("LISTEN"); // LISTEN | THINKING | SPEAKING
  const [showWaveform, setShowWaveform] = useState(true);
  const [videos, setVideos] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [isVideoLooping, setIsVideoLooping] = useState(true);

  const audioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const audioQueueRef = useRef(new Set());
  const waveformTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const idleVideoUrlRef = useRef("");
  const exitVideoUrlRef = useRef("");
  const audioDoneRef = useRef(false);
  const videoDoneRef = useRef(false);
  const lastReplyRef = useRef("");
  const sessionActiveRef = useRef(false);

  const initAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

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
        audioDoneRef.current = true;
        setShowWaveform(false);
        clearTimeout(waveformTimerRef.current);
        waveformTimerRef.current = setTimeout(() => {
          setShowWaveform(true);
        }, 1500);
        tryEndPlayback();
      }
    };
  };

  const tryEndPlayback = () => {
    if (audioDoneRef.current && videoDoneRef.current) {
      audioDoneRef.current = false;
      videoDoneRef.current = false;
      setActiveSubtitle({ text: "", role: "" });
      // Wait for subtitle fade-out (400ms) before showing listening UI
      setTimeout(() => {
        setShowWaveform(true);
        setState("LISTEN");
      }, 400);
    }
  };

  const handleVideoEnded = () => {
    videoDoneRef.current = true;
    if (idleVideoUrlRef.current) {
      setCurrentVideoUrl(idleVideoUrlRef.current);
      setIsVideoLooping(true);
    }
    tryEndPlayback();
  };

  const handleInactivityTimeout = async () => {
    setState("THINKING");
    setShowWaveform(false);
    audioDoneRef.current = true;
    videoDoneRef.current = false;

    try {
      await chatApi.exitChat();
    } catch (err) {
      console.error("Exit chat failed:", err);
    }

    sessionActiveRef.current = false;

    if (exitVideoUrlRef.current) {
      setIsVideoLooping(false);
      setCurrentVideoUrl(exitVideoUrlRef.current);
    } else {
      setCurrentVideoUrl(idleVideoUrlRef.current);
      setIsVideoLooping(true);
      setState("LISTEN");
      setShowWaveform(true);
    }
  };

  const findVideoUrl = (videoId) => {
    if (!videoId) return null;
    const video = videos.find((v) => v.id === videoId);
    return video?.downloadUrl ?? null;
  };

  const streamAndPlayAudio = async (reader) => {
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
  };

  const streamWithReply = async (userText) => {
    const body = await chatApi.streamChat(userText);
    const reader = body.getReader();

    await streamAndPlayAudio(reader);

    try {
      const replyData = await chatApi.getLatestReply();

      if (replyData?.reply) {
        lastReplyRef.current = replyData.reply;
        setActiveSubtitle({ text: replyData.reply, role: "agent" });
      }
    } catch (err) {
      console.log("Fetch reply failed.", err);
    }
  };

  // ─── VAD hook must come before any effect that references `vad` in deps ───
  const vad = useMicVAD({
    model: "v5",
    baseAssetPath: "/",
    onnxWASMBasePath: "/",

    onSpeechEnd: async (audioData) => {
      if (state !== "LISTEN") return;

      clearTimeout(inactivityTimerRef.current);
      initAudioContext();

      try {
        const wavBuffer = utils.encodeWAV(audioData);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });
        const file = new File([blob], "input.wav", { type: "audio/wav" });

        setState("THINKING");
        setShowWaveform(false);
        setActiveSubtitle({ text: "", role: "" });

        const modeResponse = await chatApi.getChatMode(file);
        const { mode, videoId, userText } = modeResponse;
        sessionActiveRef.current = true;

        if (userText) {
          setActiveSubtitle({ text: userText, role: "user" });
        }

        audioDoneRef.current = false;
        videoDoneRef.current = false;

        const videoUrl = (mode !== "tts_only" && videoId) ? findVideoUrl(videoId) : null;
        if (videoUrl) {
          setIsVideoLooping(false);
          setCurrentVideoUrl(videoUrl);
        } else {
          videoDoneRef.current = true;
        }

        if (mode === "video_only" || !userText) {
          audioDoneRef.current = true;
          tryEndPlayback();
        } else {
          setState("SPEAKING");
          try {
            await streamWithReply(userText);
          } catch (err) {
            console.error("Stream chat failed:", err);
            audioDoneRef.current = true;
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setState("LISTEN");
        setActiveSubtitle({ text: "", role: "" });
        setShowWaveform(true);
        setCurrentVideoUrl(idleVideoUrlRef.current);
        setIsVideoLooping(true);
      }
    },
  });

  // ─── Effects ────────────────────────────────────────────────────────────

  useEffect(() => {
    chatApi.preloadVideos()
      .then((data) => {
        const allVideos = data.videos ?? [];
        setVideos(allVideos);
        exitVideoUrlRef.current = data.exitVideo?.downloadUrl ?? "";

        const idleUrl = data.idleVideo?.downloadUrl ?? allVideos[0]?.downloadUrl;
        if (idleUrl) {
          idleVideoUrlRef.current = idleUrl;
          setCurrentVideoUrl(idleUrl);
          setIsVideoLooping(true);
        }
      })
      .catch((err) => console.error("Failed to preload videos:", err));
  }, []);

  useEffect(() => {
    if (!vad) return;
    if (state === "LISTEN") {
      vad.start();
    } else {
      vad.pause();
    }
  }, [state]);

  useEffect(() => {
    if (vad && state === "LISTEN") {
      initAudioContext();
      vad.start();
    }
  }, [vad, state]);

  useEffect(() => {
    if (state === "LISTEN" && sessionActiveRef.current) {
      inactivityTimerRef.current = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT);
    } else {
      clearTimeout(inactivityTimerRef.current);
    }
    return () => clearTimeout(inactivityTimerRef.current);
  }, [state]);

  const statusLabel =
    state === "THINKING" ? "Thinking" :
    state === "SPEAKING" ? "Speaking" :
    showWaveform ? "Listening" : "";

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden", backgroundColor: "black" }}>
      {currentVideoUrl && (
        <VideoPlayer
          videoUrl={currentVideoUrl}
          loop={isVideoLooping}
          onEnded={handleVideoEnded}
        />
      )}

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
        <div style={{
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          justifyContent: "flex-end",
        }}>
          <ListeningAnimation isActive={showWaveform && state === "LISTEN"} />
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
        </div>

        <SubtitlePanel
          text={activeSubtitle.text}
          role={activeSubtitle.role}
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: "1080px",
            marginTop: "16px",
          }}
        />
      </div>
    </div>
  );
}
