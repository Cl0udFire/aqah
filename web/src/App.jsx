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
import RankingPage from "./pages/RankingPage.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { auth } from "./firebase/firebase.js";
import { useAppStore } from "./context/store.js";

function App() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        {/* Learn : 채팅 ui 상대: ai/ 배경 */}``
      </Routes>
      <AuthModal />
    </BrowserRouter>
  );
}

export default App;
