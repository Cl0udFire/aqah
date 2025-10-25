import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "../index.css";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import QuestionsPage from "./pages/QuestionsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PlaygroundPage from "./pages/PlaygroundPage.jsx";

function App() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        setUser({ uid, displayName, email, photoURL });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);

  return (
    <BrowserRouter>
      <AuthModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
