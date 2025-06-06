import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import RobotGame from "./pages/robotGame";
import EditorPage from "./pages/Editors";

function App() {
  return (
    <Routes>
      <Route path="/"               element={<Home />} />
      <Route path="/robotGame"      element={<RobotGame />} />
      <Route path="/editors"        element={<EditorPage />}/>
    </Routes>
  );
}

export default App
