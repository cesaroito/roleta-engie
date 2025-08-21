import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/useStore";
import { secureRandomInt } from "../logic/rng";
import { computeTargetRotation, winnerIndexFromRotation } from "../logic/spin";
import { gsap } from "gsap";
import clsx from "classnames";

const IDLE_TIMEOUT_MS = 20_000;
const IDLE_SPEED_DPS = 6;
const PRESS_HOLD_MAX_MS = 2_000;
const SWALLOW_AFTER_IDLE_MS = 200;

/** Logo ENGIE — 800x105 centralizado */
function Logo() {
  return (
    <img
      src="/engie-logo.svg"
      onError={(ev) => {
        (ev.currentTarget as HTMLImageElement).src = "/engie-logo.png";
      }}
      alt="ENGIE"
      className="w-[800px] h-[105px] object-contain"
      draggable={false}
    />
  );
}

export default function WheelScreen() {
  const { currentRotation, setRotation, setScreen, setWinner, slices } =
    useStore();
  const wheelRef = useRef<HTMLImageElement | null>(null);
  const [spinning, setSpinning] = useState(false);

  // HOLD (força do giro)
  const [, setHoldProgress] = useState(0);
  const holdActiveRef = useRef(false);
  const holdStartRef = useRef(0);
  const holdRafRef = useRef<number | null>(null);

  // rotação atual
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

  // IDLE (giro suave sozinho)
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

    const winnerDraft = secureRandomInt(slices.length);
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

  // HOLD (pressione para aumentar a força)
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

  // STOP idle no primeiro toque
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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-sky-50 grid grid-rows-[auto_auto_1fr] select-none"
      onPointerDownCapture={onAnyPointerDownCapture}
    >
      {/* Header: logo 800x105 centralizado */}
      <header className="py-6 flex items-center justify-center">
        <Logo />
      </header>

      {/* Frase abaixo do logo (maior) */}
      <div className="text-center text-[#003A5D] font-semibold text-2xl md:text-4xl">
        Toque e gire a roleta
      </div>

      {/* Área principal centralizada */}
      <main className="px-4 pt-12 pb-6 flex justify-center">
        {/* Envelopa roleta + botão para centralizar como um bloco único */}
        <div className="relative flex flex-col items-center">
          {/* Ponteiro no topo */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
            <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden="true">
              <polygon points="0,0 40,0 20,30" fill="#003A5D" />
            </svg>
          </div>

          {/* Disco da roleta */}
          <img
            ref={wheelRef}
            src="/assets/wheel.jpg"
            alt="Roleta"
            className={clsx(
              "relative z-10",
              "w-[780px] h-[780px] rounded-full shadow-xl"
            )}
            onPointerDown={onPointerDownImg}
            onPointerUp={onPointerUpImg}
            draggable={false}
            style={{ transform: `rotate(${currentRotation}deg)` }}
          />

          {/* Botão GIRAR — 30% maior e logo abaixo da roleta */}
          <button
            className="mt-6 px-14 py-5 bg-engieBlue text-white rounded-2xl text-[2rem] font-semibold shadow-lg active:scale-95 transition"
            disabled={spinning}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerCancel={cancelHold}
            onPointerLeave={cancelHold}
          >
            GIRAR
          </button>

          {/* Bloqueio durante o giro (cobre roleta+botão) */}
          {spinning && <div className="absolute inset-0 z-30 cursor-wait" />}
        </div>
      </main>
    </div>
  );
}
