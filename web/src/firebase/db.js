import {
  getFirestore,
  addDoc,
  collection,
  doc,
  where,
  query,
  or,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  FieldValue,
  Timestamp,
  deleteField
} from "firebase/firestore";
import app from "./firebase";
const db = getFirestore(app); // 기본 앱에서 Firestore 인스턴스 획득

export async function issueQuestion(title, content, questioner) {
  const uid = questioner?.uid;
  if (!uid) throw new Error("로그인이 필요합니다.");
  const docRef = await addDoc(collection(db, "questions"), {
    title,
    content,
    questioner: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log("Document written with ID: ", docRef.id);
}

function createQuestionsSnapshotHandler(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function createQuestionsQuery(filter) {
  return query(
    collection(db, "questions"),
    filter,
    orderBy("createdAt", "desc")
  );
}

export const getQuestionsLike = async (user, keyword) => {
  const uid = user?.uid;
  if (!uid) throw new Error("로그인이 필요합니다.");

  // 쿼리 없이 내 모든 질문 가져오기
  const q = createQuestionsQuery(where("completed", "==", true));

  const snapshot = await getDocs(q);
  let results = createQuestionsSnapshotHandler(snapshot);

  // 키워드가 있으면 클라이언트에서 필터링
  if (keyword && keyword.trim()) {
    const lowerKeyword = keyword.toLowerCase().trim();
    results = results.filter(
      (question) =>
        question.title?.toLowerCase().includes(lowerKeyword) ||
        question.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  return results;
};

export function subscribeToReceivedQuestions(user, onUpdate, onError) {
  const uid = user?.uid;
  if (!uid) throw new Error("로그인이 필요합니다.");

  const q = createQuestionsQuery(
    or(
      // where('questioner', '==', uid),
      where("assignee", "==", uid)
    )
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate?.(createQuestionsSnapshotHandler(snapshot));
    },
    onError
  );
}

export function subscribeToSentQuestions(user, onUpdate, onError) {
  const uid = user?.uid;
  if (!uid) throw new Error("로그인이 필요합니다.");

  const q = createQuestionsQuery(
    or(
      where("questioner", "==", uid)
      // where('assignee', '==', uid)
    )
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate?.(createQuestionsSnapshotHandler(snapshot));
    },
    onError
  );
}

export function subscribeToQuestion(questionId, onUpdate, onError) {
  if (!questionId) throw new Error("질문 ID가 필요합니다.");

  const questionRef = doc(db, "questions", questionId);

  return onSnapshot(
    questionRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate?.(null);
        return;
      }

      onUpdate?.({ id: snapshot.id, ...snapshot.data() });
    },
    onError
  );
}

export async function appendChatMessage(questionId, message) {
  if (!questionId) throw new Error("질문 ID가 필요합니다.");
  const { content, sender, timestamp } = message ?? {};
  if (!content || !content.trim()) throw new Error("메시지 본문이 필요합니다.");
  if (sender !== "questioner" && sender !== "answerer")
    throw new Error("발신자 정보가 올바르지 않습니다.");

  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    answers: arrayUnion({
      content: content.trim(),
      sender,
      timestamp: Timestamp.now(),
    }),
    updatedAt: Timestamp.now(),
  });
}

export async function declineQuestion(questionId, uid) {
  if (!questionId) throw new Error("질문 ID가 필요합니다.");
  console.log(uid)
  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    assignee: deleteField(),
    updatedAt: Timestamp.now(),
    declinedBy: arrayUnion(uid),
  });
}

