import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "../components/Topbar";
import QuestionSelector from "../components/QuestionSelector";
import QuestionList from "../components/QuestionList";
import { subscribeToReceivedQuestions, subscribeToSentQuestions, issueQuestion } from "../firebase/db";
import { useAppStore } from "../context/store";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const QuestionsPage = () => {
  const [currentFilter, setCurrentFilter] = useState("received");
  const user = useAppStore((state) => state.user);
  const [questions, setQuestions] = useState({ received: [], sent: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  const canOpenComposer = useMemo(() => Boolean(user?.uid), [user]);

  useEffect(() => {
    if (!isComposerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsComposerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isComposerOpen]);

  useEffect(() => {
    if (!isComposerOpen) return;
    const element = firstFieldRef.current;
    element?.focus?.();
  }, [isComposerOpen]);

  useEffect(() => {
    if (!user) {
      setQuestions({ received: [], sent: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribers = [];
    const initialLoad = { received: false, sent: false };

    const handleInitialLoad = () => {
      if (initialLoad.received && initialLoad.sent) {
        setIsLoading(false);
      }
    };

    const handleError = (error) => {
      console.error("Error subscribing to questions:", error);
      setIsLoading(false);
    };

    unsubscribers.push(
      subscribeToReceivedQuestions(
        user,
        (data) => {
          initialLoad.received = true;
          setQuestions((prev) => ({ ...prev, received: data }));
          handleInitialLoad();
        },
        handleError
      )
    );

    unsubscribers.push(
      subscribeToSentQuestions(
        user,
        (data) => {
          initialLoad.sent = true;
          setQuestions((prev) => ({ ...prev, sent: data }));
          handleInitialLoad();
        },
        handleError
      )
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  

  const closeComposer = () => {
    setIsComposerOpen(false);
    setTitle("");
    setContent("");
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!user?.uid) {
      setSubmitError("질문을 등록하려면 로그인이 필요합니다.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setSubmitError("질문 제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await issueQuestion(trimmedTitle, trimmedContent, user);
      closeComposer();
    } catch (error) {
      console.error("Failed to submit question", error);
      setSubmitError("질문을 등록하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="ml-[100px] flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-[2rem] font-bold text-gray-900">
              1:1 질문함
            </h1>
            <p className="text-sm text-gray-500">
              궁금한 점을 질문하고 답변을 받아보세요!
            </p>
          </header>

          <div className="flex justify-between items-center">
            <QuestionSelector value={currentFilter} onChange={setCurrentFilter} />
            <button
              className="w-[7rem] h-[2.5rem] bg-blue-500 text-white flex justify-center items-center rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setSubmitError("");
                setIsComposerOpen(true);
              }}
              disabled={!canOpenComposer}
            >
              <FontAwesomeIcon icon={faPlus} />
              질문하기
            </button>
          </div>

          <QuestionList questions={questions} type={currentFilter} />
        </div>
      </main>

      {isComposerOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8"
          role="presentation"
          onClick={() => {
            if (!isSubmitting) {
              closeComposer();
            }
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-composer-title"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
              <header className="space-y-2">
                <h2 id="question-composer-title" className="text-xl font-semibold text-slate-900">
                  새 질문 등록
                </h2>
                <p className="text-sm text-slate-500">궁금한 내용을 자세히 작성해주시면 답변에 도움이 됩니다.</p>
              </header>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">질문 제목</span>
                <input
                  ref={firstFieldRef}
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="어떤 내용을 질문하고 싶으신가요?"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">질문 상세</span>
                <textarea
                  className="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="상황을 설명하고 필요한 답변을 적어주세요."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </label>

              {submitError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:w-auto"
                  onClick={closeComposer}
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionsPage;
