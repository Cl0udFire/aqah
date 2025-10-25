import { getFirestore, addDoc, collection, getDocs, where, query, or } from 'firebase/firestore'
import app from './firebase'
const db = getFirestore(app) // 기본 앱에서 Firestore 인스턴스 획득

export async function issueQuestion(title, content, questioner) {
  const docRef = await addDoc(collection(db, 'questions'), {
    title,
    content,
    questioner,
  })
  console.log('Document written with ID: ', docRef.id)
}

export async function getReceivedQuestionList(user) {
  const uid = user?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')

  // 규칙: questioner == uid 또는 assignee == uid 만 열람 가능
  // 쿼리도 동일 제약으로 구성합니다(OR 쿼리). 필요 시 콘솔에서 인덱스 생성 안내가 뜰 수 있습니다.
  const q = query(
    collection(db, 'questions'),
    or(
      // where('questioner', '==', uid),
      where('assignee', '==', uid)
    )
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getSentQuestionList(user) {
  const uid = user?.uid
  if (!uid) throw new Error('로그인이 필요합니다.')

  // 규칙: questioner == uid 또는 assignee == uid 만 열람 가능
  // 쿼리도 동일 제약으로 구성합니다(OR 쿼리). 필요 시 콘솔에서 인덱스 생성 안내가 뜰 수 있습니다.
  const q = query(
    collection(db, 'questions'),
    or(
      where('questioner', '==', uid),
      // where('assignee', '==', uid)
    )
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
