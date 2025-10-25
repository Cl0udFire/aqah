import { useEffect, useState } from "react";
import app from "../firebase/firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAppStore } from "../context/store";
import Sidebar from "../components/Sidebar";
import { getQuestionList, issueQuestion } from "../firebase/db";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const App = () => {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[250px] p-8">
        {!user && (
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
        )}
      </div>
    </div>
  );
};

export default App;
