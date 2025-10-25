import React, { useEffect, useMemo, useRef, useState } from 'react';
import Topbar from "../components/Topbar";
import { MdEditor, MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import 'md-editor-rt/lib/preview.css';
import { useAppStore } from '../context/store';

// 간단한 1:1 채팅 UI (Firebase 연동 전 UI 레벨)
// - 상단 Topbar
// - 중앙 메시지 리스트(스크롤)
// - 하단 md-editor-rt 입력창 + 전송 버튼
// 참고: md-editor-rt는 React용 마크다운 에디터/프리뷰 컴포넌트입니다.
//      value/onChange, onSave, previewTheme 등 속성은 공식 문서 기준입니다.
//      (docs: https://imzbf.github.io/md-editor-rt/ , README의 Preview Only 예시)

export type ChatMessage = {
  id: string;
  from: 'me' | 'peer';
  markdown: string;
  createdAt: number; // epoch ms
};

const ChatPage: React.FC = () => {
  const me = useAppStore((s) => s.user);

  // 데모용 초기 메시지
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      from: 'peer',
      markdown: '안녕하세요! **마크다운**으로 메시지를 보낼 수 있어요.\n\n- 코드 블록\n```ts\nconsole.log("hello")\n```',
      createdAt: Date.now() - 60_000,
    },
  ]);

  const [draft, setDraft] = useState<string>('');
  const listRef = useRef<HTMLDivElement>(null);

  // 스크롤 맨 아래 고정
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    const v = draft.trim();
    if (!v) return;

    const msg: ChatMessage = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      from: 'me',
      markdown: v,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
  };

  // Ctrl/Cmd+S 저장 액션을 전송으로 활용
  const onSave = (value: string) => {
    setDraft(value);
    setTimeout(send, 0);
  };

  return (
    <>
      <Topbar />
      <main className="cp">
        <div className="cp__inner">
          {/* 좌측: 대화 상대 정보(간단) */}
          <header className="cp__header">
            <div className="cp__peer">
              <div className="cp__avatar" aria-hidden>
                {(me?.displayName || me?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="cp__meta">
                <div className="cp__name">1:1 Chat</div>
                <div className="cp__sub">마크다운 지원 채팅</div>
              </div>
            </div>
          </header>

          {/* 중앙: 메시지 리스트 */}
          <section className="cp__list" ref={listRef}>
            {messages.map((m) => (
              <article key={m.id} className={`bubble ${m.from === 'me' ? 'bubble--me' : 'bubble--peer'}`}>
                <div className="bubble__card">
                  {/* 미리보기 전용: MdPreview value 사용 */}
                  <MdPreview id={`m-${m.id}`} value={m.markdown} />
                  <time className="bubble__time">{new Date(m.createdAt).toLocaleTimeString()}</time>
                </div>
              </article>
            ))}
          </section>

          {/* 하단: composer */}
          <footer className="cp__composer">
            <div className="cp__editor">
              {/* 편집기 전용: MdEditor value/onChange 사용, preview는 끄고 심플 모드 */}
              <MdEditor
                value={draft}
                onChange={setDraft}
                preview={false}
                noMermaid
                noKatex
                className="cp__editorBox"
                onSave={onSave}
                placeholder="메시지를 마크다운으로 입력하세요... (Ctrl/Cmd+S 전송)"
                style={{ height: 160 }}
              />
            </div>
            <button className="cp__send" onClick={send} aria-label="전송">전송</button>
          </footer>
        </div>
      </main>

      {/* 간단 스타일: 페이지와 자연스럽게 이어지는 흰 배경 */}
      <style>{`
        .cp { display: flex; justify-content: center; padding: 16px 0 24px; background: #fff; }
        .cp__inner { width: min(1100px, 84vw); display: grid; grid-template-rows: auto 1fr auto; gap: 12px; min-height: calc(100vh - 96px); }

        .cp__header { display: flex; align-items: center; padding: 8px 4px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .cp__peer { display: flex; align-items: center; gap: 10px; }
        .cp__avatar { width: 36px; height: 36px; border-radius: 50%; background:#e5e7eb; display:grid; place-items:center; font-weight:700; color:#111; }
        .cp__meta { line-height: 1.1; }
        .cp__name { font-weight: 700; color:#111; }
        .cp__sub { font-size:.8rem; color:#6b7280; }

        .cp__list { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; overflow-y: auto; }

        .bubble { display:flex; }
        .bubble--me { justify-content: flex-end; }
        .bubble--peer { justify-content: flex-start; }
        .bubble__card { max-width: min(760px, 80%); border: 1px solid rgba(0,0,0,.08); background: #fff; border-radius: 14px; padding: 10px 12px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .bubble--me .bubble__card { background: #f1f5f9; }
        .bubble__time { display:block; margin-top:6px; font-size:.72rem; color:#9ca3af; text-align:right; }

        .cp__composer { display:flex; align-items: flex-end; gap: 10px; border-top: 1px solid rgba(0,0,0,.06); padding-top: 8px; }
        .cp__editor { flex:1; }
        .cp__editorBox { border-radius: 12px; overflow: hidden; }
        .cp__send { align-self: stretch; min-width: 84px; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,.1); background:#111; color:#fff; font-weight:600; cursor:pointer; }
        .cp__send:active { transform: translateY(1px); }

        @media (max-width: 860px) {
          .cp__inner { width: 92vw; }
          .bubble__card { max-width: 92%; }
        }
      `}</style>
    </>
  );
};

export default ChatPage;
