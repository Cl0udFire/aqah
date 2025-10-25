import { useEffect, useMemo, useState, useRef } from "react";
import Topbar from "../components/Topbar";
import QuestionSelector from "../components/QuestionSelector";
import QuestionList from "../components/QuestionList";
import { getReceivedQuestionList, getSentQuestionList } from "../firebase/db";
import { useAppStore } from "../context/store";
import Loading from "../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faQuestionCircle, faPlus } from "@fortawesome/free-solid-svg-icons";

const QuestionsPage = () => {
  const [currentFilter, setCurrentFilter] = useState("received");
  const user = useAppStore((state) => state.user);
  // const mockData = useMemo(
  //   () => ({
  //     received: [
  //       {
  //         id: 1,
  //         subject: "컴퓨터 시스템 일반",
  //         title: "프로세스 스케줄링을 모르겠어요!",
  //         content: "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
  //       },
  //       {
  //         id: 1,
  //         subject: "컴퓨터 시스템 일반",
  //         title: "프로세스 스케줄링을 모르겠어요!",
  //         content: "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
  //       },
  //       {
  //         id: 1,
  //         subject: "컴퓨터 시스템 일반",
  //         title: "프로세스 스케줄링을 모르겠어요!",
  //         content: "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
  //       },
  //     ],
  //     sent: [
  //       {
  //         id: 201,
  //         to: "홍길동",
  //         content: "사용자 피드백 수집 자동화에 대해 의견이 궁금해요.",
  //         sentAt: "2024. 03. 22 · 08:17",
  //         status: "pending",
  //         statusLabel: "대기 중",
  //         respondent: "홍길동",
  //         expectedReply: "3월 25일",
  //       },
  //       {
  //         id: 202,
  //         to: "이영희",
  //         content: "지난 스프린트 회고 자료 공유 가능할까요?",
  //         sentAt: "2024. 03. 19 · 11:02",
  //         status: "answered",
  //         statusLabel: "답변 수신",
  //         respondent: "이영희",
  //         expectedReply: "3월 20일",
  //       },
  //       {
  //         id: 203,
  //         to: "김철수",
  //         content: "오프라인 밋업 진행 시 필요한 준비물이 있을까요?",
  //         sentAt: "2024. 03. 15 · 16:48",
  //         status: "archived",
  //         statusLabel: "종료됨",
  //         respondent: "김철수",
  //       },
  //     ],
  //   }),
  //   []
  // );
  let questions = useRef({ received: [], sent: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    getReceivedQuestionList(user)
      .then((data) => {
        console.log(data);
        questions.current.received = data;
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });

    getSentQuestionList(user)
      .then((data) => {
        console.log(data);
        questions.current.sent = data;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  if (isLoading) {
    return <Loading />;
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
            <button className="w-[7rem] h-[2.5rem] bg-blue-500 text-white flex justify-center items-center rounded-xl gap-2">
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
