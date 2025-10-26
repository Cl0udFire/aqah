import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/Topbar";

const mockMindMaps = {
  "인공지능 개론": {
    overview:
      "인공지능(AI)은 인간의 학습·추론 능력을 컴퓨터 시스템으로 구현하려는 연구 분야로, 문제 정의와 데이터 수집, 모델링, 검증에 대한 체계적인 이해가 필요합니다.",
    spotlight: "데이터, 알고리즘, 컴퓨팅 파워의 균형이 성공적인 AI 시스템을 좌우합니다.",
    branches: [
      {
        title: "핵심 개념",
        color: "#2563eb",
        summary: "AI의 개념적 정의와 철학적 배경을 정리합니다.",
        subtopics: [
          {
            title: "튜링 테스트와 지능적 행위 정의",
            context: "앨런 튜링이 제안한 대화 실험을 통해 기계가 인간과 구별되지 않는 언어 능력을 갖추었는지 판단합니다.",
            insights: ["판별자는 텍스트 기반 대화만으로 상대가 기계인지 구분", "행위 중심으로 지능을 정의하려는 접근"]
          },
          {
            title: "약한 AI와 강한 AI의 목표 차이",
            context: "문제 해결에 초점을 맞춘 약한 AI와 자각을 추구하는 강한 AI가 지향하는 목표를 비교합니다.",
            insights: ["약한 AI는 특정 과제 정확도를 최대화", "강한 AI는 인간과 동등한 이해와 의식을 목표"]
          },
          {
            title: "데이터·알고리즘·컴퓨팅 파워의 3요소",
            context: "AI 성능을 결정짓는 데이터 품질, 알고리즘 설계, 연산 자원의 균형을 점검합니다.",
            insights: ["데이터 품질이 모델 일반화의 기반", "연산 자원은 실험 속도와 모델 규모를 제약"]
          }
        ]
      },
      {
        title: "주요 기법",
        color: "#4338ca",
        summary: "다양한 학습 패러다임과 대표 모델의 작동 방식을 훑습니다.",
        subtopics: [
          {
            title: "지도/비지도/강화 학습 프레임워크",
            context: "레이블 여부와 보상 구조에 따라 모델 학습 방식이 어떻게 달라지는지 비교합니다.",
            insights: ["지도 학습은 정답 데이터를 통해 패턴을 학습", "강화 학습은 보상을 통한 정책 최적화를 수행"]
          },
          {
            title: "딥러닝: CNN, RNN, Transformer",
            context: "주요 아키텍처가 특징적인 입력 구조와 표현 학습 전략을 어떻게 활용하는지 살펴봅니다.",
            insights: ["CNN은 지역적 패턴을 포착하는 합성곱 필터를 사용", "Transformer는 어텐션을 통해 전역 문맥을 학습"]
          },
          {
            title: "지식 기반 추론과 탐색 알고리즘",
            context: "전통적 AI의 규칙 기반 추론과 탐색 기법이 문제 해결을 구조화하는 방법을 이해합니다.",
            insights: ["검색 공간을 줄이기 위한 휴리스틱 설계", "규칙 기반 시스템은 설명 가능한 추론 경로 제공"]
          }
        ]
      },
      {
        title: "응용 분야",
        color: "#0ea5e9",
        summary: "AI가 산업과 일상에서 활용되는 대표 응용 사례를 살펴봅니다.",
        subtopics: [
          {
            title: "컴퓨터 비전, 자연어 처리, 음성 인식",
            context: "감각 데이터를 이해하기 위한 CV, NLP, 음성 기술의 주요 활용 장면을 정리합니다.",
            insights: ["이미지 분류와 객체 탐지가 자동화의 핵심", "언어 모델은 요약·질의응답·번역을 지원"]
          },
          {
            title: "추천 시스템과 개인화 서비스",
            context: "사용자 행동 데이터를 바탕으로 맞춤형 콘텐츠를 제시하는 추천 엔진의 핵심 아이디어를 확인합니다.",
            insights: ["협업 필터링과 콘텐츠 기반 필터링의 결합", "실시간 피드백으로 모델을 지속 개선"]
          },
          {
            title: "자율주행, 로보틱스, 스마트 팩토리",
            context: "물리 세계와 상호작용하는 시스템이 AI를 통해 의사결정을 자동화하는 방식을 살펴봅니다.",
            insights: ["센서 융합이 환경 인식의 정확도를 좌우", "경로 계획과 제어 알고리즘의 안전성 확보"]
          }
        ]
      },
      {
        title: "학습 전략",
        color: "#14b8a6",
        summary: "실무 역량을 기르기 위한 학습 로드맵과 툴 활용법을 소개합니다.",
        subtopics: [
          {
            title: "수학 기초: 선형대수, 확률, 최적화",
            context: "모델 이해를 위한 선형대수, 확률론, 최적화 이론이 실제 알고리즘에서 어떻게 쓰이는지 연결합니다.",
            insights: ["행렬 연산이 신경망 계산의 토대", "확률분포 이해가 모델 불확실성 해석을 돕는다"]
          },
          {
            title: "데이터 전처리와 모델 실험 반복",
            context: "데이터 정제에서 실험 관리까지 반복 가능한 워크플로를 구축하는 방법을 설명합니다.",
            insights: ["피처 엔지니어링이 모델 성능의 변화를 좌우", "실험 추적 도구가 협업과 재현성을 높임"]
          },
          {
            title: "클라우드/오픈소스 도구 활용",
            context: "클라우드 서비스와 오픈소스 프레임워크를 활용해 학습·배포 환경을 구성하는 팁을 제시합니다.",
            insights: ["MLOps 플랫폼이 모델 배포를 자동화", "GPU 리소스를 효율적으로 할당하는 전략 필요"]
          }
        ]
      },
      {
        title: "윤리와 거버넌스",
        color: "#f97316",
        summary: "책임 있는 AI 개발을 위한 윤리·규제 이슈를 검토합니다.",
        subtopics: [
          {
            title: "편향, 공정성, 설명 가능성",
            context: "데이터 편향과 불투명한 모델이 야기하는 불공정을 점검하고 완화 전략을 찾습니다.",
            insights: ["데이터 수집 단계에서 대표성 확보", "설명 가능한 모델이 규제 준수를 돕는다"]
          },
          {
            title: "프라이버시 보장과 책임 있는 AI",
            context: "차등 프라이버시, 연합 학습 등 개인정보 보호 기술을 활용한 책임 있는 개발 방법을 다룹니다.",
            insights: ["민감 정보 최소화를 위한 데이터 거버넌스", "프라이버시 강화 기술과 성능 간 균형"]
          },
          {
            title: "국제적 규제 및 표준 동향",
            context: "EU AI Act 등 글로벌 규제 흐름과 산업별 가이드라인을 비교합니다.",
            insights: ["위험 기반 등급 분류가 감독 수준을 결정", "표준화가 공급망 전반의 신뢰를 높임"]
          }
        ]
      }
    ]
  },
  "양자 컴퓨팅": {
    overview:
      "양자 컴퓨팅은 큐비트와 중첩·얽힘 같은 양자 현상을 계산 자원으로 사용합니다. 알고리즘 복잡도, 오류 정정, 하드웨어 기술을 아우르는 다학제적 접근이 필요합니다.",
    spotlight: "양자 알고리즘은 고전적 계산이 어려운 문제를 지수적으로 단축할 잠재력을 지닙니다.",
    branches: [
      {
        title: "기초 물리",
        color: "#8b5cf6",
        summary: "큐비트의 물리적 특성과 양자현상을 직관적으로 이해합니다.",
        subtopics: [
          {
            title: "큐비트와 블로흐 구면",
            context: "블로흐 구면 표현을 통해 큐비트 상태를 시각화하고 회전 연산의 의미를 파악합니다.",
            insights: ["단일 큐비트 상태는 구면 좌표로 표현", "게이트는 구면에서의 회전으로 해석 가능"]
          },
          {
            title: "중첩(superposition)과 간섭",
            context: "여러 상태를 동시에 표현하는 중첩과 간섭 현상이 계산에서 어떻게 활용되는지 살펴봅니다.",
            insights: ["하나의 큐비트로 0과 1을 동시에 표현", "간섭을 조절해 원하는 해에 확률 집중"]
          },
          {
            title: "얽힘(entanglement)의 계산적 의미",
            context: "얽힘이 다중 큐비트 간 상관관계를 만들어 고전 계산으로는 얻기 어려운 패턴을 생성함을 설명합니다.",
            insights: ["얽힘은 전역적인 상태 공간을 확장", "얽힘 유지가 양자 회로의 핵심 과제"]
          }
        ]
      },
      {
        title: "대표 알고리즘",
        color: "#22d3ee",
        summary: "양자 알고리즘이 복잡도를 어떻게 개선하는지 사례로 확인합니다.",
        subtopics: [
          {
            title: "쇼어 알고리즘: 소인수분해",
            context: "양자 푸리에 변환을 활용해 주기성을 찾고 소인수분해 문제를 다항 시간에 해결하는 원리를 설명합니다.",
            insights: ["정수 인수분해가 지수 시간에서 다항 시간으로", "양자 푸리에 변환이 주기 검출을 가속"]
          },
          {
            title: "그로버 탐색 알고리즘",
            context: "비정렬 데이터베이스 탐색을 제곱근 시간으로 단축하는 앰플리튜드 증폭 기법을 살펴봅니다.",
            insights: ["반복적 위상 반전으로 해의 확률을 키움", "N개의 상태를 √N 단계로 탐색"]
          },
          {
            title: "변분 양자 알고리즘(VQA)",
            context: "NISQ 환경에서 양자·고전 하이브리드 루프로 최적화를 수행하는 변분 회로 구조를 다룹니다.",
            insights: ["매개변수화된 회로와 고전 최적화 결합", "문제별 코스트 함수를 정의해 최소화"]
          }
        ]
      },
      {
        title: "하드웨어",
        color: "#34d399",
        summary: "다양한 물리적 구현 방식의 장단점을 비교합니다.",
        subtopics: [
          {
            title: "초전도, 이온트랩, 광자 기반 접근",
            context: "주요 하드웨어 플랫폼별 큐비트 구현 방식과 제어 기술의 차이를 정리합니다.",
            insights: ["초전도 큐비트는 빠른 게이트와 짧은 코히어런스", "이온트랩은 높은 충실도와 확장성 과제"]
          },
          {
            title: "큐비트 수와 게이트 충실도",
            context: "양자 우위를 확보하기 위해 필요한 큐비트 규모와 게이트 정확도 지표를 해석합니다.",
            insights: ["게이트 에러가 회로 깊이를 제한", "논리 큐비트 확보를 위해 피델리티 향상 필요"]
          },
          {
            title: "NISQ 시대의 제약과 로드맵",
            context: "노이즈가 큰 중간 규모 장치의 한계를 극복하기 위한 연구 로드맵과 산업 전략을 살펴봅니다.",
            insights: ["오류 완화 기법으로 짧은 회로 활용", "하이브리드 알고리즘이 실용적 출발점"]
          }
        ]
      },
      {
        title: "오류 정정",
        color: "#facc15",
        summary: "오류 정정 코드와 피드백 제어 전략을 이해합니다.",
        subtopics: [
          {
            title: "표면 코드와 토폴로지 코드",
            context: "2차원 격자에 큐비트를 배치해 국소 오류를 감지하고 보정하는 표면 코드 원리를 살펴봅니다.",
            insights: ["논리 큐비트 구성을 위한 스태빌라이저 측정", "문턱값을 넘는 피델리티가 필수"]
          },
          {
            title: "피델리티 향상 기법",
            context: "다중 게이트에서 누적되는 오차를 줄이기 위한 다이나믹 디커플링, 리셋 기술 등을 소개합니다.",
            insights: ["파형 제어로 위상 노이즈를 억제", "오류 완화로 회로 길이를 확장"]
          },
          {
            title: "에러 억제를 위한 하드웨어-소프트웨어 협력",
            context: "하드웨어 제어와 소프트웨어 레이어가 연동해 전체 시스템의 에러율을 낮추는 방법을 설명합니다.",
            insights: ["제어 전자와 컴파일러 최적화가 함께 필요", "피드백 루프가 안정적인 동작을 보장"]
          }
        ]
      },
      {
        title: "응용 가능성",
        color: "#fb7185",
        summary: "양자 컴퓨팅이 기대되는 응용 영역을 탐색합니다.",
        subtopics: [
          {
            title: "암호 해독과 보안",
            context: "양자 공격에 대비한 암호 전환 전략과 양자 안전 암호 기술을 비교합니다.",
            insights: ["현재 공인된 공개키 암호는 양자 취약", "양자 안전 암호 표준화가 진행 중"]
          },
          {
            title: "신소재 탐색, 화학 시뮬레이션",
            context: "분자 에너지 계산 등 고전적으로 어려운 양자 화학 문제를 효율적으로 풀 가능성을 살펴봅니다.",
            insights: ["전자 구조 계산이 양자 장점 분야", "양자-고전 하이브리드가 초기 활용 모델"]
          },
          {
            title: "금융 최적화와 머신러닝",
            context: "포트폴리오 최적화, 샘플링 가속 등 금융·ML에서 기대되는 양자 가속 시나리오를 소개합니다.",
            insights: ["QAOA가 조합 최적화에 적용", "양자 볼츠만 머신 등 새로운 모델 연구"]
          }
        ]
      }
    ]
  },
  "지속가능한 에너지 전환": {
    overview:
      "지속가능한 에너지 전환은 재생에너지 확대, 효율 향상, 제도·시장 설계가 결합된 복합 과제입니다. 기술 발전과 정책, 시민 참여가 맞물려야 실질적 효과를 낼 수 있습니다.",
    spotlight: "재생에너지와 효율 혁신, 제도 설계가 함께 작동해야 지속가능한 전환이 가능합니다.",
    branches: [
      {
        title: "재생에너지",
        color: "#22c55e",
        summary: "다양한 재생에너지 자원의 특성과 확산 전략을 정리합니다.",
        subtopics: [
          {
            title: "태양광·풍력의 발전 특성",
            context: "간헐성과 출력 변동을 고려한 설계·운영 전략을 소개합니다.",
            insights: ["출력 예측 정확도가 계통 안정성에 직결", "ESS 연계가 변동성을 완화"]
          },
          {
            title: "수소, 해양, 지열 등 대체 자원",
            context: "다양한 재생 열원과 연료를 활용한 장기 에너지 믹스 가능성을 살펴봅니다.",
            insights: ["수소는 저장과 운송의 유연성 제공", "해양·지열 자원은 지역 맞춤형 전략 필요"]
          },
          {
            title: "분산형 발전과 마이크로그리드",
            context: "지역 단위 에너지 자립을 위한 분산형 인프라 설계 요소를 설명합니다.",
            insights: ["양방향 전력 흐름을 고려한 계통 설계", "에너지 관리 시스템이 수요를 최적화"]
          }
        ]
      },
      {
        title: "저장 기술",
        color: "#0ea5e9",
        summary: "에너지 저장 시스템의 기술 동향과 경제성을 분석합니다.",
        subtopics: [
          {
            title: "배터리 효율과 수명 관리",
            context: "리튬이온 등 배터리의 열화 메커니즘과 수명 연장을 위한 운영 전략을 다룹니다.",
            insights: ["충방전 프로파일 관리가 수명 좌우", "BMS 데이터 분석으로 잔존 가치를 평가"]
          },
          {
            title: "수소 저장 및 전환",
            context: "그린수소 생산과 저장·활용 체계를 통해 장주기 저장을 구현하는 방법을 소개합니다.",
            insights: ["전력-수소-전력(P2G2P) 변환 효율 최적화", "수소 인프라 안전성이 확산의 관건"]
          },
          {
            title: "전력망 안정화를 위한 ESS",
            context: "주파수 조정, 피크 저감 등 계통 서비스를 제공하는 ESS 비즈니스 모델을 설명합니다.",
            insights: ["운영 수익원 다각화가 투자 회수에 중요", "정책 지원과 시장 제도가 사업성에 영향"]
          }
        ]
      },
      {
        title: "정책과 시장",
        color: "#f97316",
        summary: "전환을 가속하는 정책 수단과 시장 설계 이슈를 다룹니다.",
        subtopics: [
          {
            title: "탄소 가격제와 인센티브",
            context: "탄소세·배출권거래제 도입이 기업 의사결정과 투자에 미치는 영향을 분석합니다.",
            insights: ["가격 시그널이 저탄소 투자를 촉진", "수익 재분배가 사회적 수용성 확보"]
          },
          {
            title: "전력 시장 구조 혁신",
            context: "도매·소매 시장 개편과 수요자원 참여 확대 방안을 살펴봅니다.",
            insights: ["분산 자원이 계통 서비스에 참여", "실시간 정산 체계가 효율적 가격 신호 제공"]
          },
          {
            title: "국제 협력과 표준화",
            context: "국경을 넘는 전력 거래와 기술 표준화가 전환 속도에 미치는 영향을 살펴봅니다.",
            insights: ["그린수소 인증 등 공통 기준 수립", "국제 전력망 연계가 공급 안정성을 높임"]
          }
        ]
      },
      {
        title: "도시와 시민",
        color: "#a855f7",
        summary: "생활권에서의 에너지 소비 혁신과 시민 참여 모델을 다룹니다.",
        subtopics: [
          {
            title: "스마트 그리드와 수요 관리",
            context: "디지털 계량 인프라를 활용해 수요를 능동적으로 조정하는 방식을 소개합니다.",
            insights: ["실시간 요금제가 참여 유인을 제공", "자동화된 수요 반응 장치가 편의성을 높임"]
          },
          {
            title: "커뮤니티 에너지 프로젝트",
            context: "지역 기반 협동조합과 시민 전력사가 추진하는 분산형 프로젝트 사례를 공유합니다.",
            insights: ["지역 자본이 재생에너지 수익을 공유", "거버넌스 구조가 장기 지속성을 좌우"]
          },
          {
            title: "에너지 복지와 교육",
            context: "취약계층 지원과 에너지 문해력 향상을 위한 정책을 정리합니다.",
            insights: ["에너지 바우처로 필수 사용량 보장", "교육 프로그램이 행동 변화를 촉진"]
          }
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

const MindmapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const MindmapSvg = styled.svg`
  width: 100%;
  height: 100%;
  cursor: ${(props) => (props.$isPanning ? "grabbing" : "grab")};
  touch-action: none;
  user-select: none;
`;

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 15px;
`;

const DetailPanel = styled.section`
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #e2e8f0;
`;

const DetailHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailBadge = styled.span`
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ accent }) => accent || "#1d4ed8"};
  color: rgba(15, 23, 42, 0.9);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const DetailTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
`;

const DetailDescription = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.88);
`;

const DetailList = styled.ul`
  margin: 4px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 6px;
`;

const DetailItem = styled.li`
  font-size: 14px;
  line-height: 1.6;
  color: rgba(203, 213, 225, 0.9);
`;

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return `rgba(59, 130, 246, ${alpha})`;
  }

  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function wrapText(text, maxChars, maxLines) {
  if (!text) {
    return [];
  }

  const words = text.trim().split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const tentative = currentLine ? `${currentLine} ${word}` : word;
    if (tentative.length <= maxChars) {
      currentLine = tentative;
    } else if (!currentLine) {
      lines.push(tentative);
      currentLine = "";
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[truncated.length - 1] = `${truncated[truncated.length - 1].replace(/…?$/, "")}…`;
    return truncated;
  }

  return lines;
}

function createLinkPath(source, target) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  const sourceX = source.x + Math.cos(angle) * source.radius;
  const sourceY = source.y + Math.sin(angle) * source.radius;
  const targetX = target.x - Math.cos(angle) * target.radius;
  const targetY = target.y - Math.sin(angle) * target.radius;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const curveStrength = Math.min(0.35, 60 / distance);
  const normalX = -dy * curveStrength;
  const normalY = dx * curveStrength;
  const controlX = midX + normalX;
  const controlY = midY + normalY;

  return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
}

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

