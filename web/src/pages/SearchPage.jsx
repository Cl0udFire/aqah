import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "../context/store";
import Topbar from "../components/Topbar";
import Loading from "../components/Loading";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComputer, faPlus, faReply } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { getQuestionsLike } from "../firebase/db";

const Container = styled.div`
  display: grid;

  width: 100%;
  max-width: 1350px;
  align-self: center;

  grid-template-columns: 1fr 5fr 1fr;

  grid-template-rows: auto 1fr;
  gap: 25px;
  padding: 20px;
  margin-top: 15px;
  height: calc(100vh - 84px);
`;
const DIV = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  & > {
    display: inline-block;
  }
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  align-items: end;
`;
const WriteButton = styled.button`
  width: 125px;
  padding: 10px;
  border-radius: 99999px;
  background-color: #3b82f6;
  color: white;
  grid-column: 3;
  grid-row: 1;
  justify-self: right;
  align-self: end;
`;

const StyledQuestionList = styled.div`
  grid-column: 2;
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
  const user = useAppStore((s) => s.user);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q");

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestions(
        // 추천 검색어 목록
        await getQuestionsLike(user, query)
      );
      setIsLoading(false);
    };
    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Topbar />
        <Loading />
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Container>
        <DIV>
          <header className="space-y-2 col-span-2">
            <h1 className="text-[2rem] font-bold text-gray-900">검색 결과</h1>
            <p className="text-sm text-gray-500">
              이미 궁금한 점을 해결하신 분들의 답변을 확인해보세요!
            </p>
          </header>
          <NavLink to="/questions">
            <WriteButton>
              <FontAwesomeIcon icon={faPlus} /> 새로 작성
            </WriteButton>
          </NavLink>
        </DIV>
        <StyledQuestionList className="y-scroll flex flex-col gap-4 h-[600px] overflow-y-auto">
          {questions ? (
            questions.map((question) => {
              return (
                <div
                  key={question.id}
                  className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm h-min-[9rem] h-auto flex justify-start items-start"
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
                      {/* <span className="text-[0.875rem]">{question.subject}</span> */}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-[2rem] w-[85%]">
                    <span className="text-black font-bold text-[1.4rem]">
                      {question.title}
                    </span>
                    <p className="text-[1rem] text-gray-700">
                      {question.content}
                    </p>
                    <hr className="mt-1 mb-1" />
                    <p>
                      <FontAwesomeIcon
                        style={{ transform: "scale(-1, -1)" }}
                        icon={faReply}
                      />
                      &nbsp;{question.answers[0].content}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <span>검색 결과가 없습니다.</span>
          )}
        </StyledQuestionList>

        {/* <GPTSummaryBox className="h-[600px] overflow-y-auto">
          <h1 className="font-bold text-center">GPT 요약</h1>
          <br />
          {"아 너무나도\n집에 가고싶은 하루야.\n진짜로."
            .split("\n")
            .map((line, index) => (
              <>
                <span key={index}>{line}</span>
                <br />
              </>
            ))}
        </GPTSummaryBox> */}
      </Container>
    </div>
  );
};

export default SearchPage;
