"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import VideoPlayer from "./VideoPlayer.jsx";
import ListeningAnimation from "./ListeningAnimation.jsx";
import SubtitlePanel from "./SubtitlePanel.jsx";
import { projectsApi } from "../../api/projects";
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

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
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
      setState("LISTEN");
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
    audioDoneRef.current = true;
    videoDoneRef.current = false;

    try {
      await chatApi.exitChat();
    } catch (err) {
      console.error("Exit chat failed:", err);
    }

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
    // Snapshot the current reply before this interaction starts
    const prevReply = lastReplyRef.current;

    const body = await chatApi.streamChat(userText);
    const reader = body.getReader();

    let replyFound = false;

    const playPromise = streamAndPlayAudio(reader);

    const pollPromise = (async () => {
      while (!replyFound) {
        await new Promise((r) => setTimeout(r, 200));
        try {
          const replyData = await chatApi.getLatestReply();
          if (replyData?.reply && replyData.reply !== prevReply) {
            lastReplyRef.current = replyData.reply;
            setActiveSubtitle({ text: replyData.reply, role: "agent" });
            replyFound = true;
          }
        } catch {}
      }
    })();

    await playPromise;

    for (let i = 0; !replyFound && i < 15; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try {
        const replyData = await chatApi.getLatestReply();
        if (replyData?.reply && replyData.reply !== prevReply) {
          lastReplyRef.current = replyData.reply;
          setActiveSubtitle({ text: replyData.reply, role: "agent" });
          replyFound = true;
        }
      } catch {}
    }

    replyFound = true;
    await pollPromise;
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

        if (userText) {
          setActiveSubtitle({ text: userText, role: "user" });
        }

        audioDoneRef.current = false;
        videoDoneRef.current = false;

        if (mode === "video_only") {
          audioDoneRef.current = true;
          const videoUrl = findVideoUrl(videoId);
          if (videoUrl) {
            setIsVideoLooping(false);
            setCurrentVideoUrl(videoUrl);
          } else {
            videoDoneRef.current = true;
            tryEndPlayback();
          }
        } else if (mode === "video_and_tts") {
          const videoUrl = videoId ? findVideoUrl(videoId) : null;
          if (videoUrl) {
            setIsVideoLooping(false);
            setCurrentVideoUrl(videoUrl);
          } else {
            videoDoneRef.current = true;
          }

          if (userText) {
            setState("SPEAKING");
            try {
              await streamWithReply(userText);
            } catch (err) {
              console.error("Stream chat failed:", err);
              audioDoneRef.current = true;
            }
          } else {
            audioDoneRef.current = true;
            tryEndPlayback();
          }
        } else if (mode === "tts_only") {
          videoDoneRef.current = true;

          if (userText) {
            setState("SPEAKING");
            try {
              await streamWithReply(userText);
            } catch (err) {
              console.error("Stream chat failed:", err);
              audioDoneRef.current = true;
            }
          } else {
            audioDoneRef.current = true;
            tryEndPlayback();
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
    const fetchProject = async () => {
      const fallbackVideos = [
        {
          id: 1,
          label: "Default Avatar",
          description: "Static avatar video for development",
          downloadUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
        },
      ];

      try {
        const projects = await projectsApi.listProjects();
        if (!Array.isArray(projects) || projects.length === 0) {
          setVideos(fallbackVideos);
          idleVideoUrlRef.current = fallbackVideos[0].downloadUrl;
          setCurrentVideoUrl(fallbackVideos[0].downloadUrl);
          setIsVideoLooping(true);
          return;
        }

        const project = projects[0];
        const projectVideos = project.videos ?? [];

        setVideos(projectVideos);
        exitVideoUrlRef.current = project.exitVideo?.downloadUrl ?? "";

        if (project.idleVideo?.downloadUrl) {
          idleVideoUrlRef.current = project.idleVideo.downloadUrl;
          setCurrentVideoUrl(project.idleVideo.downloadUrl);
          setIsVideoLooping(true);
        } else if (projectVideos.length > 0) {
          idleVideoUrlRef.current = projectVideos[0].downloadUrl;
          setCurrentVideoUrl(projectVideos[0].downloadUrl);
          setIsVideoLooping(true);
        } else {
          setVideos(fallbackVideos);
          idleVideoUrlRef.current = fallbackVideos[0].downloadUrl;
          setCurrentVideoUrl(fallbackVideos[0].downloadUrl);
          setIsVideoLooping(true);
        }
      } catch (err) {
        console.error("Failed to fetch project videos:", err);
        setVideos(fallbackVideos);
        idleVideoUrlRef.current = fallbackVideos[0].downloadUrl;
        setCurrentVideoUrl(fallbackVideos[0].downloadUrl);
        setIsVideoLooping(true);
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

  useEffect(() => {
    if (vad && state === "LISTEN") {
      initAudioContext();
      vad.start();
    }
  }, [vad]);

  useEffect(() => {
    if (state === "LISTEN") {
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
