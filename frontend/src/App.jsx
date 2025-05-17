import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DndScreen from "./pages/DndScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/robotGame" element={<DndScreen />} />
    </Routes>
  );
}

export default App
