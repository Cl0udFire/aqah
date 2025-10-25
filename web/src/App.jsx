import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "../index.css";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";

const toError = (error) => {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return new Error(error.message);
  }

  return new Error(String(error));
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
