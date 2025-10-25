import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Topbar from "../components/Topbar"
import Loading from "../components/Loading"
import { MdEditor, MdPreview, config } from "md-editor-rt"
import "md-editor-rt/lib/style.css"
import "md-editor-rt/lib/preview.css"
import { useAppStore } from "../context/store"
import { subscribeToQuestion, appendChatMessage } from "../firebase/db"

const KO_KR_LOCALE = {
  toolbarTips: {
    bold: "굵게",
    underline: "밑줄",
    italic: "기울임",
    strikeThrough: "취소선",
    title: "제목",
    sub: "아래첨자",
    sup: "위첨자",
    quote: "인용",
    unorderedList: "글머리 기호 목록",
    orderedList: "번호 매기기 목록",
    task: "체크리스트",
    codeRow: "인라인 코드",
    code: "블록 코드",
    link: "링크",
    image: "이미지",
    table: "표",
    mermaid: "Mermaid",
    katex: "수식",
    revoke: "되돌리기",
    next: "다시 실행",
    save: "저장",
    prettier: "서식 정리",
    pageFullscreen: "페이지 전체 화면",
    fullscreen: "전체 화면",
    preview: "미리보기",
    previewOnly: "미리보기 전용",
    htmlPreview: "HTML 미리보기",
    catalog: "목차",
    github: "소스 코드",
  },
  titleItem: {
    h1: "제목 1",
    h2: "제목 2",
    h3: "제목 3",
    h4: "제목 4",
    h5: "제목 5",
    h6: "제목 6",
  },
  imgTitleItem: {
    link: "이미지 링크 추가",
    upload: "이미지 업로드",
    clip2upload: "자르고 업로드",
  },
  linkModalTips: {
    linkTitle: "링크 추가",
    imageTitle: "이미지 추가",
    descLabel: "설명:",
    descLabelPlaceHolder: "설명을 입력하세요...",
    urlLabel: "링크:",
    urlLabelPlaceHolder: "주소를 입력하세요...",
    buttonOK: "확인",
  },
  clipModalTips: {
    title: "이미지 자르기",
    buttonUpload: "업로드",
  },
  copyCode: {
    text: "복사",
    successTips: "복사 완료!",
    failTips: "복사 실패!",
  },
  mermaid: {
    flow: "순서도",
    sequence: "시퀀스",
    gantt: "간트 차트",
    class: "클래스 다이어그램",
    state: "상태도",
    pie: "원형 차트",
    relationship: "관계도",
    journey: "여정",
  },
  katex: {
    inline: "인라인",
    block: "블록",
  },
  footer: {
    markdownTotal: "글자 수",
    scrollAuto: "스크롤 동기화",
  },
}

let isMdEditorConfigured = false
if (!isMdEditorConfigured) {
  config({
    language: "ko-KR",
    languageUserDefined: {
      "ko-KR": KO_KR_LOCALE,
    },
  })
  isMdEditorConfigured = true
}

const toDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === "number") return new Date(value)
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        return value.toDate()
      } catch {
        // ignore fallthrough
      }
    }
    if ("seconds" in value && "nanoseconds" in value) {
      const seconds = typeof value.seconds === "number" ? value.seconds : 0
      const nanos = typeof value.nanoseconds === "number" ? value.nanoseconds : 0
      return new Date(seconds * 1000 + nanos / 1e6)
    }
  }
  return null
}

const formatTimestamp = (value) => {
  const date = toDate(value)
  if (!date) return ""
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Seoul",
  })
  return `${formatter.format(date)} UTC+9`
}

const ensureTimestampString = (value) => {
  if (!value) return ""
  if (typeof value === "string") return value
  return formatTimestamp(value)
}

const normalizeAnswerList = (answer) => {
  if (!answer) return []
  if (Array.isArray(answer)) {
    return answer.filter((entry) => entry && typeof entry === "object")
  }
  if (typeof answer === "object") {
    return [answer]
  }
  return []
}

