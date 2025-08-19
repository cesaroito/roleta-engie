import { useEffect, useRef, useState } from "react";
import { useStore } from "../state/useStore";
import { secureRandomInt } from "../logic/rng";
import { computeTargetRotation } from "../logic/spin";
import { gsap } from "gsap";
import clsx from "classnames";

function useAudio(src: string | null, volume = 1) {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    a.volume = volume;
    ref.current = a;
    return () => {
      a.pause();
      ref.current = null;
    };
  }, [src, volume]);
  return ref;
}

export default function WheelScreen() {
  const { currentRotation, setRotation, setScreen, setWinner, slices } =
    useStore();
  const wheelRef = useRef<HTMLImageElement | null>(null);
  const [spinning, setSpinning] = useState(false);

  // Sons (coloque arquivos em public/assets/sfx/)
  const spinAudio = useAudio("/assets/sfx/spin.mp3", 0.4);

  function spin(trigger: "button" | "swipe", swipeForce = 1) {
    if (spinning) return;
    setSpinning(true);

    // Sorteio justo (uniforme 12 fatias):
    const winner = secureRandomInt(slices.length);
    setWinner(winner);

    // turns derivado do swipe (min 5, max 8)
    const turns = Math.min(8, Math.max(5, Math.floor(5 + swipeForce * 3)));
    const { target, duration } = computeTargetRotation(
      currentRotation,
      winner,
      turns
    );

    // som de giro
    spinAudio.current?.currentTime && (spinAudio.current.currentTime = 0);
    spinAudio.current?.play().catch(() => {});

    gsap.to(
      {},
      {
        // dummy para onUpdate fim do easing
        duration,
        ease: "power3.out",
        onUpdate: () => {
          const p = (gsap.getProperty({}, "progress") as number) || 0;
          const now = currentRotation + (target - currentRotation) * p;
          setRotation(now);
          if (wheelRef.current)
            wheelRef.current.style.transform = `rotate(${now}deg)`;
        },
        onComplete: () => {
          setRotation(target);
          if (wheelRef.current)
            wheelRef.current.style.transform = `rotate(${target}deg)`;
          setSpinning(false);
          setScreen("result");
        },
      }
    );
  }

  // Swipe muito simples (medimos velocidade linear ~ “força”)
  const touchInfo = useRef<{ t: number; x: number; y: number } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    touchInfo.current = { t: performance.now(), x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!touchInfo.current) return;
    const dt = Math.max(1, performance.now() - touchInfo.current.t);
    const dx = e.clientX - touchInfo.current.x;
    const dy = e.clientY - touchInfo.current.y;
    const dist = Math.hypot(dx, dy);
    const speed = dist / dt; // px/ms
    const force = Math.min(1, speed * 3); // normaliza
    if (dist > 30) {
      spin("swipe", 1 + force); // mais força -> mais voltas
    } else {
      // toque curto: não gira
    }
    touchInfo.current = null;
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-sky-50 flex flex-col items-center justify-start">
      {/* Header com logo e chamada */}
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <img src="/engie-logo.svg" className="h-10" alt="ENGIE" />
        <div className="text-engieDark text-lg font-medium">
          Toque e gire a roleta
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 select-none">
        {/* Ponteiro fixo (triângulo) */}
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
            <svg width="40" height="30" viewBox="0 0 40 30">
              <polygon points="20,0 0,30 40,30" fill="#003A5D" />
            </svg>
          </div>

          {/* Imagem da roleta */}
          <img
            ref={wheelRef}
            src="/assets/wheel.jpg"
            alt="Roleta"
            className={clsx(
              "wheel-img relative z-10",
              "w-[780px] h-[780px] rounded-full shadow-xl"
            )}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            draggable={false}
            style={{ transform: `rotate(${currentRotation}deg)` }}
          />
        </div>

        {/* Botão GIRAR */}
        <button
          className="px-10 py-4 bg-engieBlue text-white rounded-2xl text-2xl font-semibold shadow-lg active:scale-95 transition"
          disabled={spinning}
          onClick={() => spin("button")}
        >
          GIRAR
        </button>
      </div>

      {/* Rodapé sutil */}
      <div className="w-full py-4 text-center text-slate-500">
        Evento ENGIE — Gire para descobrir sua interação
      </div>
    </div>
  );
}
