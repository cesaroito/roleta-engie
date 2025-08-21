import { useEffect, useMemo, useRef } from "react";
import { useStore } from "@/state/useStore";
import { gsap } from "gsap";
import trilhaBanner from "@/assets/trilha-carreiras.png"; // novo asset (900x506)

/** Logo ENGIE — 800x105 */
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

/** Tela 2 — com/sem imagem, tudo centralizado */
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
  }, []);

  const winner = useMemo(
    () => (winnerIndex != null ? slices[winnerIndex] : null),
    [winnerIndex, slices]
  );

  const isTrilha = !!winner && (winner.id === 1 || winner.id === 7);

  return (
    <div className="min-h-screen bg-white grid grid-rows-[auto_1fr]">
      {/* Logo centralizado */}
      <header className="py-6 flex items-center justify-center">
        <Logo />
      </header>

      {/* Centro da tela */}
      <main className="grid place-items-center px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Card de imagem (apenas Trilha) — 900x506 */}
          {isTrilha && (
            <div className="rounded-2xl shadow-2xl border p-4 w-[900px] h-[506px] flex items-center justify-center bg-white">
              <img
                src={trilhaBanner}
                alt="Trilha de Carreiras Femininas"
                className="w-full h-full object-contain rounded-xl"
                draggable={false}
              />
            </div>
          )}

          {/* Card do resultado */}
          <div
            ref={cardRef}
            className="w-[min(86vw,900px)] rounded-2xl shadow-2xl p-8 text-center border bg-white"
          >
            <div className="text-3xl font-bold text-[#003A5D] mb-3">
              Resultado
            </div>
            <div className="text-5xl font-extrabold text-[#00AEEF] mb-6 break-words">
              {winner ? winner.label : "—"}
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
      </main>
    </div>
  );
}
