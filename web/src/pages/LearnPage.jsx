import { useMemo, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/Topbar";

const mockMindMaps = {
  "인공지능 개론": {
    summary: "데이터와 알고리즘으로 지능형 행동을 모사하는 기술 전반.",
    overview:
      "인공지능(AI)은 인간의 학습·추론 능력을 컴퓨터 시스템으로 구현하려는 연구 분야로, 문제 정의와 데이터 수집, 모델링, 검증에 대한 체계적인 이해가 필요합니다.",
    branches: [
      {
        title: "핵심 개념",
        color: "#3b82f6",
        subtopics: [
          "튜링 테스트, 합리적 에이전트, 지능적 행위의 정의",
          "약한 AI와 강한 AI의 목표 차이",
          "데이터 · 알고리즘 · 컴퓨팅 파워의 3요소"
        ]
      },
      {
        title: "주요 기법",
        color: "#6366f1",
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
    ],
    background: {
      highlights: [
        "1950년 앨런 튜링이 제시한 '튜링 테스트'로 AI 연구의 철학적 기반 확립",
        "1956년 다트머스 회의에서 'Artificial Intelligence' 용어 공식화",
        "딥러닝과 GPU 발전으로 2010년대 이후 AI 성능이 비약적으로 향상",
        "AI 시스템 품질은 데이터 거버넌스와 도메인 전문성에 크게 의존"
      ],
      keyQuestions: [
        "어떤 문제 정의가 AI 적용 시 가장 높은 가치를 만들어낼까?",
        "데이터의 편향을 어떻게 탐지하고 완화할 수 있을까?",
        "모델 성능과 설명 가능성 사이의 균형을 어떻게 맞출까?"
      ],
      references: [
        "Stanford CS221: Artificial Intelligence Principles",
        "Ian Goodfellow 외, 『Deep Learning』 (2016)",
        "한국지능정보사회진흥원, 『신뢰할 수 있는 인공지능 구현 전략』"
      ]
    }
  },
  "양자 컴퓨팅": {
    summary: "양자역학을 이용해 고전 컴퓨터가 풀기 어려운 문제를 해결하려는 계산 패러다임.",
    overview:
      "양자 컴퓨팅은 큐비트와 중첩·얽힘 같은 양자 현상을 계산 자원으로 사용합니다. 알고리즘 복잡도, 오류 정정, 하드웨어 기술을 아우르는 다학제적 접근이 필요합니다.",
    branches: [
      {
        title: "기초 물리",
        color: "#8b5cf6",
        subtopics: [
          "큐비트와 블로흐 구면 표현",
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
    ],
    background: {
      highlights: [
        "1982년 파인먼이 양자 시스템 시뮬레이션 한계를 지적하며 개념 제안",
        "1994년 쇼어 알고리즘으로 양자 컴퓨팅 잠재력 입증",
        "현재는 수십 큐비트 규모 NISQ 디바이스가 연구·산업에서 실험적으로 사용",
        "양자 오류 정정이 실용화를 위한 핵심 과제"
      ],
      keyQuestions: [
        "어떤 문제들이 양자 우위(quantum advantage)를 실현할 수 있을까?",
        "오류 정정을 위한 자원 요구량은 어느 정도일까?",
        "양자 알고리즘과 고전 알고리즘을 어떻게 하이브리드로 결합할까?"
      ],
      references: [
        "Michael Nielsen & Isaac Chuang, 『Quantum Computation and Quantum Information』",
        "MIT xPRO, Quantum Computing Fundamentals",
        "IBM Quantum Roadmap (2023)"
      ]
    }
  },
  "지속가능한 에너지 전환": {
    summary: "탄소 배출을 줄이기 위한 에너지 생산·저장·소비 시스템의 전환 전략.",
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
        title: "저장/인프라",
        color: "#16a34a",
        subtopics: [
          "배터리, 양수발전, 수소 저장",
          "스마트 그리드와 수요관리",
          "전력망 안정화를 위한 디지털 트윈"
        ]
      },
      {
        title: "정책과 시장",
        color: "#0ea5e9",
        subtopics: [
          "탄소 가격제, 배출권 거래제",
          "재생에너지 인증과 REC 시장",
          "그린 택소노미와 투자 지침"
        ]
      },
      {
        title: "산업 전환",
        color: "#f59e0b",
        subtopics: [
          "철강·시멘트 등 중공업 탈탄소화",
          "수송 부문의 전동화와 수소화",
          "순환경제와 자원 효율"
        ]
      },
      {
        title: "사회적 수용성",
        color: "#ef4444",
        subtopics: [
          "정의로운 전환(Just Transition)",
          "지역 주민 참여와 갈등 조정",
          "에너지 복지와 접근성"
        ]
      }
    ],
    background: {
      highlights: [
        "IPCC 6차 보고서는 2030년까지 전 세계 배출량 43% 감축 필요성을 제시",
        "재생에너지 발전 단가(LCOE)가 화석연료보다 경쟁력 있는 수준으로 하락",
        "전력망 유연성과 대규모 저장 기술이 전환 속도의 병목으로 꼽힘",
        "정책·금융·기술이 맞물린 통합 전략이 필수"
      ],
      keyQuestions: [
        "지역 특성에 맞는 에너지 믹스는 어떻게 설계할까?",
        "재생에너지 변동성을 보완할 저장 기술의 경제성은?",
        "전환 과정에서 발생하는 사회·경제적 영향을 어떻게 완화할까?"
      ],
      references: [
        "IEA, World Energy Outlook (2023)",
        "BloombergNEF, Energy Transition Trends",
        "환경부, 2050 탄소중립 시나리오"
      ]
    }
  }
};

const boardSize = 600;

const LearnPage = () => {
  const topicNames = Object.keys(mockMindMaps);
  const [inputValue, setInputValue] = useState(topicNames[0]);
  const [activeTopic, setActiveTopic] = useState(topicNames[0]);
  const [isUnknownTopic, setIsUnknownTopic] = useState(false);

  const activeData = mockMindMaps[activeTopic];

  const nodes = useMemo(() => {
    if (!activeData) return [];
    const total = activeData.branches.length;
    const baseRadius = boardSize * 0.34;
    const radius = baseRadius + Math.max(0, (total - 5) * 14);

    return activeData.branches.map((branch, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      const x = boardSize / 2 + radius * Math.cos(angle);
      const y = boardSize / 2 + radius * Math.sin(angle);

      return {
        branch,
        angle,
        x,
        y,
        top: (y / boardSize) * 100,
        left: (x / boardSize) * 100
      };
    });
  }, [activeData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mockMindMaps[inputValue]) {
      setActiveTopic(inputValue);
      setIsUnknownTopic(false);
    } else {
      setIsUnknownTopic(true);
    }
  };

  const handleQuickSelect = (topic) => {
    setInputValue(topic);
    setActiveTopic(topic);
    setIsUnknownTopic(false);
  };

  return (
    <PageWrapper>
      <Topbar />
      <Content>
        <SidebarCard>
          <header>
            <Subtitle>마인드맵으로 학습 시작</Subtitle>
            <Title>어떤 주제를 탐구하고 싶나요?</Title>
            <Description>
              탐색하려는 주제를 입력하면 준비된 배경 지식을 마인드맵으로 정리해
              보여드려요. 아래 추천 주제로도 바로 살펴볼 수 있어요.
            </Description>
          </header>

          <TopicForm onSubmit={handleSubmit}>
            <HiddenLabel htmlFor="topic-input">학습 주제 입력</HiddenLabel>
            <TopicInput
              id="topic-input"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="예: 인공지능 개론"
              list="topic-suggestions"
            />
            <datalist id="topic-suggestions">
              {topicNames.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>
            <SubmitButton type="submit">마인드맵 보기</SubmitButton>
          </TopicForm>
          {isUnknownTopic && (
            <InlineAlert>
              아직 준비되지 않은 주제예요. 추천 주제를 선택해 살펴보거나 직접
              마인드맵 데이터를 추가해보세요.
            </InlineAlert>
          )}

          <QuickTopicList>
            {topicNames.map((topic) => (
              <TopicChip
                key={topic}
                type="button"
                onClick={() => handleQuickSelect(topic)}
                className={topic === activeTopic ? "is-active" : ""}
              >
                {topic}
              </TopicChip>
            ))}
          </QuickTopicList>

          {activeData && (
            <>
              <Section>
                <SectionTitle>주제 개요</SectionTitle>
                <Overview>{activeData.overview}</Overview>
              </Section>

              <Section>
                <SectionTitle>배경 지식 한눈에 보기</SectionTitle>
                <BulletList>
                  {activeData.background.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </BulletList>
              </Section>

              <Section>
                <SectionTitle>탐구 질문</SectionTitle>
                <BulletList>
                  {activeData.background.keyQuestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </BulletList>
              </Section>

              <Section>
                <SectionTitle>추천 자료</SectionTitle>
                <ReferenceList>
                  {activeData.background.references.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ReferenceList>
              </Section>
            </>
          )}
        </SidebarCard>

        <MapCard>
          <MapHeader>
            <MapTitle>{activeTopic}</MapTitle>
            <MapSubtitle>구조화된 배경 지식 맵</MapSubtitle>
          </MapHeader>

          {activeData ? (
            <MapWrapper>
              <MapInner>
                <MapBackground />
                <MindMapSvg viewBox={`0 0 ${boardSize} ${boardSize}`}>
                  {nodes.map((node) => (
                    <line
                      key={`line-${node.branch.title}`}
                      x1={boardSize / 2}
                      y1={boardSize / 2}
                      x2={node.x}
                      y2={node.y}
                      stroke="rgba(59, 130, 246, 0.35)"
                      strokeWidth="2"
                    />
                  ))}
                </MindMapSvg>

                <CentralNode>
                  <CentralTitle>{activeTopic}</CentralTitle>
                  <CentralSummary>{activeData.summary}</CentralSummary>
                </CentralNode>

                {nodes.map((node) => (
                  <BranchNode
                    key={node.branch.title}
                    style={{ top: `${node.top}%`, left: `${node.left}%` }}
                  >
                    <BranchBubble $color={node.branch.color}>
                      <BranchTitle>{node.branch.title}</BranchTitle>
                      <BranchList>
                        {node.branch.subtopics.map((subtopic) => (
                          <li key={subtopic}>{subtopic}</li>
                        ))}
                      </BranchList>
                    </BranchBubble>
                  </BranchNode>
                ))}
              </MapInner>
            </MapWrapper>
          ) : (
            <EmptyState>
              준비된 마인드맵이 없어요. 다른 주제를 선택해보세요.
            </EmptyState>
          )}
        </MapCard>
      </Content>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
  color: #0f172a;
`;

const Content = styled.main`
  width: min(1200px, 92%);
  margin: 32px auto;
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr;
  gap: 32px;
  align-items: start;
  padding-bottom: 64px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarCard = styled.section`
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Subtitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const Title = styled.h1`
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1.3;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
`;

const TopicForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HiddenLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const TopicInput = styled.input`
  width: 100%;
  border: 1px solid #cbd5f5;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 1rem;
  background: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: #fff;
  }
`;

const SubmitButton = styled.button`
  align-self: flex-start;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
  }
`;

const InlineAlert = styled.p`
  font-size: 0.85rem;
  color: #dc2626;
  background: rgba(248, 113, 113, 0.12);
  border-radius: 12px;
  padding: 10px 14px;
  line-height: 1.5;
`;

const QuickTopicList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const TopicChip = styled.button`
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  background: #e2e8f0;
  color: #1e293b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #cbd5f5;
  }

  &.is-active {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    box-shadow: 0 12px 30px rgba(79, 70, 229, 0.35);
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
`;

const Overview = styled.p`
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
`;

const BulletList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 18px;
  color: #475569;

  li {
    line-height: 1.55;
  }
`;

const ReferenceList = styled(BulletList)`
  li {
    position: relative;
    padding-left: 4px;
  }
`;

const MapCard = styled.section`
  background: #ffffff;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 28px 65px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MapHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MapTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
`;

const MapSubtitle = styled.p`
  font-size: 0.95rem;
  color: #64748b;
`;

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
`;

const MapInner = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.18), transparent 70%);
`;

const MapBackground = styled.div`
  position: absolute;
  inset: 12% 10%;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.03), rgba(59, 130, 246, 0.05));
  backdrop-filter: blur(4px);
`;

const MindMapSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const CentralNode = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(230px, 40%);
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
  border: 2px solid rgba(59, 130, 246, 0.2);
`;

const CentralTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const CentralSummary = styled.p`
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
`;

const BranchNode = styled.div`
  position: absolute;
  width: min(210px, 42%);
  max-width: 220px;
`;

const BranchBubble = styled.div`
  background: #ffffff;
  border-radius: 18px;
  border: 2px solid ${({ $color }) => `${$color}55`};
  padding: 16px 18px;
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(4px);
`;

const BranchTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0f172a;
`;

const BranchList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #475569;
  font-size: 0.9rem;
  padding-left: 18px;
  line-height: 1.4;
`;

const EmptyState = styled.div`
  min-height: 360px;
  border-radius: 20px;
  background: rgba(226, 232, 240, 0.5);
  display: grid;
  place-items: center;
  color: #475569;
`;

export default LearnPage;
