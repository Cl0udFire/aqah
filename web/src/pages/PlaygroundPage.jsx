import Topbar from "../components/Topbar";
import SortingPlayground from "../components/playground/SortingPlayground";
import DiskSchedulingPlayground from "../components/playground/DiskSchedulingPlayground";
import PointerPlayground from "../components/playground/PointerPlayground";
import RecursionPlayground from "../components/playground/RecursionPlayground";
import OSIPlayground from "../components/playground/OSIPlayground";
import GraphPlayground from "../components/playground/GraphPlayground";
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
    description: "그래프 탐색과 최단 경로 알고리즘이 어떻게 진행되는지 비교합니다.",
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
];

const PlaygroundPage = () => {
  const [activeSection, setActiveSection] = useState("sorting");

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Topbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-12">
        <header className="flex flex-col gap-4 pb-8">
          <span className="text-sm font-semibold uppercase tracking-wide text-sky-600">
            Playground
          </span>
          <h1 className="text-4xl font-bold text-slate-900">
            어려운 알고리즘을 더 쉽게 실험해보세요
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600">
            실제 코드를 작성하지 않고도 알고리즘과 시스템 동작 원리를
            직관적으로 이해할 수 있도록 인터랙티브한 실험 환경을 제공해요.
            정렬, 포인터, 그래프, 네트워크, 디스크, 재귀 학습 도구를 살펴보며 입력을
            자유롭게 바꿔보세요.
          </p>
          <nav className="mt-2 flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                  activeSection === section.id
                    ? "bg-sky-500 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <p className="text-sm text-slate-500">
            {sections.find((section) => section.id === activeSection)?.description}
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {activeSection === "sorting" && <SortingPlayground />}
          {activeSection === "pointer" && <PointerPlayground />}
          {activeSection === "graph" && <GraphPlayground />}
          {activeSection === "osi" && <OSIPlayground />}
          {activeSection === "disk" && <DiskSchedulingPlayground />}
          {activeSection === "recursion" && <RecursionPlayground />}
        </div>
      </main>
    </div>
  );
};

export default PlaygroundPage;
