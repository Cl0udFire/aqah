import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
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
        <Route
          path="/"
          element={
            <HomePage
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
