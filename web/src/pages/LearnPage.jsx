import { useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Graph } from "react-d3-graph";
import Topbar from "../components/Topbar";

const mockMindMaps = {
  "인공지능 개론": {
    overview:
      "인공지능(AI)은 인간의 학습·추론 능력을 컴퓨터 시스템으로 구현하려는 연구 분야로, 문제 정의와 데이터 수집, 모델링, 검증에 대한 체계적인 이해가 필요합니다.",
    branches: [
      {
        title: "핵심 개념",
        color: "#2563eb",
        subtopics: [
          "튜링 테스트와 지능적 행위 정의",
          "약한 AI와 강한 AI의 목표 차이",
          "데이터·알고리즘·컴퓨팅 파워의 3요소"
        ]
      },
      {
        title: "주요 기법",
        color: "#4338ca",
        subtopics: [
          "지도/비지도/강화 학습 프레임워크",
          "딥러닝: CNN, RNN, Transformer",
          "지식 기반 추론과 탐색 알고리즘"
        ]
      },
      {
        title: "응용 분야",
        color: "#0ea5e9",
        subtopics: [
          "컴퓨터 비전, 자연어 처리, 음성 인식",
          "추천 시스템과 개인화 서비스",
          "자율주행, 로보틱스, 스마트 팩토리"
        ]
      },
      {
        title: "학습 전략",
        color: "#14b8a6",
        subtopics: [
          "수학 기초: 선형대수, 확률, 최적화",
          "데이터 전처리와 모델 실험 반복",
          "클라우드/오픈소스 도구 활용"
        ]
      },
      {
        title: "윤리와 거버넌스",
        color: "#f97316",
        subtopics: [
          "편향, 공정성, 설명 가능성",
          "프라이버시 보장과 책임 있는 AI",
          "국제적 규제 및 표준 동향"
        ]
      }
    ]
  },
  "양자 컴퓨팅": {
    overview:
      "양자 컴퓨팅은 큐비트와 중첩·얽힘 같은 양자 현상을 계산 자원으로 사용합니다. 알고리즘 복잡도, 오류 정정, 하드웨어 기술을 아우르는 다학제적 접근이 필요합니다.",
    branches: [
      {
        title: "기초 물리",
        color: "#8b5cf6",
        subtopics: [
          "큐비트와 블로흐 구면",
          "중첩(superposition)과 간섭",
          "얽힘(entanglement)의 계산적 의미"
        ]
      },
      {
        title: "대표 알고리즘",
        color: "#22d3ee",
        subtopics: [
          "쇼어 알고리즘: 소인수분해",
          "그로버 탐색 알고리즘",
          "변분 양자 알고리즘(VQA)"
        ]
      },
      {
        title: "하드웨어",
        color: "#34d399",
        subtopics: [
          "초전도, 이온트랩, 광자 기반 접근",
          "큐비트 수와 게이트 충실도",
          "NISQ 시대의 제약과 로드맵"
        ]
      },
      {
        title: "오류 정정",
        color: "#facc15",
        subtopics: [
          "표면 코드와 토폴로지 코드",
          "피델리티 향상 기법",
          "에러 억제를 위한 하드웨어-소프트웨어 협력"
        ]
      },
      {
        title: "응용 가능성",
        color: "#fb7185",
        subtopics: [
          "암호 해독과 보안",
          "신소재 탐색, 화학 시뮬레이션",
          "금융 최적화와 머신러닝"
        ]
      }
    ]
  },
  "지속가능한 에너지 전환": {
    overview:
      "지속가능한 에너지 전환은 재생에너지 확대, 효율 향상, 제도·시장 설계가 결합된 복합 과제입니다. 기술 발전과 정책, 시민 참여가 맞물려야 실질적 효과를 낼 수 있습니다.",
    branches: [
      {
        title: "재생에너지",
        color: "#22c55e",
        subtopics: [
          "태양광·풍력의 발전 특성",
          "수소, 해양, 지열 등 대체 자원",
          "분산형 발전과 마이크로그리드"
        ]
      },
      {
        title: "저장 기술",
        color: "#0ea5e9",
        subtopics: [
          "배터리 효율과 수명 관리",
          "수소 저장 및 전환",
          "전력망 안정화를 위한 ESS"
        ]
      },
      {
        title: "정책과 시장",
        color: "#f97316",
        subtopics: [
          "탄소 가격제와 인센티브",
          "전력 시장 구조 혁신",
          "국제 협력과 표준화"
        ]
      },
      {
        title: "도시와 시민",
        color: "#a855f7",
        subtopics: [
          "스마트 그리드와 수요 관리",
          "커뮤니티 에너지 프로젝트",
          "에너지 복지와 교육"
        ]
      }
    ]
  }
};

