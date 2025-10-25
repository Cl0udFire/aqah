import { useEffect, useState } from "react";
import app from "../firebase/firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAppStore } from "../context/store";
import Topbar from "../components/Topbar";
import { getQuestionList, issueQuestion } from "../firebase/db";
import styled from "styled-components";
import fire from "./../assets/fire-nuki.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  margin-left: 250px;
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

const Orange = styled.span`
  color: #ff8800;
`;

const GradientBackground = styled.div`
  position: absolute;
  width: 900px;
  height: 900px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 0, 150, 0.08) 0%,
    rgba(255, 100, 0, 0.08) 15%,
    rgba(255, 200, 0, 0.08) 30%,
    rgba(100, 255, 0, 0.08) 45%,
    rgba(0, 150, 255, 0.08) 60%,
    rgba(150, 0, 255, 0.08) 75%,
    rgba(255, 0, 100, 0.08) 90%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
  margin-top: -200px;
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
`;
const SearchButton = styled.button`
  margin-left: 16px;
  border: none;
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
  width: 95%;
  max-width: 760px;
  padding-top: 50px;
  transform: translateY(-40px);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  flex-direction: column;
`;
const Text = styled.div`
  font-size: 24px;
  color: #555555;
  padding: 12.5px 20px;

  &:hover {
    color: #111111;
    background-color: #f0f0f0;
    cursor: pointer;
  }
  &:last-child {
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
  }
`;

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const App = () => {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [query, setQuery] = useState("");
  const [related, setRelated] = useState([]);

  //   const [questions, setQuestions] = useState([]);

  //   useEffect(() => {
  //     const fetchQuestions = async () => {
  //       try {
  //         if (!user) {
  //           setQuestions([]);
  //           return;
  //         }
  //         // 필요에 따라 getQuestionList(user.uid)로 변경하세요.
  //         const list = await getQuestionList(user);
  //         setQuestions(Array.isArray(list) ? list : []);
  //       } catch (e) {
  //         console.error("[questions] fetch error:", e);
  //         setQuestions([]);
  //       }
  //     };
  //     fetchQuestions();
  //   }, [user]);

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        console.log(result.user);
      })
      .catch((error) => console.log(error));
  };

  const handleLogout = () => {
    setUser(null);
    auth.signOut();
  };

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
    fetchQuestions();
  }, [query]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Container>
        {/* {!user && (
          <div className="flex items-center justify-center min-h-screen">
            <img
              className="cursor-pointer hover:opacity-80 transition-opacity w-64"
              onClick={() => handleLogin()}
              src="https://media.geeksforgeeks.org/wp-content/uploads/20240520175106/Google_SignIn_Logo.png"
              alt="Sign in with Google"
            />
          </div>
        )}
        {user && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <h1 className="text-5xl font-bold text-center text-blue-600 mb-4">
                로그인 성공!
              </h1>
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md"
                />
                <div className="text-center space-y-2 w-full">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    이름: {user.displayName}
                  </h2>
                  <h2 className="text-xl text-gray-600">
                    이메일: {user.email}
                  </h2>
                </div>
                <button
                  onClick={() => handleLogout()}
                  className="mt-6 px-8 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-medium rounded-lg shadow-md transition-colors duration-200"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )} */}
        <Slogan>
          <Orange>A</Orange>ll&nbsp;<Orange>Q</Orange>uestions{" "}
          <Orange>A</Orange>nswered&nbsp;<Orange>H</Orange>ere
        </Slogan>
        <GradientBackground />
        <SearchBox className="bg-slate-50">
          <input
            type="text"
            placeholder="궁금한 내용을 입력해보세요..."
            className="flex-grow outline-none border-none text-2xl bg-slate-50"
            defaultValue={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <SearchButton className="bg-blue-500 text-white flex items-center justify-center">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </SearchButton>
        </SearchBox>
        <Related className="bg-slate-50" enabled={query && related.length > 0}>
          {related.map((item, index) => (
            <Text key={index}>{item}</Text>
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
