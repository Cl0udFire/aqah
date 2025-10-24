import { NavLink } from 'react-router-dom'
import { useAppStore } from '../context/store'

const Sidebar = () => {
  const user = useAppStore((s) => s.user)

  const initials = (user?.displayName || user?.email || 'U')
    ?.trim()?.charAt(0)?.toUpperCase()

  return (
    <aside className="sb" aria-label="Primary Navigation">
      <header className="sb__header">
        <span className="sb__brand">AQAH</span>
      </header>

      <nav className="sb__nav">
        <NavLink to="/" className={({ isActive }) => `sb__link${isActive ? ' is-active' : ''}`}>Home</NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sb__link${isActive ? ' is-active' : ''}`}>Profile</NavLink>
        <NavLink to="/questions" className={({ isActive }) => `sb__link${isActive ? ' is-active' : ''}`}>Question</NavLink>
        <NavLink to="/playground" className={({ isActive }) => `sb__link${isActive ? ' is-active' : ''}`}>Playground</NavLink>
      </nav>

      <footer className="sb__footer">
        <div className="sb__user">
          {user?.photoURL ? (
            <img className="sb__avatar" src={user.photoURL} alt="avatar" />
          ) : (
            <div className="sb__avatar sb__avatar--fallback" aria-hidden>
              {initials}
            </div>
          )}
          <div className="sb__meta">
            <div className="sb__name">{user?.displayName || user?.email?.split('@')[0] || 'Guest'}</div>
            <div className="sb__email">{user?.email || '로그인이 필요합니다'}</div>
          </div>
        </div>
      </footer>

      <style>{`
        .sb {
          position: fixed;
          top: 5vh;               /* 가운데 정렬 느낌을 위해 위/아래 여백 */
          left: 20px;
          height: 90vh;           /* 요구사항: 높이 90% */
          width: clamp(220px, 22vw, 300px); /* 적절한 너비 */
          padding: 14px 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 40;

          /* 글래스모피즘: 반투명 + 배경 블러 */
          background: rgba(20, 20, 24, 0.45);
          backdrop-filter: blur(14px) saturate(120%);
          -webkit-backdrop-filter: blur(14px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        @supports not ((backdrop-filter: blur(1px))) {
          .sb { background: rgba(20,20,24,0.88); }
        }
        .sb__header { padding: 6px 10px 10px; }
        .sb__brand { font-weight: 700; letter-spacing: .02em; color: rgba(255,255,255,.95); }

        .sb__nav { display: grid; gap: 6px; padding: 0 4px; }
        .sb__link {
          display: block;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,.86);
          transition: background 160ms ease, color 160ms ease, transform 120ms ease;
        }
        .sb__link:hover { background: rgba(255,255,255,.08); color: #fff; }
        .sb__link.is-active { background: rgba(255,255,255,.14); color: #fff; }

        .sb__footer { margin-top: auto; padding: 8px; }
        .sb__user { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 12px; background: rgba(255,255,255,.06); }
        .sb__avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
        .sb__avatar--fallback { display: grid; place-items: center; font-weight: 700; color: #111; background: linear-gradient(135deg, #e5e7eb, #cbd5e1); }
        .sb__meta { min-width: 0; }
        .sb__name { color: #fff; font-size: .95rem; line-height: 1.1; }
        .sb__email { color: rgba(255,255,255,.7); font-size: .8rem; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 16rem; }

        /* 모바일: 살짝 좁게 + 좌우 여백 조정 */
        @media (max-width: 860px) {
          .sb { left: 12px; right: 12px; width: auto; }
        }
      `}</style>
    </aside>
  )
}

export default Sidebar