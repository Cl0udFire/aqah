import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Modal from "../components/WriteQModal";

const QuestionsPage = () => {
  const [myQuestion, setMyQuestion] = useState("");
  const [answers, setAnswers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 임시 받은 질문 데이터
  const receivedQuestions = [
    { id: 1, question: "당신의 취미는 무엇인가요?", from: "익명 사용자 1" },
    { id: 2, question: "가장 좋아하는 음식은?", from: "익명 사용자 2" },
    { id: 3, question: "주말에 주로 뭐하시나요?", from: "익명 사용자 3" },
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuestion = () => {
    console.log("질문 제출:", myQuestion);
    setMyQuestion("");
  };

  const handleSubmitAnswer = (questionId) => {
    console.log("답변 제출:", questionId, answers[questionId]);
  };

  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-[250px] p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 모달 테스트 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md"
            >
              모달 열기
            </button>
          </div>

          {/* 질문 작성 섹션 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              질문 작성
            </h2>
            <div className="space-y-3">
              <textarea
                value={myQuestion}
                onChange={(e) => setMyQuestion(e.target.value)}
                placeholder="질문을 입력하세요..."
                className="w-full h-32 p-3 bg-white border border-gray-300 rounded-md focus:border-gray-500 focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {myQuestion.length} / 500
                </span>
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!myQuestion.trim()}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </div>
            </div>
          </div>

          {/* 받은 질문 답변 섹션 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              받은 질문
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {receivedQuestions.length}개의 질문
            </p>

            <div className="space-y-4">
              {receivedQuestions.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-sm">받은 질문이 없습니다</p>
                </div>
              ) : (
                receivedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="mb-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {q.from}
                      </span>
                      <p className="text-base text-gray-900 mt-2">
                        {q.question}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(q.id, e.target.value)
                        }
                        placeholder="답변을 입력하세요..."
                        className="w-full h-24 p-3 bg-white border border-gray-300 rounded-md focus:border-gray-500 focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {(answers[q.id] || "").length} / 1000
                        </span>
                        <div className="space-x-2">
                          <button className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                            건너뛰기
                          </button>
                          <button
                            onClick={() => handleSubmitAnswer(q.id)}
                            disabled={!answers[q.id]?.trim()}
                            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            제출
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">모달 제목</h2>
        <p className="text-sm text-gray-600">모달 내용을 여기에 작성하세요.</p>
      </Modal>
    </div>
  );
};

export default QuestionsPage;
