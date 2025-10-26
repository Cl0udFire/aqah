import Topbar from "../components/Topbar";
import SortingPlayground from "../components/playground/SortingPlayground";
import DiskSchedulingPlayground from "../components/playground/DiskSchedulingPlayground";
import PointerPlayground from "../components/playground/PointerPlayground";
import RecursionPlayground from "../components/playground/RecursionPlayground";
import OSIPlayground from "../components/playground/OSIPlayground";
import GraphPlayground from "../components/playground/GraphPlayground";
import DataStructuresPlayground from "../components/playground/DataStructuresPlayground";
import CryptoPlayground from "../components/playground/CryptoPlayground";
import { useState } from "react";

const sections = [
  {
    id: "sorting",
    label: "정렬",
    description: "배열이 정렬되는 과정을 한 단계씩 시각화합니다.",
  },
  {
    id: "pointer",
    label: "포인터",
    description: "C 포인터의 주소와 역참조, 배열 포인터 산술을 눈으로 확인합니다.",
  },
  {
    id: "graph",
    label: "그래프",
    description: "그래프 탐색과 최소 신장 트리 알고리즘이 어떻게 진행되는지 비교합니다.",
  },
  {
    id: "data-structures",
    label: "자료구조",
    description: "큐, 스택, 트리, 세그먼트 트리를 단계별로 이해합니다.",
  },
  {
    id: "osi",
    label: "네트워크",
    description: "OSI 7계층을 따라 요청이 캡슐화되는 과정을 단계별로 따라가요.",
  },
  {
    id: "disk",
    label: "디스크",
    description: "디스크 헤드가 요청을 따라 이동하는 과정을 확인하세요.",
  },
  {
    id: "recursion",
    label: "재귀",
    description: "호출 스택과 반환 흐름을 추적하며 재귀 함수를 학습해요.",
  },
  {
    id: "crypto",
    label: "해시 & 암호화",
    description: "문자열이 해시 함수와 암호화 알고리즘을 거치며 변형되는 과정을 살펴봐요.",
  },
];

const PlaygroundPage = () => {
  const [activeSection, setActiveSection] = useState("sorting");

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Topbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-12 pt-10">
        <header className="pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
            Playground
          </span>
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">알고리즘 실험실</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                주요 시각화 도구를 한 화면에서 빠르게 비교하며 실험해보세요.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              정렬 · 포인터 · 그래프 · 자료구조 · 네트워크 · 디스크 · 재귀 · 암호화
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur lg:w-64">
            <nav className="flex flex-col gap-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-blue-500 text-white shadow"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="block text-base">{section.label}</span>
                    {isActive && (
                      <span className="mt-1 block text-xs font-normal text-blue-50">
                        {section.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="flex-1 space-y-6">
            {activeSection === "sorting" && <SortingPlayground />}
            {activeSection === "pointer" && <PointerPlayground />}
            {activeSection === "graph" && <GraphPlayground />}
            {activeSection === "data-structures" && <DataStructuresPlayground />}
            {activeSection === "osi" && <OSIPlayground />}
            {activeSection === "disk" && <DiskSchedulingPlayground />}
            {activeSection === "recursion" && <RecursionPlayground />}
            {activeSection === "crypto" && <CryptoPlayground />}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PlaygroundPage;