const ChatPage = () => {
  const [searchParams] = useSearchParams()
  const questionId = searchParams.get("id")
  const me = useAppStore((state) => state.user)
  const [question, setQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    setError("")
  }, [questionId])

  useEffect(() => {
    if (!questionId) {
      setIsLoading(false)
      setQuestion(null)
      setError("질문 ID를 찾을 수 없습니다.")
      return () => {}
    }

    const unsubscribe = subscribeToQuestion(
      questionId,
      (data) => {
        if (!data) {
          setQuestion(null)
          setError("해당 질문을 찾을 수 없습니다.")
        } else {
          setQuestion(data)
        }
        setIsLoading(false)
      },
      (subscribeError) => {
        console.error("채팅을 불러오는 중 오류가 발생했습니다.", subscribeError)
        setError("채팅을 불러오는 중 오류가 발생했습니다.")
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe?.()
    }
  }, [questionId])

  const role = useMemo(() => {
    if (!question || !me?.uid) return "viewer"
    if (question.questioner === me.uid) return "questioner"
    if (question.assignee === me.uid) return "answerer"
    return "viewer"
  }, [question, me])

  const canSend = role === "questioner" || role === "answerer"

  const conversation = useMemo(() => {
    if (!question) return []

    const introTimestamp = ensureTimestampString(
      question.createdAt || question.created_at || question.timestamp || question.updatedAt
    )

    const introMessage = question.content
      ? [
          {
            id: "question",
            content: question.content,
            sender: "questioner",
            timestamp: introTimestamp,
          },
        ]
      : []

    const answers = normalizeAnswerList(question.answers).map((entry, index) => ({
      id: entry.id ?? `answer-${index}`,
      content: entry.content ?? "",
      sender: entry.sender === "answerer" ? "answerer" : "questioner",
      timestamp: ensureTimestampString(entry.timestamp),
    }))

    return [...introMessage, ...answers]
  }, [question])

  useEffect(() => {
    const element = listRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" })
  }, [conversation.length])

  const sendMessage = useCallback(
    async (valueOverride) => {
      const text = (valueOverride ?? draft).trim()
      if (!text || sending) return
      if (!questionId) {
        setError("질문 ID를 찾을 수 없습니다.")
        return
      }
      if (!canSend) {
        setError("메시지를 전송할 권한이 없습니다.")
        return
      }

      setSending(true)
      setError("")
      try {
        await appendChatMessage(questionId, {
          content: text,
          sender: role,
          timestamp: formatTimestamp(new Date()),
        })
        setDraft("")
      } catch (sendError) {
        console.error("메시지 전송 실패", sendError)
        setError("메시지를 전송하지 못했습니다.")
      } finally {
        setSending(false)
      }
    },
    [draft, sending, questionId, canSend, role]
  )

  const handleSave = useCallback(
    (value) => {
      setDraft(value)
      sendMessage(value)
    },
    [sendMessage]
  )

  const avatarText = useMemo(() => {
    const source = question?.title || question?.subject || question?.content || ""
    return source ? source.trim().charAt(0).toUpperCase() : "Q"
  }, [question])

  const roleDescription = useMemo(() => {
    if (role === "answerer") return "질문자와 대화를 나눠보세요."
    if (role === "questioner") return "담당 답변자와 대화 중입니다."
    return "대화를 읽기 전용으로 확인할 수 있습니다."
  }, [role])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Topbar />
        <Loading />
      </div>
    )
  }

  if (!questionId || !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Topbar />
        <main className="cp cp--empty">
          <div className="cp__emptyBox">
            <h2>채팅을 불러올 수 없습니다.</h2>
            <p>{error || "유효한 질문 정보를 찾을 수 없습니다."}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <main className="cp">
        <div className="cp__inner">
          <header className="cp__header">
            <div className="cp__peer">
              <div className="cp__avatar" aria-hidden>
                {avatarText}
              </div>
              <div className="cp__meta">
                <div className="cp__name">{question.title || "1:1 채팅"}</div>
                <div className="cp__sub">{roleDescription}</div>
              </div>
            </div>
            <div className="cp__metaRight">
              {question.updatedAt ? ensureTimestampString(question.updatedAt) : null}
            </div>
          </header>

          <section className="cp__list" ref={listRef}>
            {conversation.length === 0 ? (
              <div className="cp__emptyBox">
                <h2>아직 메시지가 없습니다.</h2>
                <p>첫 메시지를 보내 대화를 시작해보세요.</p>
              </div>
            ) : (
              conversation.map((message, index) => {
                const isMine = canSend && message.sender === role
                const senderLabel = message.sender === "answerer" ? "답변자" : "질문자"
                return (
                  <article
                    key={message.id || `${message.sender}-${index}`}
                    className={`bubble ${isMine ? "bubble--me" : "bubble--peer"}`}
                  >
                    <div className="bubble__card">
                      <div className="bubble__sender">{senderLabel}</div>
                      <MdPreview
                        id={`chat-message-${index}`}
                        value={message.content}
                        language="ko-KR"
                        showCodeRowNumber
                      />
                      {message.timestamp ? (
                        <time className="bubble__time">{message.timestamp}</time>
                      ) : null}
                    </div>
                  </article>
                )
              })
            )}
          </section>

          <footer className="cp__composer">
            <div className="cp__editor">
              <MdEditor
                value={draft}
                onChange={setDraft}
                preview={false}
                noMermaid
                noKatex
                className="cp__editorBox"
                onSave={handleSave}
                placeholder="메시지를 마크다운으로 입력하세요... (Ctrl/Cmd+S 전송)"
                style={{ height: 160 }}
                language="ko-KR"
              />
            </div>
            <button
              className="cp__send"
              onClick={() => {
                void sendMessage()
              }}
              aria-label="전송"
              disabled={!canSend || sending || !draft.trim()}
            >
              {sending ? "전송 중..." : "전송"}
            </button>
          </footer>

          {error ? <div className="cp__error" role="status">{error}</div> : null}
        </div>
      </main>

      <style>{`
        .cp { display: flex; justify-content: center; padding: 16px 0 24px; }
        .cp--empty { align-items: center; }
        .cp__inner { width: min(1100px, 84vw); display: grid; grid-template-rows: auto 1fr auto auto; gap: 12px; min-height: calc(100vh - 120px); }

        .cp__header { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .cp__peer { display: flex; align-items: center; gap: 10px; }
        .cp__avatar { width: 40px; height: 40px; border-radius: 50%; background:#e5e7eb; display:grid; place-items:center; font-weight:700; color:#111; }
        .cp__meta { line-height: 1.1; }
        .cp__name { font-weight: 700; color:#111; }
        .cp__sub { font-size:.8rem; color:#6b7280; }
        .cp__metaRight { font-size:.75rem; color:#9ca3af; }

        .cp__list { display: flex; flex-direction: column; gap: 10px; padding: 16px; overflow-y: auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(15,23,42,.08); box-shadow: 0 12px 24px rgba(15,23,42,.04); }

        .bubble { display:flex; }
        .bubble--me { justify-content: flex-end; }
        .bubble--peer { justify-content: flex-start; }
        .bubble__card { max-width: min(760px, 80%); border: 1px solid rgba(0,0,0,.08); background: #fff; border-radius: 14px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .bubble--me .bubble__card { background: #f1f5f9; border-color: rgba(15,23,42,.12); }
        .bubble__sender { font-size: .75rem; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
        .bubble__time { display:block; margin-top:8px; font-size:.72rem; color:#9ca3af; text-align:right; }

        .cp__composer { display:flex; align-items: flex-end; gap: 12px; padding: 16px; border-radius: 16px; border: 1px solid rgba(15,23,42,.08); background: #ffffff; box-shadow: 0 12px 24px rgba(15,23,42,.04); }
        .cp__editor { flex:1; }
        .cp__editorBox { border-radius: 12px; overflow: hidden; }
        .cp__editorBox .md-editor-rt { background: transparent; box-shadow: none; border: none; }
        .cp__editorBox .md-editor-rt .md-editor-rt__main { background: transparent; }
        .cp__editorBox .md-editor-rt .md-editor-rt__input, .cp__editorBox .md-editor-rt textarea { background: transparent; }
        .cp__send { align-self: stretch; min-width: 96px; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,.1); background:#111; color:#fff; font-weight:600; cursor:pointer; transition: background .2s ease, transform .2s ease; }
        .cp__send:disabled { cursor: not-allowed; opacity: .6; transform: none; background: #9ca3af; border-color: transparent; }
        .cp__send:not(:disabled):active { transform: translateY(1px); }

        .cp__emptyBox { width: 100%; min-height: 260px; border: 1px dashed rgba(148,163,184,.6); border-radius: 16px; display: grid; place-items: center; gap: 8px; text-align: center; padding: 24px; background: rgba(255,255,255,.8); }
        .cp__emptyBox h2 { font-size: 1.1rem; font-weight: 700; color: #111827; }
        .cp__emptyBox p { font-size: .9rem; color: #6b7280; }

        .cp__error { padding: 10px 14px; border-radius: 10px; background: rgba(248, 113, 113, 0.1); color: #b91c1c; font-size: .85rem; border: 1px solid rgba(248, 113, 113, 0.4); }

        @media (max-width: 860px) {
          .cp__inner { width: 92vw; }
          .bubble__card { max-width: 92%; }
          .cp__composer { flex-direction: column; }
          .cp__send { width: 100%; min-height: 44px; }
        }
      `}</style>
    </div>
  )
}

export default ChatPage
