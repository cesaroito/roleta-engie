import { useEffect, useRef } from "react";
import { useStore } from "../state/useStore";
import { gsap } from "gsap";

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

  // Som de vitória
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
    // Após alguns segundos vai para a tela do QR
    const t = setTimeout(() => setScreen("qr"), 5500);
    return () => clearTimeout(t);
  }, [setScreen]);

  const label = winnerIndex != null ? slices[winnerIndex].label : "—";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <div
        ref={cardRef}
        className="w-[80%] max-w-[800px] rounded-2xl shadow-2xl p-8 text-center border"
      >
        {/* Aqui você pode usar sua imagem de referência de layout da tela 2 */}
        <div className="text-3xl font-bold text-engieDark mb-3">Resultado</div>
        <div className="text-5xl font-extrabold text-engieBlue mb-6">
          {label}
        </div>
        <div className="text-slate-600">
          Aguarde um instante... vamos te mostrar nosso QR
        </div>

        <div className="mt-8">
          <button
            className="px-8 py-3 rounded-xl bg-engieBlue text-white text-xl font-semibold"
            onClick={() => setScreen("qr")}
          >
            IR PARA QR CODE
          </button>
        </div>
      </div>
    </div>
  );
}
