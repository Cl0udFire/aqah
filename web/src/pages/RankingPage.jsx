import Topbar from "../components/Topbar";
import styled from "styled-components";

const TR = styled.tr`
  display: grid;
  grid-template-columns: 75px 1fr 100px;
  width: 100%;
  border-bottom: 2px solid #e5e5e5;
  padding: 8px;
  gap: 50px;

  &:last-child {
    border-bottom: none;
  }

  > td:first-child {
    width: auto;
    height: 26px;
    text-align: center;
    justify-self: right;
    aspect-ratio: 1 / 1;
  }

  &:nth-child(2) > td:first-child,
  &:nth-child(3) > td:first-child,
  &:nth-child(4) > td:first-child {
    font-weight: bolder;
    /* border-radius: 999px;
    color: #ffffff; */
  }
  &:nth-child(2) > td:first-child {
    color: #ec9a00;
    zoom: 1.15;
  }
  &:nth-child(3) > td:first-child {
    color: #c0c0c0;
    zoom: 1.1;
  }
  &:nth-child(4) > td:first-child {
    color: #c49748;
    zoom: 1.05;
  }
  img {
    width: 22px;
    height: 22px;
    display: inline-block;
    margin-right: 8px;
  }
`;

const RankingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-[2rem] font-bold text-gray-900">랭킹</h1>
            <p className="text-sm text-gray-500">
              사용자들의 기여도에 따른 랭킹을 확인해보세요!
            </p>
          </header>
        </div>

        <table className="block min-h-[280px] mt-[32px] max-w-4xl  mx-auto items-start  justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-700 text-sms">
          <TR>
            <th className="text-right">#</th>
            <th>닉네임</th>
            <th>EXP</th>
          </TR>
          {[
            {
              rank: 1,
              name: "UserA",
              exp: 1500,
            },
            {
              rank: 2,
              name: "UserB",
              exp: 1200,
            },
            {
              rank: 3,
              name: "UserC",
              exp: 900,
            },
            {
              rank: 4,
              name: "UserD",
              exp: 850,
            },
            {
              rank: 5,
              name: "UserE",
              exp: 800,
            },
            {
              rank: 6,
              name: "UserF",
              exp: 750,
            },
          ]
            .sort((a, b) => b.exp - a.exp)
            .map((user) => (
              <TR key={user.rank}>
                <td className="text-right">{user.rank}</td>
                <td className="flex items-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/1200px-Anonymous_emblem.svg.png"
                    alt={`${user.name}'s avatar`}
                  />
                  {user.name}
                </td>
                <td>{user.exp}</td>
              </TR>
            ))}
        </table>
      </main>
    </div>
  );
};

export default RankingPage;
