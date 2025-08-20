import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/useStore";
import { secureRandomInt } from "../logic/rng";
import {
  computeTargetRotation,
  SECTOR_DEG,
  getStartCenterDeg,
  setStartCenterDeg,
  winnerIndexFromRotation,
} from "../logic/spin";
import { gsap } from "gsap";
import clsx from "classnames";

const IDLE_TIMEOUT_MS = 20_000;
const IDLE_SPEED_DPS = 6;
const PRESS_HOLD_MAX_MS = 2_000;
const SWALLOW_AFTER_IDLE_MS = 200;

export default function WheelScreen() {
  const { currentRotation, setRotation, setScreen, setWinner, slices } =
    useStore();
  const wheelRef = useRef<HTMLImageElement | null>(null);
  const [spinning, setSpinning] = useState(false);

  const [holdProgress, setHoldProgress] = useState(0);
  const holdActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const holdRafRef = useRef<number | null>(null);

  const rotationRef = useRef(currentRotation);
  useEffect(() => {
    rotationRef.current = currentRotation;
  }, [currentRotation]);

  function playSpinSfxOneShot() {
    try {
      const one = new Audio("/assets/sfx/spin.mp3");
      one.preload = "auto";
      one.volume = 0.4;
      (one as any).__keep = setTimeout(() => {}, 2500);
      one.addEventListener("ended", () => clearTimeout((one as any).__keep));
      one.play().catch(() => {});
    } catch {}
  }

  function applyRotation(deg: number) {
    rotationRef.current = deg;
    setRotation(deg);
    if (wheelRef.current)
      wheelRef.current.style.transform = `rotate(${deg}deg)`;
  }

  // IDLE
  const isIdleRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const idleRafRef = useRef<number | null>(null);
  const justStoppedIdleUntilRef = useRef(0);

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }
  function startIdleTimer() {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(startIdleSpin, IDLE_TIMEOUT_MS);
  }
  const idleLoop = (now: number) => {
    if (!isIdleRef.current) return;
    const prev = (idleLoop as any)._prev as number | undefined;
    const dt = prev ? (now - prev) / 1000 : 0;
    (idleLoop as any)._prev = now;
    if (dt > 0) applyRotation(rotationRef.current + IDLE_SPEED_DPS * dt);
    idleRafRef.current = requestAnimationFrame(idleLoop);
  };
  function startIdleSpin() {
    if (spinning || isIdleRef.current) return;
    isIdleRef.current = true;
    (idleLoop as any)._prev = undefined;
    idleRafRef.current = requestAnimationFrame(idleLoop);
  }
  function stopIdleSpin() {
    if (!isIdleRef.current) return;
    isIdleRef.current = false;
    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    idleRafRef.current = null;
    (idleLoop as any)._prev = undefined;
  }
  function registerInteraction() {
    stopIdleSpin();
    startIdleTimer();
  }
  useEffect(() => {
    startIdleTimer();
    return () => {
      clearIdleTimer();
      stopIdleSpin();
    };
  }, []);

  // GIRO
  function spin(_trigger: "button" | "swipe", force = 1) {
    if (spinning) return;
    registerInteraction();
    setSpinning(true);

    const winnerDraft = secureRandomInt(slices.length); // só para calcular alvo
    const turns = Math.min(8, Math.max(5, Math.floor(5 + force * 3)));
    const base = rotationRef.current;
    const { target, duration } = computeTargetRotation(
      base,
      winnerDraft,
      turns
    );

    playSpinSfxOneShot();

    const tween = { p: 0 };
    gsap.to(tween, {
      p: 1,
      duration,
      ease: "power3.out",
      onUpdate: () => applyRotation(base + (target - base) * tween.p),
      onComplete: () => {
        applyRotation(target);
        const finalIdx = winnerIndexFromRotation(rotationRef.current);
        setWinner(finalIdx);
        setSpinning(false);
        setScreen("result");
      },
    });
  }

  // SWIPE
  const touchInfo = useRef<{ t: number; x: number; y: number } | null>(null);
  function blockedByIdleSwallow() {
    return performance.now() < justStoppedIdleUntilRef.current;
  }
  function onPointerDownImg(e: React.PointerEvent) {
    if (spinning || blockedByIdleSwallow()) return;
    registerInteraction();
    touchInfo.current = { t: performance.now(), x: e.clientX, y: e.clientY };
  }
  function onPointerUpImg(e: React.PointerEvent) {
    if (spinning || blockedByIdleSwallow()) return;
    if (!touchInfo.current) return;
    const dt = Math.max(1, performance.now() - touchInfo.current.t);
    const dx = e.clientX - touchInfo.current.x;
    const dy = e.clientY - touchInfo.current.y;
    const dist = Math.hypot(dx, dy);
    const speed = dist / dt;
    const force = Math.min(1, speed * 3);
    if (dist > 30) spin("swipe", 1 + force);
    touchInfo.current = null;
  }

  // HOLD
  function startHold() {
    if (spinning || blockedByIdleSwallow()) return;
    registerInteraction();
    holdActiveRef.current = true;
    setHoldProgress(0);
    holdStartRef.current = performance.now();
    const step = () => {
      if (!holdActiveRef.current) return;
      const elapsed = performance.now() - holdStartRef.current;
      setHoldProgress(Math.min(1, elapsed / PRESS_HOLD_MAX_MS));
      holdRafRef.current = requestAnimationFrame(step);
    };
    holdRafRef.current = requestAnimationFrame(step);
  }
  function endHold() {
    if (!holdActiveRef.current || blockedByIdleSwallow()) return;
    holdActiveRef.current = false;
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    const elapsed = performance.now() - holdStartRef.current;
    const p = Math.min(1, elapsed / PRESS_HOLD_MAX_MS);
    setHoldProgress(0);
    spin("button", 1 + p * 3);
  }
  function cancelHold() {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    setHoldProgress(0);
  }

  // STOP idle on first touch
  function onAnyPointerDownCapture(e: React.PointerEvent) {
    if (isIdleRef.current) {
      e.preventDefault();
      e.stopPropagation();
      stopIdleSpin();
      startIdleTimer();
      justStoppedIdleUntilRef.current =
        performance.now() + SWALLOW_AFTER_IDLE_MS;
      return;
    }
    if (!spinning) registerInteraction();
  }

  // CALIBRAÇÃO
  const [calibOn, setCalibOn] = useState(false);
  const [calibDeg, setCalibDeg] = useState<number>(getStartCenterDeg());
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "c") {
        setCalibOn((v) => !v);
        return;
      }
      const step = e.shiftKey ? 5 : 1;
      if (e.key === "[") {
        const v = (((calibDeg - step) % 360) + 360) % 360;
        setCalibDeg(v);
        setStartCenterDeg(v);
      }
      if (e.key === "]") {
        const v = (((calibDeg + step) % 360) + 360) % 360;
        setCalibDeg(v);
        setStartCenterDeg(v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [calibDeg]);

  function Logo() {
    return (
      <img
        src="/engie-logo.png"
        onError={(ev) => {
          (ev.currentTarget as HTMLImageElement).src = "/engie-logo.png";
        }}
        className="h-10 relative z-[200]" // Adicione um z-index alto aqui
        alt="ENGIE"
      />
    );
  }

  return (
    <div
      className="w-full h-full bg-white flex flex-col"
      onPointerDownCapture={onAnyPointerDownCapture}
    >
      {/* Header IGUAL ao QrScreen, mas protegido com z-index */}
      <div className="w-full px-6 py-4 flex items-center justify-between relative z-[200]">
        <Logo />
        <div className="text-engieDark text-lg font-medium">
          Toque e gire a roleta
        </div>
      </div>

      {/* Principal */}
      <div className="flex-1 w-full select-none relative">
        <div className="w-[780px] mx-auto flex flex-col items-center gap-6">
          <div className="relative">
            {/* Ponteiro */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <svg
                width="40"
                height="30"
                viewBox="0 0 40 30"
                aria-hidden="true"
                focusable="false"
              >
                <polygon points="0,0 40,0 20,30" fill="#003A5D" />
              </svg>
            </div>

            {/* Roleta */}
            <img
              ref={wheelRef}
              src="/assets/wheel.jpg"
              alt="Roleta"
              className={clsx(
                "wheel-img relative z-10",
                "w-[780px] h-[780px] rounded-full shadow-xl"
              )}
              onPointerDown={onPointerDownImg}
              onPointerUp={onPointerUpImg}
              draggable={false}
              style={{ transform: `rotate(${currentRotation}deg)` }}
            />

            {/* Overlay de calibração */}
            {calibOn && (
              <svg
                className="absolute inset-0 z-20 pointer-events-none"
                width={780}
                height={780}
                viewBox="0 0 780 780"
                style={{ transform: `rotate(${currentRotation}deg)` }}
              >
                <circle
                  cx="390"
                  cy="390"
                  r="388"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeDasharray="4 6"
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = ((calibDeg + i * SECTOR_DEG) * Math.PI) / 180;
                  const x2 = 390 + Math.sin(a) * 360;
                  const y2 = 390 - Math.cos(a) * 360;
                  return (
                    <g key={i}>
                      <line
                        x1="390"
                        y1="390"
                        x2={x2}
                        y2={y2}
                        stroke="#00AEEF"
                        strokeOpacity="0.8"
                        strokeWidth="1.5"
                      />
                      <circle cx={x2} cy={y2} r="3" fill="#00AEEF" />
                      <text
                        x={x2}
                        y={y2}
                        dx="6"
                        dy="-6"
                        fontSize="12"
                        fontWeight="700"
                        fill="#003A5D"
                      >
                        {i}
                      </text>
                    </g>
                  );
                })}
                <text
                  x="390"
                  y="30"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#003A5D"
                >
                  Calibração ON — offset={Math.round(calibDeg)}° | [ / ] (+/-1°)
                  Shift+[ / ] (+/-5°) | C para esconder
                </text>
              </svg>
            )}
          </div>

          {/* Botão */}
          <div className="relative w-full flex flex-col items-center">
            <button
              className="px-10 py-4 bg-engieBlue text-white rounded-2xl text-2xl font-semibold shadow-lg active:scale-95 transition relative"
              disabled={spinning}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerCancel={cancelHold}
              onPointerLeave={cancelHold}
            >
              GIRAR
            </button>
            <div className="text-center text-slate-500 text-sm mt-2">
              Segure para aumentar a força • ou deslize na roleta
            </div>
          </div>
        </div>

        {/* Overlay de bloqueio (somente na área principal) */}
        {spinning && (
          <div
            className="absolute inset-0 z-30 cursor-not-allowed"
            style={{ pointerEvents: "auto" }}
          />
        )}
      </div>

      {/* Rodapé */}
      <div className="w-full py-4 text-center text-slate-500">
        Evento ENGIE — Gire para descobrir sua interação
      </div>
    </div>
  );
}
