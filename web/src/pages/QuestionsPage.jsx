import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import QuestionSelector from "../components/QuestionSelector";
import QuestionList from "../components/QuestionList";

const QuestionsPage = () => {
  const [currentFilter, setCurrentFilter] = useState("received");

  const mockData = useMemo(
    () => ({
      received: [
        {
          id: 101,
          from: "익명 사용자 1",
          content: "이번 분기 목표 중 가장 힘든 점은 무엇인가요?",
          sentAt: "2024. 03. 21 · 14:12",
          status: "pending",
          statusLabel: "답변 대기",
          answer: "이번 분기에는 신규 온보딩 자동화가 가장 큰 도전입니다.",
        },
        {
          id: 102,
          from: "익명 사용자 2",
          content: "팀 문화에서 가장 중요하게 생각하는 가치는?",
          sentAt: "2024. 03. 20 · 09:40",
          status: "answered",
          statusLabel: "답변 완료",
          answer:
            "우리는 투명한 커뮤니케이션과 빠른 피드백 사이클을 가장 큰 가치로 보고 있어요.",
        },
        {
          id: 103,
          from: "익명 사용자 3",
          content: "다음 밋업 일정은 언제인가요?",
          sentAt: "2024. 03. 18 · 18:22",
          status: "archived",
          statusLabel: "보관됨",
        },
      ],
      sent: [
        {
          id: 201,
          to: "홍길동",
          content: "사용자 피드백 수집 자동화에 대해 의견이 궁금해요.",
          sentAt: "2024. 03. 22 · 08:17",
          status: "pending",
          statusLabel: "대기 중",
          respondent: "홍길동",
          expectedReply: "3월 25일",
        },
        {
          id: 202,
          to: "이영희",
          content: "지난 스프린트 회고 자료 공유 가능할까요?",
          sentAt: "2024. 03. 19 · 11:02",
          status: "answered",
          statusLabel: "답변 수신",
          respondent: "이영희",
          expectedReply: "3월 20일",
        },
        {
          id: 203,
          to: "김철수",
          content: "오프라인 밋업 진행 시 필요한 준비물이 있을까요?",
          sentAt: "2024. 03. 15 · 16:48",
          status: "archived",
          statusLabel: "종료됨",
          respondent: "김철수",
        },
      ],
    }),
    []
  );

  const questions = mockData[currentFilter];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

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

          <QuestionSelector value={currentFilter} onChange={setCurrentFilter} />

          <QuestionList questions={questions} type={currentFilter} />
        </div>
      </main>
    </div>
  );
};

export default QuestionsPage;
