import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../state/useStore";

const LINKTREE_URL = "https://linktr.ee/engiebrasil";

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

/** Tela 3 — QR maior e textos destacados, tudo centralizado */
export default function QrScreen() {
  const { setScreen } = useStore();
  const [qr, setQr] = useState<string>("");

  // Gera o QR como DataURL (imagem)
  useEffect(() => {
    QRCode.toDataURL(LINKTREE_URL, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10, // tamanho base do QR; exibimos em 576px via CSS
    })
      .then(setQr)
      .catch(() => setQr(""));

    // volta automático após 60s (remova se não quiser)
    const t = setTimeout(() => setScreen("wheel"), 60_000);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <div className="min-h-screen bg-white grid grid-rows-[auto_1fr]">
      {/* Logo centralizado */}
      <header className="py-6 flex items-center justify-center">
        <Logo />
      </header>

      {/* Centro */}
      <main className="grid place-items-center px-4">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#003A5D] text-center">
            Siga nossa página e fique por dentro das nossas ações.
          </h1>

          {qr ? (
            <img
              src={qr}
              alt="QR Code"
              className="w-[576px] h-[576px] shadow-xl border rounded-xl bg-white"
              draggable={false}
            />
          ) : (
            <div className="text-slate-500">Gerando QR...</div>
          )}

          <button
            className="mt-2 px-8 py-3 rounded-xl bg-[#00AEEF] text-white text-xl font-semibold"
            onClick={() => setScreen("wheel")}
          >
            VOLTAR PARA A ROLETA
          </button>
        </div>
      </main>
    </div>
  );
}
