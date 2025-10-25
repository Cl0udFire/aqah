import { useAppStore } from "../context/store";
import SideLink from "./SideLink";
import { faComments, faHome } from "@fortawesome/free-regular-svg-icons";
import { faWaveSquare } from "@fortawesome/free-solid-svg-icons";

const Topbar = () => {
  const user = useAppStore((s) => s.user);

  const initials = (user?.displayName || user?.email || "U")
    ?.trim()
    ?.charAt(0)
    ?.toUpperCase();

  return (
    <header className="tb" aria-label="Top Navigation">
      <div className="tb__inner">
        <div className="tb__left">
          <span className="tb__brand">AQAH</span>
          <nav className="tb__nav">
            <SideLink to="/" icon={faHome} label="Home" />
            <SideLink to="/questions" icon={faComments} label="Question" />
            <SideLink to="/playground" icon={faWaveSquare} label="Playground" />
          </nav>
        </div>

        <div className="tb__right">
          {user?.photoURL ? (
            <img className="tb__avatar" src={user.photoURL} alt="avatar" />
          ) : (
            <div className="tb__avatar tb__avatar--fallback" aria-hidden>
              {initials}
            </div>
          )}
          <div className="tb__meta">
            <div className="tb__name">
              {user?.displayName || user?.email?.split("@")[0] || "Guest"}
            </div>
            <div className="tb__email">{user?.email || "로그인이 필요합니다"}</div>
          </div>
        </div>
      </div>

      <style>{`
        /* Topbar wrapper: 페이지와 자연스럽게 이어지도록 배경을 흰색으로 */
        .tb {
          position: sticky; /* 상단 고정 느낌 */
          top: 0;
          width: 100%;
          background: #fff; /* 요구사항: 배경 흰색 */
          z-index: 50;
          border-bottom: 1px solid rgba(0,0,0,0.06); /* 페이지와 이음새를 자연스럽게 */
        }

        /* 내부 컨테이너: 70~80% 정도의 폭을 유지 */
        .tb__inner {
          margin: 0 auto;
          width: 80%;           /* 선호 폭 */
          min-width: 70%;       /* 하한 */
          max-width: 1200px;    /* 상한 (선택) */

          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .tb__left { display: flex; align-items: center; gap: 16px; }
        .tb__brand { font-weight: 700; letter-spacing: .02em; color: #111; }

        .tb__nav { display: flex; align-items: center; gap: 8px; }
        /* SideLink 내부에서 .sb__link 클래스를 사용한다면 아래 스타일이 적용됩니다. */
        .sb__link {
          display: inline-block;
          padding: 8px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: #111;
          transition: background 160ms ease, color 160ms ease, transform 120ms ease;
        }
        .sb__link:hover { background: rgba(0,0,0,.06); }
        .sb__link.is-active { background: rgba(0,0,0,.08); }

        .tb__right { display: flex; align-items: center; gap: 10px; }
        .tb__avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .tb__avatar--fallback { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; font-weight: 700; color: #111; background: #e5e7eb; }
        .tb__meta { min-width: 0; }
        .tb__name { color: #111; font-size: .95rem; line-height: 1.1; }
        .tb__email { color: #555; font-size: .8rem; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 18rem; }

        @media (max-width: 860px) {
          .tb__inner { width: 92%; min-width: 92%; height: 56px; }
          .tb__email { max-width: 10rem; }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
