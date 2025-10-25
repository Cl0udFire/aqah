import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComputer,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const hasAnswerFromAnswerer = (answers) => {
  if (!answers) return false;
  if (Array.isArray(answers)) {
    return answers.some((entry) => entry && entry.sender === "answerer");
  }
  if (typeof answers === "object") {
    return answers.sender === "answerer";
  }
  return false;
};

// const STATUS_STYLES = {
//   pending: "bg-amber-50 text-amber-700 border-amber-200",
//   answered: "bg-emerald-50 text-emerald-700 border-emerald-200",
//   archived: "bg-gray-100 text-gray-600 border-gray-200",
// };

const ConfirmButton = styled.button`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 255, 0, 0.2);
  }
`;

const DeclineButton = styled.button`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(255, 0, 0, 0.2);
  }
`;

const QuestionList = ({ questions, type }) => {
  const questionItems = questions?.[type] ?? [];

  if (!questionItems.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
        <div className="text-center text-sm">
          <p className="font-medium text-gray-700">
            {type === "received"
              ? "받은 질문이 없습니다"
              : "보낸 질문이 없습니다"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            새로운 질문이 등록되면 이곳에서 확인할 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="y-scroll flex flex-col gap-4 max-h-[600px] overflow-y-auto">
        {questionItems.map((question) => {
          const answeredByAssignee = hasAnswerFromAnswerer(question.answers);
          // const statusClass = STATUS_STYLES[question.status] ?? STATUS_STYLES.pending;
          return (
            <div
              key={question.id}
              className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm h-[10rem] flex justify-start items-start"
            >
              <div className="flex">
                <div className="flex flex-col gap-3 items-center w-min-[7rem] w-[7rem]">
                  <div className="w-[5rem] h-[5rem] border-blue-500 border-4 rounded-2xl bg-blue-300 flex justify-center items-center">
                    <FontAwesomeIcon
                      icon={faComputer}
                      fontSize="2.5rem"
                      color="black"
                    />
                  </div>
                  <span className="text-[0.875rem]">{question.subject}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 ml-[2rem] w-[85%]">
                <span className="text-black font-bold text-[1.4rem]">
                  {question.title}
                </span>
                <p className="text-[1rem] text-gray-700">{question.content}</p>

                {type === "received" ? (
                  <div className="flex justify-end items-center gap-4">
                    <ConfirmButton className="bg-green-200 w-[7rem] h-[2.5rem] flex justify-center items-center rounded-[0.5rem] mt-2 gap-2 border-2 border-green-400">
                      <FontAwesomeIcon
                        icon={faCheck}
                        fontSize="1rem"
                        color="green"
                      />
                      <NavLink to={`/chat?id=${question.id}`}>
                        <span>답변하기</span>
                      </NavLink>
                    </ConfirmButton>
                    <DeclineButton className="bg-red-200 w-[7rem] h-[2.5rem] flex justify-center items-center rounded-[0.5rem] mt-2 gap-2 border-2 border-red-400">
                      {/* TODO: Question Decline 구현 */}
                      <FontAwesomeIcon
                        icon={faXmark}
                        fontSize="1rem"
                        color="red"
                      />
                      거절하기
                    </DeclineButton>
                  </div>
                ) : (
                  <div className="flex justify-end items-center gap-4 mt-6">
                    {answeredByAssignee ? (
                      <NavLink
                        to={`/chat?id=${question.id}`}
                        className="flex h-[2.5rem] min-w-[7rem] items-center justify-center gap-2 rounded-[0.5rem] border-2 border-blue-400 bg-blue-200 px-4 text-sm font-semibold text-blue-900 transition hover:bg-blue-300"
                      >
                        답변 보기
                      </NavLink>
                    ) : (
                      <p>아직 답변이 도착하지 않았습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionList;
