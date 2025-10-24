import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";
import HomePage from "./HomePage.jsx";
import HomePage2 from "./HomePage copy.jsx";
import {
  auth,
  beginGoogleSignIn,
  completeRedirectSignIn,
  signOutUser,
} from "./firebase/firebaseApp.js";

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
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    completeRedirectSignIn()
      .then((result) => {
        if (!isMounted) return;
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setAuthError(toError(error));
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!isMounted) return;
        setUser(currentUser);
        setPending(false);
      },
      (error) => {
        if (!isMounted) return;
        setAuthError(toError(error));
        setPending(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = useCallback(async () => {
    setAuthError(null);
    setPending(true);
    try {
      const result = await beginGoogleSignIn();
      if (result?.user) {
        setUser(result.user);
        setPending(false);
        return;
      }

      if (result === null) {
        return;
      }
    } catch (error) {
      setAuthError(toError(error));
      setPending(false);
      return;
    }
    setPending(false);
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthError(null);
    setPending(true);
    try {
      await signOutUser();
    } catch (error) {
      setAuthError(toError(error));
    } finally {
      setPending(false);
    }
  }, []);

  const errorMessage = authError
    ? authError.message || "알 수 없는 오류가 발생했습니다."
    : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              pending={pending}
              errorMessage={errorMessage}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/aaaa" element={<HomePage2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
