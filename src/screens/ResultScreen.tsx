import { useEffect, useRef } from "react";
import { useStore } from "../state/useStore";
import { gsap } from "gsap";

function Logo() {
  return (
    <img
      src="/engie-logo.svg"
      onError={(ev) => {
        (ev.currentTarget as HTMLImageElement).src = "/engie-logo.png";
      }}
      className="h-10"
      alt="ENGIE"
    />
  );
}

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

export default function ResultScreen() {
  const { winnerIndex, slices, setScreen } = useStore();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const winAudio = useAudio("/assets/sfx/win.mp3", 0.5);

  useEffect(() => {
    winAudio.current?.play().catch(() => {});
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 20, scale: 0.96, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
    const t = setTimeout(() => setScreen("qr"), 5500);
    return () => clearTimeout(t);
  }, [setScreen]);

  const label =
    winnerIndex != null && slices[winnerIndex]
      ? slices[winnerIndex].label
      : "—";

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header igual ao QrScreen, com z-index para não ser coberto */}
      <div className="w-full px-6 py-4 flex items-center justify-between relative z-[100]">
        <Logo />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div
          ref={cardRef}
          className="w-[80%] max-w-[800px] rounded-2xl shadow-2xl p-8 text-center border"
        >
          <div className="text-3xl font-bold text-[#003A5D] mb-3">
            Resultado
          </div>
          <div className="text-5xl font-extrabold text-[#00AEEF] mb-6">
            {label}
          </div>
          <div className="text-slate-600">
            Aguarde um instante... vamos te mostrar nosso QR
          </div>
          <div className="mt-8">
            <button
              className="px-8 py-3 rounded-xl bg-[#00AEEF] text-white text-xl font-semibold"
              onClick={() => setScreen("qr")}
            >
              IR PARA QR CODE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
