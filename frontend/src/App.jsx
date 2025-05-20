import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DndScreen from "./pages/DndScreen";
import Editors from "./pages/Editors"

function App() {
  return (
    <Routes>
      <Route path="/"           element={<Home />} />
      <Route path="/robotGame"  element={<DndScreen />}/>
      <Route path="/editors"   element={<Editors />} />
      
    </Routes>
  );
}

export default App
