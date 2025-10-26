import Topbar from "../components/Topbar";

const RankingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="ml-[100px] flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-[2rem] font-bold text-gray-900">랭킹</h1>
            <p className="text-sm text-gray-500">
              사용자들의 기여도에 따른 랭킹을 확인해보세요!
            </p>
          </header>
        </div>
      </main>
    </div>
  );
};

export default RankingPage;
