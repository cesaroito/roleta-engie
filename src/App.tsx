import Wheel from "@/components/Wheel";
import { useStore } from "@/state/useStore";

export default function App() {
  const screen = useStore((s) => s.screen);
  const slices = useStore((s) => s.slices);
  const winnerIndex = useStore((s) => s.winnerIndex);
  const reset = useStore((s) => s.reset);

  if (screen === "result") {
    const winner = winnerIndex != null ? slices[winnerIndex] : null;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-white to-sky-50">
        <h1 className="text-2xl font-bold">Resultado</h1>
        <p className="text-xl">
          {winner ? `Parou em: ${winner.label}` : "Sem resultado"}
        </p>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-xl bg-sky-600 text-white"
        >
          Voltar para a roleta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-sky-50">
      <Wheel />
    </div>
  );
}
