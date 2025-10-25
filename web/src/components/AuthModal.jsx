import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAppStore } from "../context/store";

const AuthModal = () => {
  const isOpen = useAppStore((state) => state.isAuthModalOpen);
  const closeModal = useAppStore((state) => state.closeAuthModal);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleBackdropClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget && !submitting) {
        closeModal();
      }
    },
    [closeModal, submitting]
  );

  const handleGoogleLogin = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "로그인 중 문제가 발생했습니다. 다시 시도해주세요.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [closeModal]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="auth-modal__container">
        <div className="auth-card">
          <h1 id="auth-modal-title">로그인이 필요합니다</h1>
          <p className="description">
            Google 계정으로 로그인하여 질문을 올리고 답변을 확인하세요.
          </p>
          {error ? <div className="error">{error}</div> : null}
          <div className="actions">
            <button
              type="button"
              className="button button--primary"
              onClick={handleGoogleLogin}
              disabled={submitting}
            >
              {submitting ? "로그인 중..." : "Google 계정으로 로그인"}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={closeModal}
            >
              취소
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          z-index: 1000;
        }

        .auth-modal__container {
          width: 100%;
          max-width: 420px;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
        }

        .auth-card .button[disabled] {
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default AuthModal;
