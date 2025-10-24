import { useState } from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage.jsx";
import HomePage2 from "./HomePage copy.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/aaaa" element={<HomePage2 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
