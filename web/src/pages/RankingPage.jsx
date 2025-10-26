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
              name: "1428 주승민",
              exp: 22397,
              pfp: "https://images-ext-1.discordapp.net/external/0M8Y_wF_SNzIChYL8BW1Y1RvOOzFJwviV6VT8CvhZxY/%3Fsz%3D46/https/lh3.googleusercontent.com/-JxyS--23TxQ/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkmaXzlGED5P26sP9uNciFwKJ57Pqw/photo.jpg?format=webp&width=69&height=69",
            },
            {
              rank: 2,
              name: "1402 김강민",
              exp: 17618,
              pfp: "https://images-ext-1.discordapp.net/external/o6gb9GubgAS391_BnRX75EjYwN0vjP8hH7nHAnoowug/https/lh3.googleusercontent.com/a/ACg8ocKR2FjGHISkJdc7qu5Cm3IzUhBFhC2RzuMi-PYeLAm2Fshu1enFGw%3Ds192-c?format=webp&width=288&height=288",
            },
            {
              rank: 3,
              name: "1401 권유호",
              exp: 3264,
              pfp: "https://lh3.googleusercontent.com/a/ACg8ocIHJi3xVpc7S49xJb_gu9QwaCT_v3UQBAS8jrSZOFxgQ313uR0=s96-c",
            },
            {
              rank: 4,
              name: "1418 이재현",
              exp: 850,
              pfp: "https://media.discordapp.net/attachments/1410402754186444810/1431863002537136189/ACg8ocIOVgPPiXIlSSkpFzXBNz4PcAcy9XP0YzQepbOEe9BhT6a7UQs504-c-mo-no.png?ex=68fef5d6&is=68fda456&hm=91cf5b366b1ff8534eefc5730e6e598019c221f517e00f5bf61f06ab09d343c3&=&format=webp&quality=lossless&width=756&height=756",
            },
          ]
            .sort((a, b) => b.exp - a.exp)
            .map((user) => (
              <TR key={user.rank}>
                <td className="text-right">{user.rank}</td>
                <td className="flex items-center">
                  <img
                    className="rounded-4xl"
                    src={
                      user.pfp ??
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/1200px-Anonymous_emblem.svg.png"
                    }
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
