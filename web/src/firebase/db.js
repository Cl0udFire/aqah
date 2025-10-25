import {
  getFirestore,
  addDoc,
  collection,
  where,
  query,
  or,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import app from './firebase'
const db = getFirestore(app) // 기본 앱에서 Firestore 인스턴스 획득

export async function issueQuestion(title, content, questioner) {
  const uid = questioner?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')
  const docRef = await addDoc(collection(db, 'questions'), {
    title,
    content,
    questioner: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  console.log('Document written with ID: ', docRef.id)
}

function createQuestionsSnapshotHandler(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

function createQuestionsQuery(filter) {
  return query(collection(db, 'questions'), filter, orderBy('createdAt', 'desc'))
}

export function subscribeToReceivedQuestions(user, onUpdate, onError) {
  const uid = user?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')

  const q = createQuestionsQuery(
    or(
      // where('questioner', '==', uid),
      where('assignee', '==', uid)
    )
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate?.(createQuestionsSnapshotHandler(snapshot))
    },
    onError
  )
}

export function subscribeToSentQuestions(user, onUpdate, onError) {
  const uid = user?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')

  const q = createQuestionsQuery(
    or(
      where('questioner', '==', uid),
      // where('assignee', '==', uid)
    )
  )

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate?.(createQuestionsSnapshotHandler(snapshot))
    },
    onError
  )
}

export function getChat(questionId, callback) {
  const messagesRef = collection(db, 'questions', questionId, 'messages')
  const q = query(messagesRef, orderBy('timestamp', 'asc'))
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages)
  })
}

export async function sendMessage(questionId, userId, text) {
  const messagesRef = collection(db, 'questions', questionId, 'messages')
  await addDoc(messagesRef, {
    userId,
    text,
    timestamp: serverTimestamp()
  })
}
