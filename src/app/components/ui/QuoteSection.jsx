"use client";

import { useState, useEffect, useRef } from "react";

const QUOTES = [
  {
    text: "The holy name is not an ordinary sound vibration. It is the Supreme Lord Himself, descending in the form of sound to deliver the conditioned soul.",
    context: "On the Holy Name",
    source: "Vrindavan, 1984",
  },
  {
    text: "Without the mercy of the spiritual master, one cannot understand the transcendental nature of Krishna. This mercy is the only boat that carries us across the ocean of material existence.",
    context: "On Guru-Kripa",
    source: "Bhubaneswar, 1990",
  },
  {
    text: "Real hearing means to hear with full attention, with a submissive heart. When you hear properly, the message enters the heart and transforms it completely.",
    context: "On Sravana",
    source: "Mayapur, 1988",
  },
  {
    text: "Krishna is the reservoir of all pleasure. When the soul turns away from Him, it becomes empty. When it turns back, it becomes full — eternally full.",
    context: "On Bhakti",
    source: "Delhi, 1991",
  },
  {
    text: "The Bhagavatam is the ripened fruit of the desire tree of all Vedic knowledge. It must be handled with great care and immense love.",
    context: "On Srimad Bhagavatam",
    source: "London, 1986",
  },
];

export default function QuoteSection() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState("visible"); // 'visible' | 'exit' | 'enter'
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  function startProgress() {
    setProgress(0);
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressRef.current);
          return 100;
        }
        return p + 100 / (62 * 10);
      });
    }, 100);
  }

  function transition(nextIndex) {
    clearInterval(intervalRef.current);
    clearInterval(progressRef.current);
    setPhase("exit");
    setTimeout(() => {
      setCurrent(nextIndex);
      setPhase("enter");
      setTimeout(() => {
        setPhase("visible");
        startProgress();
        scheduleNext(nextIndex);
      }, 50);
    }, 550);
  }

  function scheduleNext(from) {
    clearInterval(intervalRef.current);
    intervalRef.current = setTimeout(() => {
      transition((from + 1) % QUOTES.length);
    }, 6500);
  }

  useEffect(() => {
    startProgress();
    scheduleNext(0);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
    };
  }, []);

  const q = QUOTES[current];

  const textStyle = {
    opacity: phase === "exit" ? 0 : phase === "enter" ? 0 : 1,
    transform:
      phase === "exit"
        ? "translateY(-16px)"
        : phase === "enter"
          ? "translateY(20px)"
          : "translateY(0)",
    transition:
      phase === "exit"
        ? "opacity 0.5s ease, transform 0.5s ease"
        : "opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Cinzel:wght@400;500;600&display=swap');

        .ggs-quote-font  { font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif; }
        .ggs-title-font  { font-family: 'Cinzel', 'Trajan Pro', serif; }

        @keyframes ggs-rotate { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes ggs-rotate-r { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes ggs-pulse-glow {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes ggs-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes ggs-shimmer {
          0%   { background-position: -400px center; }
          100% { background-position: 400px center; }
        }

        .ggs-ring-cw  { animation: ggs-rotate   35s linear infinite; }
        .ggs-ring-ccw { animation: ggs-rotate-r  28s linear infinite; }
        .ggs-float    { animation: ggs-float 5s ease-in-out infinite; }

        .ggs-shimmer-text {
          background: linear-gradient(90deg,
            #7a1530 0%,
            #c8960c 25%,
            #e8b84b 45%,
            #c8960c 65%,
            #7a1530 100%
          );
          background-size: 400px auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ggs-shimmer 4s linear infinite;
        }

        .ggs-gold-shimmer {
          background: linear-gradient(90deg,
            #c8960c 0%,
            #f5d76e 30%,
            #fff0a0 50%,
            #f5d76e 70%,
            #c8960c 100%
          );
          background-size: 400px auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ggs-shimmer 6s linear infinite;
        }

        .ggs-progress-bar {
          background: linear-gradient(90deg, #7a1530, #c8960c, #e8b84b);
          background-size: 200% auto;
          animation: ggs-shimmer 2s linear infinite;
        }

        .ggs-nav-dot {
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer;
          border-radius: 9999px;
        }

        .ggs-section {
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,120,30,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 20% 100%, rgba(122,21,48,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 100%, rgba(200,150,12,0.05) 0%, transparent 60%),
            #fffdf7;
        }

        .ggs-border-card {
          background:
            linear-gradient(135deg, rgba(200,150,12,0.07) 0%, rgba(255,253,247,0) 50%, rgba(122,21,48,0.05) 100%),
            rgba(255,253,247,0.7);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(200,150,12,0.2);
          box-shadow:
            0 0 0 1px rgba(200,150,12,0.08),
            0 4px 24px rgba(122,21,48,0.06),
            0 1px 3px rgba(200,150,12,0.1),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .ggs-dot-active {
          background: linear-gradient(90deg, #7a1530, #c8960c);
          box-shadow: 0 0 8px rgba(200,150,12,0.5);
        }
        .ggs-dot-inactive {
          background: rgba(42,26,14,0.15);
        }
        .ggs-dot-inactive:hover {
          background: rgba(200,150,12,0.4);
        }
      `}</style>

      <section className="ggs-section relative overflow-hidden py-20 md:py-28">
        {/* ────── Deep background layers ────── */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden
        >
          {/* Central warm glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(232,184,75,0.10) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Outer rotating dotted ring */}
          <div
            className="absolute top-1/2 left-1/2 ggs-ring-cw"
            style={{
              width: 680,
              height: 680,
              marginLeft: -340,
              marginTop: -340,
            }}
          >
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: i % 6 === 0 ? 4 : 2,
                  height: i % 6 === 0 ? 4 : 2,
                  borderRadius: "50%",
                  background:
                    i % 6 === 0
                      ? "rgba(200,150,12,0.3)"
                      : "rgba(200,150,12,0.12)",
                  transform: `rotate(${i * 10}deg) translateX(340px) translate(-50%,-50%)`,
                }}
              />
            ))}
          </div>

          {/* Inner rotating dashed ring — crimson */}
          <div
            className="absolute top-1/2 left-1/2 ggs-ring-ccw"
            style={{
              width: 460,
              height: 460,
              marginLeft: -230,
              marginTop: -230,
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: i % 4 === 0 ? 5 : 2,
                  height: i % 4 === 0 ? 5 : 2,
                  borderRadius: "50%",
                  background:
                    i % 4 === 0
                      ? "rgba(122,21,48,0.25)"
                      : "rgba(122,21,48,0.1)",
                  transform: `rotate(${i * 15}deg) translateX(230px) translate(-50%,-50%)`,
                }}
              />
            ))}
          </div>

          {/* Static thin border rings */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 560,
              height: 560,
              border: "1px solid rgba(200,150,12,0.08)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 380,
              height: 380,
              border: "1px solid rgba(122,21,48,0.07)",
            }}
          />

          {/* Corner ornamental glows */}
          <div
            className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(232,184,75,0.4) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(122,21,48,0.4) 0%, transparent 65%)",
            }}
          />

          {/* Subtle horizontal light band */}
          <div
            className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 opacity-20"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(200,150,12,0.6) 20%, rgba(200,150,12,0.8) 50%, rgba(200,150,12,0.6) 80%, transparent 100%)",
            }}
          />
        </div>

        {/* ────── Main content ────── */}
        <div className="relative max-w-3xl mx-auto px-6 flex flex-col items-center">
          {/* Top label ornament */}
          <div className="flex items-center gap-5 mb-10">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: "block",
                  width: 32,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(122,21,48,0.4))",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 10,
                  height: 1,
                  background: "rgba(200,150,12,0.6)",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(200,150,12,0.5)",
                }}
              />
            </div>
            <p
              className="ggs-title-font tracking-[0.3em] uppercase"
              style={{
                fontSize: 9,
                color: "rgba(122,21,48,0.55)",
                letterSpacing: "0.28em",
              }}
            >
              Vāṇī · Words of the Ācārya
            </p>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: "block",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(200,150,12,0.5)",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 10,
                  height: 1,
                  background: "rgba(200,150,12,0.6)",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 32,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(122,21,48,0.4), transparent)",
                }}
              />
            </div>
          </div>

          {/* The card */}
          <div className="ggs-border-card w-full rounded-2xl md:rounded-3xl px-8 md:px-16 py-12 md:py-14 relative">
            {/* Corner filigree dots */}
            {[
              "top-3 left-3",
              "top-3 right-3",
              "bottom-3 left-3",
              "bottom-3 right-3",
            ].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-6 h-6 opacity-30`}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(200,150,12,0.6)",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                />
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "1px solid rgba(200,150,12,0.3)",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                />
              </div>
            ))}

            {/* Large decorative quote mark */}
            <div className="ggs-float flex justify-center -mb-4">
              <span
                className="ggs-quote-font select-none ggs-gold-shimmer"
                style={{
                  fontSize: "6.5rem",
                  lineHeight: 0.75,
                  fontWeight: 300,
                }}
              >
                ❝
              </span>
            </div>

            {/* Quote text area */}
            <div className="min-h-[160px] flex flex-col items-center justify-center text-center mt-6">
              <div style={textStyle}>
                {/* Quote body */}
                <p
                  className="ggs-quote-font italic leading-relaxed text-center"
                  style={{
                    fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                    color: "#2a1408",
                    letterSpacing: "0.01em",
                    lineHeight: 1.75,
                  }}
                >
                  {q.text}
                </p>

                {/* Context line */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        display: "block",
                        width: 24,
                        height: 1,
                        background: "rgba(200,150,12,0.5)",
                      }}
                    />
                    <span
                      style={{
                        display: "block",
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "rgba(200,150,12,0.7)",
                      }}
                    />
                  </div>
                  <span
                    className="ggs-title-font ggs-shimmer-text tracking-widest uppercase"
                    style={{ fontSize: 10 }}
                  >
                    {q.context}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        display: "block",
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "rgba(200,150,12,0.7)",
                      }}
                    />
                    <span
                      style={{
                        display: "block",
                        width: 24,
                        height: 1,
                        background: "rgba(200,150,12,0.5)",
                      }}
                    />
                  </div>
                </div>

                {/* Attribution */}
                <div className="mt-5 flex flex-col items-center gap-1.5">
                  <p
                    className="ggs-quote-font"
                    style={{
                      fontSize: "0.95rem",
                      color: "rgba(122,21,48,0.75)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    — Sri Srimad Gour Govinda Swami Maharaja
                  </p>
                  <p
                    className="ggs-title-font"
                    style={{
                      fontSize: 9,
                      color: "rgba(42,20,8,0.28)",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                    }}
                  >
                    {q.source}
                  </p>
                </div>
              </div>
            </div>

            {/* Thin horizontal rule below */}
            <div className="mt-10 flex justify-center">
              <div
                style={{
                  width: 200,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,150,12,0.3) 30%, rgba(122,21,48,0.25) 70%, transparent)",
                }}
              />
            </div>

            {/* Progress + navigation */}
            <div className="flex flex-col items-center gap-4 mt-6">
              {/* Thin progress bar */}
              <div
                className="w-40 rounded-full overflow-hidden"
                style={{ height: 2, background: "rgba(42,20,8,0.08)" }}
              >
                <div
                  className="ggs-progress-bar h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>

              {/* Dots */}
              <div className="flex items-center gap-3">
                {QUOTES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => transition(i)}
                    className="ggs-nav-dot"
                    style={{
                      width: i === current ? 24 : 7,
                      height: 7,
                    }}
                  >
                    <div
                      className="rounded-full w-full h-full"
                      style={{
                        background:
                          i === current
                            ? "linear-gradient(90deg, #7a1530, #c8960c)"
                            : "rgba(42,26,14,0.15)",
                        boxShadow:
                          i === current
                            ? "0 0 8px rgba(200,150,12,0.45)"
                            : "none",
                        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Counter */}
              <p
                className="ggs-title-font"
                style={{
                  fontSize: 9,
                  color: "rgba(42,20,8,0.22)",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(QUOTES.length).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center gap-5 mt-10">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(200,150,12,0.35))",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 8,
                  height: 1,
                  background: "rgba(200,150,12,0.5)",
                }}
              />
            </div>
            <span
              className="ggs-gold-shimmer"
              style={{ fontSize: "1.1rem", lineHeight: 1 }}
            >
              ❋
            </span>
            <span style={{ color: "rgba(42,20,8,0.2)", fontSize: 8 }}>✦</span>
            <span
              className="ggs-gold-shimmer"
              style={{ fontSize: "1.1rem", lineHeight: 1 }}
            >
              ❋
            </span>
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  display: "block",
                  width: 8,
                  height: 1,
                  background: "rgba(200,150,12,0.5)",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(200,150,12,0.35), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
