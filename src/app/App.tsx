import { useStore } from "../state/useStore";
import WheelScreen from "../screens/WheelScreen";
import ResultScreen from "../screens/ResultScreen";
import QrScreen from "../screens/QrScreen";

export default function App() {
  const screen = useStore((s) => s.screen);
  return (
    <div className="app-portrait">
      {screen === "wheel" && <WheelScreen />}
      {screen === "result" && <ResultScreen />}
      {screen === "qr" && <QrScreen />}
    </div>
  );
}
