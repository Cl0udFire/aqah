const HomePage = ({ user, pending, errorMessage, onLogin, onLogout }) => {
  return (
    <main className="home">
      <section className="auth-card">
        <h1>Google 로그인 데모</h1>
        <p className="description">
          Firebase Authentication과 Google 로그인을 사용하여 인증 흐름을 구현한
          예제입니다.
        </p>

        {errorMessage && <p className="error">{errorMessage}</p>}

        {pending ? (
          <p className="status">로그인 상태를 확인하는 중입니다…</p>
        ) : user ? (
          <div className="profile">
            {user.photoURL && (
              <img src={user.photoURL} alt={`${user.displayName ?? "사용자"} 프로필`} />
            )}
            <div className="profile__details">
              <p className="profile__name">{user.displayName ?? "이름 미확인"}</p>
              <p className="profile__email">{user.email ?? "이메일 정보 없음"}</p>
            </div>
            <button
              type="button"
              onClick={() => onLogout?.()}
              className="button button--secondary"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="actions">
            <button
              type="button"
              onClick={() => onLogin?.()}
              className="button button--primary"
            >
              Google 계정으로 로그인
            </button>
            <p className="hint">
              기본적으로 리디렉션 방식을 사용하며, 브라우저에서 지원하지 않는
              경우 팝업 방식으로 자동 전환됩니다.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
