import { NavLink, useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComputer, faPlus } from "@fortawesome/free-solid-svg-icons";
import QuestionList from "../components/QuestionList.jsx";
import { useEffect, useState } from "react";

const Container = styled.div`
  display: grid;

  width: 100%;
  max-width: 1350px;
  align-self: center;

  grid-template-columns: 5fr 2fr;

  grid-template-rows: auto 1fr;
  gap: 25px;
  padding: 20px;
  height: calc(100vh - 84px);
`;

const WriteButton = styled.button`
  width: 125px;
  padding: 10px;
  border-radius: 99999px;
  background-color: #3b82f6;
  color: white;
  grid-column: 1;
  grid-row: 1;
`;

const StyledQuestionList = styled.div`
  grid-column: 1;
  grid-row: 2;
`;

const GPTSummaryBox = styled.div`
  grid-column: 2;
  grid-row: 2;
  border: 2px solid #eeeeee;
  border-radius: 12px;
  padding: 20px;
  background-color: #f9fafb;
  font-size: 24px;
  min-width: 350px;
`;

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      // Todo: DB 연결. 검색한 결과(query)에 따른
      setQuestions(
        [
          {
            id: 1,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
          {
            id: 2,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요22!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
          {
            id: 3,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요333!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
          {
            id: 4,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요4444!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
          {
            id: 5,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요55555!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
          {
            id: 6,
            subject: "컴퓨터 시스템 일반",
            title: "프로세스 스케줄링을 모르겠어요66666!",
            content:
              "FCFS, SJF, RR 등 다양한 스케줄링 알고리즘이 헷갈립니다. 최대한 쉽게 설명해주세요.",
          },
        ].filter(
          (question) =>
            question.title.includes(query) ||
            question.content.includes(query) ||
            question.subject.includes(query)
        )
      );
    };
    fetchQuestions();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Container>
        <WriteButton>
          <NavLink to="/questions">
            새로 작성
            <FontAwesomeIcon icon={faPlus} />
          </NavLink>
        </WriteButton>
        <StyledQuestionList className="y-scroll flex flex-col gap-4 max-h-[100%] overflow-y-auto">
          {questions.map((question) => {
            console.log(question);
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
                  <p className="text-[1rem] text-gray-700">
                    {question.content}
                  </p>
                </div>
              </div>
            );
          })}
        </StyledQuestionList>

        <GPTSummaryBox>
          아 너무나도
          <br />
          집에 가고싶은 하루야.
        </GPTSummaryBox>
      </Container>
    </div>
  );
};

export default SearchPage;
