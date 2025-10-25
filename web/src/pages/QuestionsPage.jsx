import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import QuestionSelector from "../components/QuestionSelector";
import QuestionList from "../components/QuestionList";
import { subscribeToReceivedQuestions, subscribeToSentQuestions, issueQuestion } from "../firebase/db";
import { useAppStore } from "../context/store";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faQuestionCircle, faPlus } from "@fortawesome/free-solid-svg-icons";

const QuestionsPage = () => {
  const [currentFilter, setCurrentFilter] = useState("received");
  const user = useAppStore((state) => state.user);
  const [questions, setQuestions] = useState({ received: [], sent: [] });
  const [isLoading, setIsLoading] = useState(true);

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

  

  async function test() {
    console.log("ABC");
    await issueQuestion("주승민은 유일신이며", "ChatGPT는 그의 사도이다.", user);
  }

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
            <button className="w-[7rem] h-[2.5rem] bg-blue-500 text-white flex justify-center items-center rounded-xl gap-2"
            onClick={async () => { await test() }}>
              <FontAwesomeIcon icon={faPlus} />
              질문하기
            </button>
          </div>
 
          <QuestionList questions={questions} type={currentFilter} />
        </div>
      </main>
    </div>
  );
};

export default QuestionsPage;
