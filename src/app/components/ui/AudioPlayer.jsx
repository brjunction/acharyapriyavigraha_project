"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── utils ────────────────────────────────────────────────────────────────────
const fmt = (s) => {
  if (!s || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pct = (a, b) => (b ? clamp((a / b) * 100, 0, 100) : 0);

// ─── Seeker ───────────────────────────────────────────────────────────────────
function Seeker({ current, duration, onSeek }) {
  const trackRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);
  const [dragging, setDragging] = useState(false);

  const getPct = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width, 0, 1);
  };

  const handleMouseMove = (e) => {
    setHoverPct(getPct(e));
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    onSeek(getPct(e) * duration);
    const move = (me) =>
      onSeek(
        clamp(
          (me.clientX - trackRef.current.getBoundingClientRect().left) /
            trackRef.current.getBoundingClientRect().width,
          0,
          1,
        ) * duration,
      );
    const up = () => {
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const filled = pct(current, duration);

  return (
    <div className="relative w-full group rounded-3xl">
      {/* hover time bubble */}
      {hovering && duration > 0 && (
        <div
          className="absolute -top-7 text-[11px] font-semibold text-stone-700 bg-white border border-stone-200 px-1.5 py-0.5 rounded shadow-sm pointer-events-none z-10  -translate-x-1/2"
          style={{ left: `${hoverPct * 100}%` }}
        >
          {fmt(hoverPct * duration)}
        </div>
      )}

      <div
        ref={trackRef}
        className="relative h-3 w-full bg-stone-200 rounded-sm cursor-pointer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        style={{
          height: hovering || dragging ? 8 : 6, // was 4 : 3
          transition: "height 0.1s",
        }}
      >
        {/* buffered ghost */}
        <div
          className="absolute inset-y-0 left-0 bg-stone-300 rounded-sm"
          style={{ width: `${Math.min(filled + 8, 100)}%` }}
        />
        {/* played */}
        <div
          className="absolute inset-y-0 left-0 bg-amber-400 rounded-sm"
          style={{ width: `${filled}%` }}
        />
        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow transition-opacity"
          style={{ left: `${filled}%`, opacity: hovering || dragging ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

// ─── Volume ───────────────────────────────────────────────────────────────────
function VolumeControl({ volume, muted, onChange, onToggleMute }) {
  const trackRef = useRef(null);
  const effective = muted ? 0 : volume;

  const handleClick = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    onChange(clamp((e.clientX - r.left) / r.width, 0, 1));
  };

  const VolumeIcon = () => {
    if (muted || volume === 0)
      return (
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      );
    if (volume < 0.5)
      return (
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      );
    return (
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleMute}
        className="text-stone-400 hover:text-stone-700 transition-colors p-1"
        aria-label="Toggle mute"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <VolumeIcon />
        </svg>
      </button>
      <div
        ref={trackRef}
        className="relative h-[3px] w-20 bg-stone-200 rounded-sm cursor-pointer group"
        onClick={handleClick}
      >
        <div
          className="absolute inset-y-0 left-0 bg-stone-700 rounded-sm"
          style={{ width: `${effective * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-stone-700 border-2 border-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${effective * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-stone-400 w-5 tabular-nums">
        {muted ? "0" : Math.round(volume * 100)}
      </span>
    </div>
  );
}

// ─── Speed menu ───────────────────────────────────────────────────────────────
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function SpeedMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`text-[11px] font-bold tabular-nums px-2 py-1 rounded border transition-colors ${
          value !== 1
            ? "border-amber-400 text-amber-600 bg-amber-50"
            : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700"
        }`}
      >
        {value === 1 ? "1× speed" : `${value}×`}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-50 w-28">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[12px] font-semibold transition-colors flex items-center justify-between ${
                s === value
                  ? "bg-amber-50 text-amber-600"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              }`}
            >
              {s === 1 ? "Normal" : `${s}×`}
              {s === value && (
                <svg
                  className="w-3 h-3 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AudioPlayer({
  audioUrl = "",
  title = "Untitled Track",
  artist = "Unknown Artist",
  album = "",
  albumArt = null,
}) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [liked, setLiked] = useState(false);

  // ── wire up audio events ─────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const map = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      loadstart: () => {
        setLoading(true);
        setError(false);
      },
      loadedmetadata: () => {
        setLoading(false);
        if (a.duration && isFinite(a.duration)) setDuration(a.duration);
      },
      durationchange: () => {
        if (a.duration && isFinite(a.duration)) setDuration(a.duration);
      },
      canplay: () => {
        if (a.duration && isFinite(a.duration)) setDuration(a.duration);
      },
      timeupdate: () => setCurrent(a.currentTime),
      error: () => {
        setError(true);
        setLoading(false);
      },
    };
    Object.entries(map).forEach(([e, fn]) => a.addEventListener(e, fn));
    return () =>
      Object.entries(map).forEach(([e, fn]) => a.removeEventListener(e, fn));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // ── keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowLeft") skip(-10);
      if (e.code === "ArrowRight") skip(10);
      if (e.key === "m") setMuted((p) => !p);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  // ── actions ──────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
  };

  const skip = (s) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = clamp(a.currentTime + s, 0, duration);
  };

  const seekTo = (t) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrent(t);
  };

  const remaining = duration - current;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white border-t border-b border-stone-200">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* ── error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Failed to load audio.
        </div>
      )}

      {/* ── seek bar (full bleed) ── */}
      <div className="px-0">
        <Seeker current={current} duration={duration} onSeek={seekTo} />
      </div>

      {/* ── main row ── */}
      <div className="flex items-center gap-0 px-4 py-3">
        {/* LEFT — transport controls: play, back, forward */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* PLAY / PAUSE */}
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900 text-white hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={playing ? "Pause" : "Play"}
            title="Play / Pause (Space)"
          >
            {loading ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : playing ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* skip back 10 */}
          <button
            onClick={() => skip(-10)}
            className="w-8 h-8 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Rewind 10 seconds"
            title="Rewind 10s (←)"
          >
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-3.26L9 13.14v-.85l1.85-.63h.05V16zm4.28-1.3c0 .85-.17 1.48-.51 1.9-.34.41-.85.61-1.54.61s-1.19-.2-1.53-.61c-.34-.41-.52-1.04-.52-1.9v-.7c0-.85.17-1.47.51-1.9.34-.42.85-.63 1.54-.63s1.19.21 1.53.62c.34.41.52 1.04.52 1.91v.7zm-.89-.79c0-.55-.08-.95-.23-1.2a.745.745 0 00-.69-.37c-.3 0-.53.12-.68.36-.15.24-.23.62-.23 1.16v.83c0 .55.08.96.23 1.2.16.25.39.37.69.37s.53-.12.68-.35c.15-.24.23-.63.23-1.18v-.82z" />
            </svg>
          </button>

          {/* skip forward 10 */}
          <button
            onClick={() => skip(10)}
            className="w-8 h-8 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Forward 10 seconds"
            title="Forward 10s (→)"
          >
            <svg
              className="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11H10v-3.26L9 13.14v-.85l1.85-.63h.05V16zm4.28-1.3c0 .85-.17 1.48-.51 1.9-.34.41-.85.61-1.54.61s-1.19-.2-1.53-.61c-.34-.41-.52-1.04-.52-1.9v-.7c0-.85.17-1.47.51-1.9.34-.42.85-.63 1.54-.63s1.19.21 1.53.62c.34.41.52 1.04.52 1.91v.7zm-.89-.79c0-.55-.08-.95-.23-1.2a.745.745 0 00-.69-.37c-.3 0-.53.12-.68.36-.15.24-.23.62-.23 1.16v.83c0 .55.08.96.23 1.2.16.25.39.37.69.37s.53-.12.68-.35c.15-.24.23-.63.23-1.18v-.82z" />
            </svg>
          </button>
        </div>

        {/* RIGHT — time + volume + speed */}
        <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
          {/* time display */}
          <div className="flex items-center gap-1 flex-shrink-0 text-[12px] tabular-nums">
            <span className="font-semibold text-stone-700">{fmt(current)}</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-400">{fmt(duration)}</span>
            <span className="ml-2 text-stone-300">·</span>
            <span className="text-rose-500 font-medium ml-2">
              -{fmt(remaining)}
            </span>
          </div>

          {/* volume */}
          <div className="hidden sm:block flex-shrink-0">
            <VolumeControl
              volume={volume}
              muted={muted}
              onChange={setVolume}
              onToggleMute={() => setMuted((p) => !p)}
            />
          </div>

          {/* speed */}
          <div className="hidden md:block flex-shrink-0">
            <SpeedMenu value={speed} onChange={setSpeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
