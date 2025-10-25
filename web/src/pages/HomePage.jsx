import { useEffect, useState } from "react";
import { useAppStore } from "../context/store";
import Topbar from "../components/Topbar";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

import {
  faArrowDown,
  faArrowUp,
  faCaretDown,
  faCaretUp,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import Dropdown from "react-dropdown";
import { keyframes } from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  /* justify-content: center; */
  margin-top: 150px;
`;
const waveAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Slogan = styled.div`
  font-size: 56px;
  text-align: center;
  letter-spacing: -1px;
  font-weight: bold;
  background: linear-gradient(to right, #69c49f, #3b82f6, #7429ba);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${waveAnimation} 5s ease-in-out infinite;
`;

const Highlight = styled.span`
  color: #3b82f6;
`;
// search
// learn
const GradientBackground = styled.div`
  position: absolute;
  width: 850px;
  height: 150px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    rgba(45, 42, 218, 0.3) 0%, /* Light Blue */
    rgba(40, 224, 234, 0.3) 50%, /* Light Green */
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  top: 290px;
  filter: blur(100px);
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
`;

const StyledDropdown = styled(Dropdown)`
  --width: 140px;
  box-sizing: border-box;
  border-color: #3b82f6;
  border-radius: 999px;
  border-width: 2px;
  background-color: #f8fafc;
  .Dropdown-control {
    padding: 9px;
    padding-left: 15px;
    position: relative;
    color: #000000;
    border-color: transparent;
    width: var(--width);
    font-size: 24px;
    z-index: 10;
  }
  .Dropdown-placeholder.is-selected {
    width: calc(var(--width) - 50px);
  }
  .Dropdown-menu {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: calc(var(--width) + 4px);
    padding-top: 4px;
    background-color: #f8fafc;
    color: #000000;
    font-size: 24px;
    padding-top: 27px;
    margin-left: -2px;
    margin-top: -27px;
    z-index: 5;
    border-top: none;
    border-color: #3b82f6;
    border-width: 2px;

    &:last-child {
      border-bottom-left-radius: 27px;
      border-bottom-right-radius: 27px;
    }
  }
  .Dropdown-option {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 50px;
    font-size: 24px;

    &:first-child {
      border-top: 1px solid #222222;
    }
    &:last-child {
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
    }
  }
  .Dropdown-option.is-selected {
    color: #3b82f6;
    background-color: #00000022;
  }
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
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

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

  /// TODO: 검색어를 입력할 때마다 서버에 추천 검색어 호출 필요 (like같은거???).
  useEffect(() => {
    const fetchQuestions = async () => {
      setRelated(
        // 추천 검색어 목록
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
          All Questions Answered Here
        </Slogan>
        <GradientBackground />
        <SearchBox className="bg-slate-100">
          <Select variant="plain" defaultValue="search">
            <Option value="search">Search</Option>
            <Option value="learn">Learn</Option>
          </Select>
          <input
            type="text"
            placeholder="궁금한 내용을 입력해보세요..."
            className="flex-grow outline-none border-none text-2xl bg-transparent ml-4"
            defaultValue={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            value={query}
          />
          <SearchButton>
            <NavLink to={`/search?q=${query}`}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </NavLink>
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