function MindmapCanvas({ width, height, nodes, links, activeNodeId, onNodeSelect }) {
  const decoratedNodes = useMemo(() => {
    return nodes.map((node) => {
      const labelLines = wrapText(node.label, node.text.maxChars, 1);
      const contextLines = wrapText(node.context, node.text.maxChars, node.text.maxLines);
      const labelLineHeight = node.type === "root" ? 22 : node.type === "branch" ? 20 : 18;
      const contextLineHeight = node.type === "root" ? 18.5 : 17.5;
      const gap = labelLines.length && contextLines.length ? 10 : 0;
      const totalLabelHeight = labelLines.length * labelLineHeight;
      const totalContextHeight = contextLines.length * contextLineHeight;
      const blockHeight = totalLabelHeight + totalContextHeight + gap;
      const alignCenter = node.text.baseline === "middle";
      const labelStartY = alignCenter ? -blockHeight / 2 : 0;
      const contextStartY = labelStartY + totalLabelHeight + gap;
      const labelPositions = labelLines.map((_, index) => labelStartY + index * labelLineHeight);
      const contextPositions = contextLines.map(
        (_, index) => contextStartY + index * contextLineHeight
      );

      const labelFontSize = node.fontSize;
      const contextFontSize = node.type === "root" ? 13 : node.type === "branch" ? 12.5 : 12;
      const estimatedLabelWidth = labelLines.reduce(
        (max, line) => Math.max(max, line.length * labelFontSize * 0.64),
        0
      );
      const estimatedContextWidth = contextLines.reduce(
        (max, line) => Math.max(max, line.length * contextFontSize * 0.62),
        0
      );
      const textWidth = Math.max(estimatedLabelWidth, estimatedContextWidth);

      const anchorX = node.x + node.text.offsetX;
      let textLeft = anchorX;
      let textRight = anchorX;
      if (node.text.anchor === "start") {
        textRight += textWidth;
      } else if (node.text.anchor === "end") {
        textLeft -= textWidth;
      } else {
        textLeft -= textWidth / 2;
        textRight += textWidth / 2;
      }

      const hasLabel = labelLines.length > 0;
      const hasContext = contextLines.length > 0;
      const textTopOffset = hasLabel ? labelStartY : hasContext ? contextStartY : 0;
      const textBottomOffset = hasContext
        ? contextStartY + totalContextHeight
        : hasLabel
        ? labelStartY + totalLabelHeight
        : 0;

      const textTop = node.y + node.text.offsetY + textTopOffset - 6;
      const textBottom = node.y + node.text.offsetY + textBottomOffset + 10;

      const bounds = {
        left: Math.min(node.x - node.radius, textLeft - 12),
        right: Math.max(node.x + node.radius, textRight + 12),
        top: Math.min(node.y - node.radius, textTop),
        bottom: Math.max(node.y + node.radius, textBottom)
      };

      return {
        ...node,
        labelLines,
        contextLines,
        textLayout: {
          labelPositions,
          contextPositions,
          labelLineHeight,
          contextLineHeight,
          contextFontSize,
          textWidth
        },
        bounds
      };
    });
  }, [nodes]);

  const nodesById = useMemo(() => {
    return decoratedNodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  }, [decoratedNodes]);

  const adjacency = useMemo(() => {
    const map = new Map();
    decoratedNodes.forEach((node) => {
      map.set(node.id, new Set());
    });

    links.forEach((link) => {
      if (!map.has(link.source) || !map.has(link.target)) {
        return;
      }

      map.get(link.source).add(link.target);
      map.get(link.target).add(link.source);
    });

    return map;
  }, [links, decoratedNodes]);

  const relatedNodes = useMemo(() => {
    if (!activeNodeId || !adjacency.size) {
      return new Set();
    }

    const maxDepth = activeNodeId === "root" ? 2 : 1;
    const visited = new Set([activeNodeId]);
    const queue = [[activeNodeId, 0]];
    let index = 0;

    while (index < queue.length) {
      const [currentId, depth] = queue[index];
      index += 1;

      if (depth >= maxDepth) {
        continue;
      }

      const neighbors = adjacency.get(currentId);
      neighbors?.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, depth + 1]);
        }
      });
    }

    return visited;
  }, [activeNodeId, adjacency]);

  const contentBounds = useMemo(() => {
    if (!decoratedNodes.length) {
      return {
        minX: 0,
        maxX: Math.max(width, 1),
        minY: 0,
        maxY: Math.max(height, 1)
      };
    }

    return decoratedNodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.bounds.left),
        maxX: Math.max(acc.maxX, node.bounds.right),
        minY: Math.min(acc.minY, node.bounds.top),
        maxY: Math.max(acc.maxY, node.bounds.bottom)
      }),
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      }
    );
  }, [decoratedNodes, height, width]);

  const baseViewBox = useMemo(() => {
    const paddingX = 56;
    const paddingY = 56;
    const minX = Number.isFinite(contentBounds.minX) ? contentBounds.minX : 0;
    const maxX = Number.isFinite(contentBounds.maxX) ? contentBounds.maxX : Math.max(width, 1);
    const minY = Number.isFinite(contentBounds.minY) ? contentBounds.minY : 0;
    const maxY = Number.isFinite(contentBounds.maxY) ? contentBounds.maxY : Math.max(height, 1);
    const baseWidth = Math.max(maxX - minX, 1);
    const baseHeight = Math.max(maxY - minY, 1);

    return {
      x: minX - paddingX,
      y: minY - paddingY,
      width: baseWidth + paddingX * 2,
      height: baseHeight + paddingY * 2
    };
  }, [contentBounds, height, width]);

  const baseViewBoxRef = useRef(baseViewBox);
  const [viewBox, setViewBox] = useState(baseViewBox);
  const svgRef = useRef(null);
  const pointerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    baseViewBoxRef.current = baseViewBox;
    setViewBox(baseViewBox);
  }, [baseViewBox]);

  const getSvgPoint = useCallback((event, vb) => {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    return {
      x: vb.x + vb.width * xRatio,
      y: vb.y + vb.height * yRatio
    };
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (decoratedNodes.length === 0) {
        return;
      }

      if (event.button !== 0 && event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      if (event.target.closest('[data-node="true"]')) {
        return;
      }

      const point = getSvgPoint(event, viewBox);
      if (!point) {
        return;
      }

      const svg = svgRef.current;
      svg?.setPointerCapture(event.pointerId);
      pointerRef.current = {
        pointerId: event.pointerId,
        lastPoint: point
      };
      setIsPanning(true);
    },
    [decoratedNodes.length, getSvgPoint, viewBox]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const pointerState = pointerRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();

      setViewBox((prev) => {
        const point = getSvgPoint(event, prev);
        if (!point) {
          return prev;
        }

        const deltaX = point.x - pointerState.lastPoint.x;
        const deltaY = point.y - pointerState.lastPoint.y;

        pointerState.lastPoint = point;

        return {
          ...prev,
          x: prev.x - deltaX,
          y: prev.y - deltaY
        };
      });
    },
    [getSvgPoint]
  );

  const endPan = useCallback((event) => {
    const pointerState = pointerRef.current;
    if (!pointerState) {
      return;
    }

    if (!event || pointerState.pointerId === event.pointerId) {
      const svg = svgRef.current;
      if (svg && event) {
        svg.releasePointerCapture(event.pointerId);
      }
      pointerRef.current = null;
      setIsPanning(false);
    }
  }, []);

  const handleWheel = useCallback(
    (event) => {
      if (decoratedNodes.length === 0) {
        return;
      }

      event.preventDefault();

      const base = baseViewBoxRef.current;
      if (!base) {
        return;
      }

      setViewBox((prev) => {
        const point = getSvgPoint(event, prev);
        if (!point) {
          return prev;
        }

        const baseWidth = base.width;
        const baseHeight = base.height;
        const minScale = 0.7;
        const maxScale = 2.5;
        const currentScale = baseWidth / prev.width;
        const scaleDelta = event.deltaY < 0 ? 1.12 : 0.88;
        const nextScale = Math.min(Math.max(currentScale * scaleDelta, minScale), maxScale);
        const newWidth = baseWidth / nextScale;
        const newHeight = baseHeight / nextScale;
        const ratio = newWidth / prev.width;

        return {
          width: newWidth,
          height: newHeight,
          x: point.x - (point.x - prev.x) * ratio,
          y: point.y - (point.y - prev.y) * ratio
        };
      });
    },
    [decoratedNodes.length, getSvgPoint]
  );

  const currentViewBox = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  const backgroundBox = baseViewBoxRef.current ?? viewBox;

  return (
    <MindmapSvg
      ref={svgRef}
      viewBox={currentViewBox}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerLeave={endPan}
      onPointerCancel={endPan}
      onWheel={handleWheel}
      $isPanning={isPanning}
    >
      <defs>
        <radialGradient id="mindmap-glow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.18)" />
          <stop offset="65%" stopColor="rgba(59, 130, 246, 0)" />
        </radialGradient>
      </defs>

      <rect
        x={backgroundBox.x}
        y={backgroundBox.y}
        width={backgroundBox.width}
        height={backgroundBox.height}
        fill="url(#mindmap-glow)"
        opacity={0.45}
        data-pan-surface
      />

      {links.map((link) => {
        const source = nodesById[link.source];
        const target = nodesById[link.target];

        if (!source || !target) {
          return null;
        }

        const path = createLinkPath(source, target);
        const isActive =
          relatedNodes.size > 0 &&
          (relatedNodes.has(link.source) && relatedNodes.has(link.target));

        return (
          <path
            key={`${link.source}-${link.target}`}
            d={path}
            fill="none"
            stroke={link.color}
            strokeWidth={isActive ? link.strokeWidth + 0.8 : link.strokeWidth}
            strokeLinecap="round"
            opacity={isActive || !relatedNodes.size ? link.opacity : link.opacity * 0.35}
            style={{ transition: "opacity 0.3s ease, stroke-width 0.3s ease" }}
          />
        );
      })}

      {decoratedNodes.map((node) => {
        const isActive = node.id === activeNodeId;
        const isDimmed = relatedNodes.size > 0 && !relatedNodes.has(node.id);
        const circleOpacity = isDimmed ? (node.opacity ?? 0.5) : node.opacity ?? 0.92;
        const radius = isActive ? node.radius + 4 : node.radius;
        const labelColor = isActive ? node.color : "#0f172a";
        const contextColor = isActive
          ? hexToRgba(node.color, 0.9)
          : "rgba(71, 85, 105, 0.88)";

        return (
          <g
            key={node.id}
            data-node="true"
            onClick={() => onNodeSelect(node.id)}
            role="button"
            tabIndex={0}
            style={{ cursor: "pointer" }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onNodeSelect(node.id);
              }
            }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={radius}
              fill={node.color}
              stroke="#ffffff"
              strokeWidth={isActive ? 3.5 : 2.4}
              opacity={circleOpacity}
              style={{
                transition: "all 0.3s ease",
                filter: isActive
                  ? `drop-shadow(0 18px 38px ${hexToRgba(node.color, 0.45)})`
                  : "drop-shadow(0 6px 16px rgba(15, 23, 42, 0.12))"
              }}
            />

            <g
              transform={`translate(${node.x + node.text.offsetX}, ${node.y + node.text.offsetY})`}
              style={{ pointerEvents: "none" }}
            >
              {node.labelLines.map((line, index) => (
                <text
                  key={`${node.id}-label-${index}`}
                  x={0}
                  y={node.textLayout.labelPositions[index]}
                  textAnchor={node.text.anchor}
                  dominantBaseline="hanging"
                  fontSize={node.fontSize}
                  fontWeight={node.type === "subtopic" ? 600 : 700}
                  fill={labelColor}
                  style={{ transition: "fill 0.3s ease" }}
                >
                  {line}
                </text>
              ))}

              {node.contextLines.map((line, index) => (
                <text
                  key={`${node.id}-context-${index}`}
                  x={0}
                  y={node.textLayout.contextPositions[index]}
                  textAnchor={node.text.anchor}
                  dominantBaseline="hanging"
                  fontSize={node.textLayout.contextFontSize}
                  fontWeight={400}
                  fill={contextColor}
                  style={{ transition: "fill 0.3s ease", letterSpacing: "0.01em" }}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        );
      })}
    </MindmapSvg>
  );
}

function LearnPage() {
  const topics = Object.keys(mockMindMaps);
  const [selectedTopic, setSelectedTopic] = useState(topics[0] ?? "");
  const selectedMindMap = mockMindMaps[selectedTopic];
  const [graphRef, graphSize] = useContainerSize();
  const [activeNodeId, setActiveNodeId] = useState("root");

  useEffect(() => {
    if (selectedMindMap) {
      setActiveNodeId("root");
    } else {
      setActiveNodeId("");
    }
  }, [selectedMindMap, selectedTopic]);

  const layoutWidth = Math.max(720, graphSize.width || 0);
  const layoutHeight = Math.max(640, graphSize.height || 0);

  const { nodes, links, detailMap } = useMemo(() => {
    if (!selectedMindMap) {
      return {
        nodes: [],
        links: [],
        detailMap: {}
      };
    }

    const centerX = layoutWidth / 2;
    const centerY = layoutHeight / 2;
    const minDimension = Math.min(layoutWidth, layoutHeight);
    const branchRadius = Math.max(240, minDimension * 0.32);
    const subtopicRadius = branchRadius + Math.max(140, minDimension * 0.2);
    const branchCount = Math.max(selectedMindMap.branches.length, 1);

    const nodesAccumulator = [];
    const linksAccumulator = [];
    const details = {
      root: {
        badge: "핵심 주제",
        title: selectedTopic,
        description: selectedMindMap.overview,
        bullets: selectedMindMap.branches.map((branch) => branch.title),
        accent: "#1d4ed8"
      }
    };

    const rootRadius = Math.max(60, minDimension * 0.085);
    const rootNode = {
      id: "root",
      label: selectedTopic,
      color: "#1d4ed8",
      radius: rootRadius,
      fontSize: 18,
      opacity: 1,
      context: selectedMindMap.spotlight ?? selectedMindMap.overview,
      angle: 0,
      type: "root",
      x: centerX,
      y: centerY,
      text: {
        anchor: "middle",
        offsetX: 0,
        offsetY: rootRadius + 24,
        baseline: "hanging",
        maxChars: 30,
        maxLines: 4
      }
    };

    nodesAccumulator.push(rootNode);

    selectedMindMap.branches.forEach((branch, branchIndex) => {
      const branchId = `branch-${branchIndex}`;
      const angle = (2 * Math.PI * branchIndex) / branchCount;
      const branchX = centerX + branchRadius * Math.cos(angle);
      const branchY = centerY + branchRadius * Math.sin(angle);
      const isLeft = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
      const branchRadiusPx = Math.max(36, minDimension * 0.06);

      const branchNode = {
        id: branchId,
        label: branch.title,
        color: branch.color,
        radius: branchRadiusPx,
        fontSize: 15,
        opacity: 0.95,
        context: branch.summary,
        angle,
        type: "branch",
        x: branchX,
        y: branchY,
        text: {
          anchor: isLeft ? "end" : "start",
          offsetX: (isLeft ? -1 : 1) * (branchRadiusPx + Math.max(78, minDimension * 0.12)),
          offsetY: -4,
          baseline: "middle",
          maxChars: 24,
          maxLines: 3
        }
      };

      nodesAccumulator.push(branchNode);
      linksAccumulator.push({
        source: "root",
        target: branchId,
        color: branch.color,
        opacity: 0.85,
        strokeWidth: 2.8
      });

      details[branchId] = {
        badge: "핵심 가지",
        title: branch.title,
        description: branch.summary,
        bullets: branch.subtopics.map((subtopic) => subtopic.title),
        accent: branch.color
      };

      const subtopicCount = branch.subtopics.length;
      const spread = Math.min(Math.PI / 2.1, Math.PI / 6 * Math.max(subtopicCount - 1, 1));

      branch.subtopics.forEach((subtopic, subIndex) => {
        const subtopicId = `sub-${branchIndex}-${subIndex}`;
        const offset =
          subtopicCount <= 1 ? 0 : -spread / 2 + (spread * subIndex) / (subtopicCount - 1);
        const subAngle = angle + offset;
        const subtopicX = centerX + subtopicRadius * Math.cos(subAngle);
        const subtopicY = centerY + subtopicRadius * Math.sin(subAngle);
        const isSubLeft = subAngle > Math.PI / 2 && subAngle < (3 * Math.PI) / 2;
        const subtopicRadiusPx = Math.max(26, minDimension * 0.045);

        const subtopicNode = {
          id: subtopicId,
          label: subtopic.title,
          color: branch.color,
          radius: subtopicRadiusPx,
          fontSize: 12,
          opacity: 0.9,
          context: subtopic.context,
          angle: subAngle,
          type: "subtopic",
          x: subtopicX,
          y: subtopicY,
          text: {
            anchor: isSubLeft ? "end" : "start",
            offsetX: (isSubLeft ? -1 : 1) * (subtopicRadiusPx + Math.max(54, minDimension * 0.085)),
            offsetY: -2,
            baseline: "middle",
            maxChars: 28,
            maxLines: 2
          }
        };

        nodesAccumulator.push(subtopicNode);
        linksAccumulator.push({
          source: branchId,
          target: subtopicId,
          color: branch.color,
          opacity: 0.72,
          strokeWidth: 1.9
        });

        details[subtopicId] = {
          badge: "세부 키워드",
          title: subtopic.title,
          description: subtopic.context,
          bullets: subtopic.insights ?? [],
          accent: branch.color
        };
      });
    });

    return {
      nodes: nodesAccumulator,
      links: linksAccumulator,
      detailMap: details
    };
  }, [layoutHeight, layoutWidth, selectedMindMap, selectedTopic]);

  const activeDetailId = useMemo(() => {
    if (detailMap[activeNodeId]) {
      return activeNodeId;
    }

    if (detailMap.root) {
      return "root";
    }

    const fallback = Object.keys(detailMap)[0];

    return fallback ?? "";
  }, [activeNodeId, detailMap]);

  const activeDetail = detailMap[activeDetailId];

  const handleNodeClick = useCallback((nodeId) => {
    setActiveNodeId(nodeId);
  }, []);

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
            <MindmapSection>
              <GraphShell>
                <GraphViewport ref={graphRef}>
                  {nodes.length ? (
                    <MindmapCanvas
                      width={layoutWidth}
                      height={layoutHeight}
                      nodes={nodes}
                      links={links}
                      activeNodeId={activeDetailId}
                      onNodeSelect={handleNodeClick}
                    />
                  ) : (
                    <EmptyState>선택한 주제의 마인드맵을 준비하고 있습니다.</EmptyState>
                  )}
                </GraphViewport>
              </GraphShell>
              {activeDetail ? (
                <DetailPanel>
                  <DetailHeader>
                    <DetailBadge accent={activeDetail.accent}>{activeDetail.badge}</DetailBadge>
                    <DetailTitle>{activeDetail.title}</DetailTitle>
                  </DetailHeader>
                  <DetailDescription>{activeDetail.description}</DetailDescription>
                  {activeDetail.bullets?.length ? (
                    <DetailList>
                      {activeDetail.bullets.map((item) => (
                        <DetailItem key={item}>{item}</DetailItem>
                      ))}
                    </DetailList>
                  ) : null}
                </DetailPanel>
              ) : null}
            </MindmapSection>
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