const Page = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2ff 0%, #ffffff 32%);
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 32px 56px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
  color: #0f172a;
`;

const Description = styled.p`
  font-size: 16px;
  color: #475569;
  line-height: 1.6;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const Select = styled.select`
  min-width: 220px;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid #cbd5f5;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
`;

const SummaryCard = styled.section`
  padding: 24px;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 12px 36px rgba(15, 23, 42, 0.08);
`;

const SummaryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1e293b;
`;

const SummaryText = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
`;

const GraphShell = styled.section`
  position: relative;
  flex: 1;
  min-height: 520px;
  border-radius: 24px;
  background-color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  padding: 16px;
  overflow: hidden;
`;

const GraphViewport = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 65%);
`;

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 15px;
`;

function useContainerSize() {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      setDimensions({
        width: element.clientWidth,
        height: element.clientHeight
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, dimensions];
}

function LearnPage() {
  const topics = Object.keys(mockMindMaps);
  const [selectedTopic, setSelectedTopic] = useState(topics[0] ?? "");
  const selectedMindMap = mockMindMaps[selectedTopic];
  const [graphRef, graphSize] = useContainerSize();

  const graphData = useMemo(() => {
    if (!selectedMindMap) {
      return { nodes: [], links: [] };
    }

    const nodes = [
      {
        id: "root",
        label: selectedTopic,
        color: "#1d4ed8",
        size: 900,
        fontColor: "#0f172a"
      }
    ];
    const links = [];

    selectedMindMap.branches.forEach((branch, branchIndex) => {
      const branchId = `branch-${branchIndex}`;
      nodes.push({
        id: branchId,
        label: branch.title,
        color: branch.color,
        size: 650,
        fontColor: "#0f172a"
      });
      links.push({ source: "root", target: branchId });

      branch.subtopics.forEach((subtopic, subIndex) => {
        const subtopicId = `sub-${branchIndex}-${subIndex}`;
        nodes.push({
          id: subtopicId,
          label: subtopic,
          color: branch.color,
          size: 400,
          fontColor: "#0f172a",
          opacity: 0.85
        });
        links.push({ source: branchId, target: subtopicId });
      });
    });

    return { nodes, links };
  }, [selectedMindMap, selectedTopic]);

  const graphConfig = useMemo(
    () => ({
      width: Math.max(480, graphSize.width || 0),
      height: Math.max(480, graphSize.height || 0),
      directed: false,
      focusAnimationDuration: 0.7,
      nodeHighlightBehavior: true,
      labelProperty: "label",
      panAndZoom: true,
      staticGraph: false,
      d3: {
        alphaTarget: 0.05,
        gravity: -120,
        linkLength: 200,
        linkStrength: 1
      },
      node: {
        color: "#2563eb",
        fontColor: "#0f172a",
        fontSize: 12,
        highlightStrokeColor: "#1d4ed8",
        highlightColor: "#1d4ed8",
        highlightFontSize: 14,
        size: 600,
        strokeColor: "#ffffff",
        strokeWidth: 2
      },
      link: {
        highlightColor: "#1d4ed8",
        color: "#cbd5f5",
        opacity: 0.75,
        strokeWidth: 2
      }
    }),
    [graphSize.height, graphSize.width]
  );

  return (
    <Page>
      <Topbar />
      <Content>
        <Header>
          <Title>Learn</Title>
          <Description>
            탐색하고 싶은 주제를 선택하면 중심 개념과 하위 아이디어를 한눈에 살펴볼 수 있는 마인드맵을 제공합니다.
          </Description>
          <Controls>
            <Label htmlFor="topic-select">학습할 주제</Label>
            <Select
              id="topic-select"
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </Select>
          </Controls>
        </Header>

        {selectedMindMap ? (
          <>
            <SummaryCard>
              <SummaryTitle>학습 개요</SummaryTitle>
              <SummaryText>{selectedMindMap.overview}</SummaryText>
            </SummaryCard>
            <GraphShell>
              <GraphViewport ref={graphRef}>
                {graphData.nodes.length ? (
                  <Graph id="learn-mindmap" data={graphData} config={graphConfig} />
                ) : (
                  <EmptyState>선택한 주제에 대한 마인드맵이 준비 중입니다.</EmptyState>
                )}
              </GraphViewport>
            </GraphShell>
          </>
        ) : (
          <GraphShell>
            <EmptyState>선택된 주제의 데이터를 불러올 수 없습니다.</EmptyState>
          </GraphShell>
        )}
      </Content>
    </Page>
  );
}

export default LearnPage;
