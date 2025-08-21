import wheelImg from "@/assets/wheel.jpg";
import { useStore, SPIN_MS } from "@/state/useStore";

export default function Wheel() {
  const rotation = useStore((s) => s.currentRotation);
  const isSpinning = useStore((s) => s.isSpinning);
  const spinTo = useStore((s) => s.spinTo);

  return (
    <div className="relative mx-auto w-[min(90vw,900px)] aspect-square select-none">
      {/* Ponteiro fixo - topo, apontando para baixo */}
      <div className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[32px] border-t-sky-500 drop-shadow-md" />
      </div>

      {/* Disco que gira */}
      <div
        className="absolute inset-0 rounded-full will-change-transform transform-gpu"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${SPIN_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
            : "none",
          transformOrigin: "50% 50%",
        }}
      >
        <img
          src={wheelImg}
          alt="Roleta"
          className="w-full h-full rounded-full pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Botão GIRAR */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2">
        <button
          onClick={() => spinTo()}
          disabled={isSpinning}
          className="px-8 py-4 rounded-2xl bg-sky-500 text-white text-lg font-semibold shadow disabled:opacity-50"
        >
          GIRAR
        </button>
      </div>
    </div>
  );
}
