import { useEffect, useState } from "react";
import { useAppStore } from "../context/store";
import Topbar from "../components/Topbar";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  /* justify-content: center; */
  margin-top: 150px;
`;
const Slogan = styled.div`
  font-size: 56px;
  color: #111111;
  text-align: center;
  letter-spacing: -1px;
  font-weight: bold;
`;

const Highlight = styled.span`
  color: #3b82f6;
`;

const GradientBackground = styled.div`
  position: absolute;
  width: 850px;
  height: 150px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(255, 0, 150, 9%) 0%,
    rgba(255, 100, 0, 9%) 15%,
    rgba(255, 200, 0, 9%) 30%,
    rgba(100, 255, 0, 9%) 45%,
    rgba(0, 150, 255, 9%) 60%,
    rgba(150, 0, 255, 9%) 75%,
    rgba(255, 0, 100, 9%) 90%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
  top: 290px;
  filter: blur(40px);
`;

const SearchBox = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  border: 2px solid #eee;
  border-radius: 9999px;
  padding: 18px 30px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
  position: relative;
  background-color: color-mix(in oklab, #f8fafc 50%, transparent);
`;
const SearchButton = styled.button`
  margin-left: 16px;
  border: none;
  color: #3b82f6;
  border-radius: 9999px;
  font-size: 18px;
  cursor: pointer;
  height: 100%;
  aspect-ratio: 1 / 1;
  box-sizing: content-box;
  padding: 9px;

  &:hover {
    background-color: #00000022;
  }
`;

const Related = styled.div`
  display: ${(props) => (props.enabled ? "flex" : "none")};
  width: 90%;
  max-width: 720px;
  padding-top: 10px;
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  flex-direction: column;
  background-color: color-mix(in oklab, #f8fafc 50%, transparent);
  position: relative;
  z-index: 2;
`;
const Text = styled.div`
  font-size: 24px;
  color: #555555;
  padding: 12.5px 20px;

  &:hover {
    color: #111111;
    background-color: #00000022;
    cursor: pointer;
  }
  &:last-child {
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
  }
`;

const App = () => {
  const user = useAppStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setRelated(
        ["아집에가고싶다", "오늘날씨어때?", "리액트란무엇인가?"].filter((q) =>
          q.includes(query)
        )
      );
    };
    if (query !== "") fetchQuestions();
    else setRelated([]);
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Container>
        <Slogan>
          <Highlight>A</Highlight>ll&nbsp;<Highlight>Q</Highlight>uestions{" "}
          <Highlight>A</Highlight>nswered&nbsp;<Highlight>H</Highlight>ere
        </Slogan>
        <GradientBackground />
        <SearchBox>
          <input
            type="text"
            placeholder="궁금한 내용을 입력해보세요..."
            className="flex-grow outline-none border-none text-2xl bg-transparent"
            defaultValue={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            value={query}
          />
          <SearchButton>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </SearchButton>
        </SearchBox>
        <Related enabled={query !== "" && related.length > 0}>
          {related.map((item, index) => (
            <Text key={index} onClick={() => setQuery(item)}>
              {item}
            </Text>
          ))}
        </Related>
      </Container>
    </div>
  );
};

export default App;

// 나의 교과 실력을 친구에게
//자유롭게 묻고 답해요
// #멘토멘티
// OO님 함께해요!
// 로그인 해서 서로의 지식을 공유해요
// 정보의 격차를 줄여갑니다
//
