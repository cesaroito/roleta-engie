import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useStore } from "../state/useStore";

const LINKEDIN_URL =
  "https://www.linkedin.com/company/engie-brasil/posts/?feedView=all";

export default function QrScreen() {
  const { setScreen } = useStore();
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(LINKEDIN_URL, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10,
    })
      .then(setQr)
      .catch(() => setQr(""));
    const t = setTimeout(() => setScreen("wheel"), 60 * 1000); // 1 minuto
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-between py-8">
      <img src="/engie-logo.png" alt="ENGIE" className="h-12 mt-2" />
      <div className="text-center px-6">
        <div className="text-2xl text-engieDark font-semibold mb-2">
          Siga nossa página e fique por dentro das nossas ações.
        </div>
        {qr ? (
          <img
            src={qr}
            alt="QR Code"
            className="mx-auto w-[480px] h-[480px] shadow-lg border"
          />
        ) : (
          <div className="text-slate-500">Gerando QR...</div>
        )}
      </div>
      <div className="pb-6">
        <button
          className="px-8 py-3 rounded-xl bg-engieBlue text-white text-xl font-semibold"
          onClick={() => setScreen("wheel")}
        >
          VOLTAR PARA A ROLETA
        </button>
      </div>
    </div>
  );
}
