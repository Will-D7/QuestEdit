import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RobotGame from "./pages/RobotGame";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/robotGame" element={<RobotGame />} />
    </Routes>
  );
}

export default App
