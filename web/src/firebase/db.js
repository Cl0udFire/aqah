import {getFirestore, addDoc, collection,getDocs, or, where, query} from "firebase/firestore";

async function issueQuestion(title, content, questioner) {
  const db = getFirestore();
  const docRef = await addDoc(collection(db, "questions"), {
    title,
    content,
    questioner
  });
  console.log("Document written with ID: ", docRef.id);
}

async function getQuestionList(user) {
  const db = getFirestore()

  const uid = user?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')

  const q = query(
    collection(db, 'questions'),
    or(
      where('questioner', '==', uid)
    )
  )

  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
export { issueQuestion, getQuestionList };
