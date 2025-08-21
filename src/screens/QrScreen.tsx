import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../state/useStore";

const LINKTREE_URL = "https://linktr.ee/engiebrasil";

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

export default function QrScreen() {
  const { setScreen } = useStore();
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(LINKTREE_URL, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10,
    })
      .then(setQr)
      .catch(() => setQr(""));
    const t = setTimeout(() => setScreen("wheel"), 60 * 1000);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-2xl text-[#003A5D] font-semibold text-center">
          Siga nossa página e fique por dentro das nossas ações.
        </div>
        {qr ? (
          <img
            src={qr}
            alt="QR Code"
            className="w-[480px] h-[480px] shadow-lg border"
          />
        ) : (
          <div className="text-slate-500">Gerando QR...</div>
        )}
        <button
          className="px-8 py-3 rounded-xl bg-[#00AEEF] text-white text-xl font-semibold"
          onClick={() => setScreen("wheel")}
        >
          VOLTAR PARA A ROLETA
        </button>
      </div>
    </div>
  );
}
