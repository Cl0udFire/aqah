import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/Topbar";

const mindMapTemplate = {
  overview: "주제를 한 문장으로 요약 (최대 40자)",
  spotlight: "핵심 메시지를 한 문장으로 강조",
  branches: [
    {
      title: "세부 축 이름",
      summary: "세부 축 설명 (최대 20자)",
      subtopics: [
        {
          title: "소주제 이름",
          context: "소주제 설명 (최대 35자)",
          insights: ["핵심 포인트를 짧게"]
        }
      ]
    }
  ]
};

const mockMindMaps = {
  "인공지능 개론": {
    overview: "AI 핵심 개념과 흐름을 한눈에 정리합니다.",
    spotlight: "데이터·모델·컴퓨팅의 균형이 성과를 좌우합니다.",
    branches: [
      {
        title: "핵심 개념",
        color: "#2563eb",
        summary: "AI 정의와 철학적 배경",
        subtopics: [
          {
            title: "튜링 테스트",
            context: "대화를 통해 기계 지능을 판별한 고전 실험.",
            insights: ["대화 품질이 평가 기준"]
          },
          {
            title: "약한 vs 강한 AI",
            context: "실용 목표와 자각 추구 간 차이를 비교합니다.",
            insights: ["현실은 약한 AI 중심"]
          },
          {
            title: "AI 3요소",
            context: "데이터·알고리즘·연산 자원의 균형을 점검합니다.",
            insights: ["데이터 품질이 토대"]
          }
        ]
      },
      {
        title: "주요 기법",
        color: "#4338ca",
        summary: "학습 패러다임과 모델",
        subtopics: [
          {
            title: "학습 유형",
            context: "지도·비지도·강화 학습의 차이를 요약합니다.",
            insights: ["보상이 정책을 결정"]
          },
          {
            title: "대표 아키텍처",
            context: "CNN·RNN·Transformer의 활용 포인트를 정리합니다.",
            insights: ["어텐션이 전역 문맥 확보"]
          },
          {
            title: "전통 기법",
            context: "규칙 기반 추론과 탐색 전략을 간단히 소개합니다.",
            insights: ["휴리스틱이 탐색을 압축"]
          }
        ]
      },
      {
        title: "응용 분야",
        color: "#0ea5e9",
        summary: "산업 전반의 활용",
        subtopics: [
          {
            title: "감각 데이터",
            context: "비전·언어·음성 분야의 대표 사례를 정리합니다.",
            insights: ["언어 모델이 업무를 보조"]
          },
          {
            title: "추천 시스템",
            context: "행동 데이터를 활용한 개인화 전략을 설명합니다.",
            insights: ["피드백으로 품질 개선"]
          },
          {
            title: "물리 시스템",
            context: "자율주행과 로보틱스에서의 의사결정 자동화를 다룹니다.",
            insights: ["센서 융합이 핵심"]
          }
        ]
      },
      {
        title: "학습 전략",
        color: "#14b8a6",
        summary: "학습 로드맵과 도구",
        subtopics: [
          {
            title: "수학 기초",
            context: "선형대수·확률·최적화가 모델 이해에 연결됩니다.",
            insights: ["행렬 연산이 토대"]
          },
          {
            title: "실험 워크플로",
            context: "전처리와 실험 추적을 반복 가능한 흐름으로 만듭니다.",
            insights: ["추적 도구가 협업 지원"]
          },
          {
            title: "도구 활용",
            context: "클라우드와 오픈소스 도구로 학습·배포 환경을 구성합니다.",
            insights: ["MLOps가 배포를 자동화"]
          }
        ]
      },
      {
        title: "윤리와 거버넌스",
        color: "#f97316",
        summary: "책임 있는 개발 원칙",
        subtopics: [
          {
            title: "공정성",
            context: "데이터 편향과 설명 가능성 확보 방안을 점검합니다.",
            insights: ["대표성 있는 데이터"]
          },
          {
            title: "프라이버시",
            context: "차등 프라이버시와 연합 학습을 통한 보호 전략을 소개합니다.",
            insights: ["민감 정보 최소화"]
          },
          {
            title: "규제 동향",
            context: "글로벌 규제와 표준 흐름을 간략히 정리합니다.",
            insights: ["위험 등급이 감독 결정"]
          }
        ]
      }
    ]
  },
  "양자 컴퓨팅": {
    overview: "큐비트와 양자 현상을 활용하는 계산 패러다임입니다.",
    spotlight: "양자 알고리즘은 특정 문제를 대폭 단축할 가능성이 있습니다.",
    branches: [
      {
        title: "기초 물리",
        color: "#8b5cf6",
        summary: "큐비트와 양자 현상",
        subtopics: [
          {
            title: "블로흐 구면",
            context: "큐비트 상태를 구면 좌표로 표현합니다.",
            insights: ["게이트는 회전으로 해석"]
          },
          {
            title: "중첩과 간섭",
            context: "여러 상태를 동시에 다루고 간섭을 조절합니다.",
            insights: ["간섭 제어가 확률 집중"]
          },
          {
            title: "얽힘",
            context: "다중 큐비트 상관관계로 상태 공간을 확장합니다.",
            insights: ["유지 관리가 핵심 과제"]
          }
        ]
      },
      {
        title: "대표 알고리즘",
        color: "#22d3ee",
        summary: "복잡도 개선 사례",
        subtopics: [
          {
            title: "쇼어 알고리즘",
            context: "양자 푸리에 변환으로 소인수분해를 가속합니다.",
            insights: ["주기 검출이 핵심"]
          },
          {
            title: "그로버 탐색",
            context: "앰플리튜드 증폭으로 탐색 복잡도를 줄입니다.",
            insights: ["√N 단계로 탐색"]
          },
          {
            title: "변분 회로",
            context: "양자·고전 하이브리드 루프로 최적화를 수행합니다.",
            insights: ["매개변수화 회로"]
          }
        ]
      },
      {
        title: "하드웨어",
        color: "#34d399",
        summary: "플랫폼 비교",
        subtopics: [
          {
            title: "주요 플랫폼",
            context: "초전도·이온트랩·광자 방식의 특징을 비교합니다.",
            insights: ["속도와 확장성의 절충"]
          },
          {
            title: "규모 지표",
            context: "큐비트 수와 게이트 충실도 지표를 해석합니다.",
            insights: ["에러가 깊이를 제한"]
          },
          {
            title: "NISQ 제약",
            context: "노이즈가 큰 중간 규모 장치의 한계를 요약합니다.",
            insights: ["오류 완화가 필수"]
          }
        ]
      },
      {
        title: "오류 정정",
        color: "#facc15",
        summary: "오류 정정 전략",
        subtopics: [
          {
            title: "표면 코드",
            context: "2차원 격자에 큐비트를 배치해 오류를 감지합니다.",
            insights: ["문턱값 이상 유지"]
          },
          {
            title: "피델리티 개선",
            context: "디커플링과 리셋으로 누적 오차를 줄입니다.",
            insights: ["파형 제어가 중요"]
          },
          {
            title: "협력 제어",
            context: "하드웨어와 소프트웨어가 함께 에러율을 낮춥니다.",
            insights: ["피드백 루프 활용"]
          }
        ]
      },
      {
        title: "응용 가능성",
        color: "#fb7185",
        summary: "잠재적 응용 분야",
        subtopics: [
          {
            title: "보안",
            context: "양자 공격 대비 전략과 안전한 암호 기술을 비교합니다.",
            insights: ["암호 전환이 필요"]
          },
          {
            title: "신소재·화학",
            context: "전자 구조 계산과 시뮬레이션 가속 가능성을 다룹니다.",
            insights: ["양자-고전 하이브리드"]
          },
          {
            title: "금융·ML",
            context: "최적화와 샘플링을 가속하려는 연구를 소개합니다.",
            insights: ["QAOA가 대표 사례"]
          }
        ]
      }
    ]
  },
  "지속가능한 에너지 전환": {
    overview: "재생에너지와 효율 개선을 결합한 전환 전략입니다.",
    spotlight: "기술·제도·참여가 동시에 굴러갈 때 효과가 큽니다.",
    branches: [
      {
        title: "재생에너지",
        color: "#22c55e",
        summary: "주요 자원과 확산 전략",
        subtopics: [
          {
            title: "태양광·풍력",
            context: "간헐성과 출력 변동을 고려한 운영 전략을 다룹니다.",
            insights: ["예측 정확도가 핵심"]
          },
          {
            title: "대체 자원",
            context: "수소·해양·지열 등 장기 에너지 믹스를 정리합니다.",
            insights: ["지역 맞춤 전략"]
          },
          {
            title: "분산형 발전",
            context: "지역 단위 마이크로그리드 설계 요소를 요약합니다.",
            insights: ["EMS가 수요 최적화"]
          }
        ]
      },
      {
        title: "저장 기술",
        color: "#0ea5e9",
        summary: "에너지 저장 전략",
        subtopics: [
          {
            title: "배터리 관리",
            context: "열화 메커니즘과 수명 연장 전략을 간단히 설명합니다.",
            insights: ["충방전 관리가 핵심"]
          },
          {
            title: "수소 저장",
            context: "생산·저장·활용을 엮어 장주기 저장을 구현합니다.",
            insights: ["P2G2P 효율 최적화"]
          },
          {
            title: "계통 서비스",
            context: "주파수 조정과 피크 저감 등 ESS 활용을 요약합니다.",
            insights: ["수익원 다각화"]
          }
        ]
      },
      {
        title: "정책과 시장",
        color: "#f97316",
        summary: "정책·시장 설계",
        subtopics: [
          {
            title: "탄소 가격",
            context: "세금과 배출권이 투자 결정을 바꾸는 방식을 다룹니다.",
            insights: ["가격 신호가 투자 촉진"]
          },
          {
            title: "시장 구조",
            context: "도매·소매 개편과 수요자원 참여 확대 방안을 설명합니다.",
            insights: ["실시간 정산 도입"]
          },
          {
            title: "국제 협력",
            context: "전력 거래와 기술 표준화의 영향을 요약합니다.",
            insights: ["공통 기준이 확산 촉진"]
          }
        ]
      },
      {
        title: "도시와 시민",
        color: "#a855f7",
        summary: "시민 참여와 생활 혁신",
        subtopics: [
          {
            title: "스마트 그리드",
            context: "디지털 계량으로 수요를 능동 조정하는 방법을 다룹니다.",
            insights: ["실시간 요금제"]
          },
          {
            title: "커뮤니티 에너지",
            context: "지역 협동조합이 추진하는 분산형 프로젝트를 소개합니다.",
            insights: ["수익을 지역과 공유"]
          },
          {
            title: "에너지 복지",
            context: "취약계층 지원과 문해력 향상 정책을 정리합니다.",
            insights: ["교육이 행동 변화 촉진"]
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

function hexToRgb(hex) {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return { r: 59, g: 130, b: 246 };
  }

  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function getReadableTextColors(background) {
  const { r, g, b } = hexToRgb(background);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.62) {
    return {
      primary: "#0f172a",
      secondary: "rgba(15, 23, 42, 0.72)"
    };
  }

  return {
    primary: "#f8fafc",
    secondary: "rgba(241, 245, 249, 0.82)"
  };
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

function getNodeEdgePoint(node, angle) {
  if (node.shape === "rounded-rect") {
    const halfWidth = node.shapeWidth / 2;
    const halfHeight = node.shapeHeight / 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const tx = dx === 0 ? Infinity : halfWidth / Math.abs(dx);
    const ty = dy === 0 ? Infinity : halfHeight / Math.abs(dy);
    const t = Math.min(tx, ty);

    return {
      x: node.x + dx * t,
      y: node.y + dy * t
    };
  }

  const radius = node.visualRadius ?? node.radius;
  return {
    x: node.x + Math.cos(angle) * radius,
    y: node.y + Math.sin(angle) * radius
  };
}

function createLinkPath(source, target) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  const sourcePoint = getNodeEdgePoint(source, angle);
  const targetPoint = getNodeEdgePoint(target, angle + Math.PI);

  const midX = (sourcePoint.x + targetPoint.x) / 2;
  const midY = (sourcePoint.y + targetPoint.y) / 2;
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const curveStrength = Math.min(0.35, 60 / distance);
  const normalX = -dy * curveStrength;
  const normalY = dx * curveStrength;
  const controlX = midX + normalX;
  const controlY = midY + normalY;

  return `M ${sourcePoint.x} ${sourcePoint.y} Q ${controlX} ${controlY} ${targetPoint.x} ${targetPoint.y}`;
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
      const createPositions = (lines, start, lineHeight) =>
        alignCenter
          ? lines.map((_, index) => start + lineHeight * (index + 0.5))
          : lines.map((_, index) => start + index * lineHeight);
      const labelPositions = createPositions(labelLines, labelStartY, labelLineHeight);
      const contextPositions = createPositions(contextLines, contextStartY, contextLineHeight);

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

      const hasLabel = labelLines.length > 0;
      const hasContext = contextLines.length > 0;
      const blockTop = alignCenter
        ? labelStartY
        : hasLabel
        ? labelStartY
        : hasContext
        ? contextStartY
        : 0;
      const blockBottom = blockTop + blockHeight;

      const paddingX = node.type === "root" ? 28 : node.type === "branch" ? 24 : 20;
      const paddingY = node.type === "root" ? 24 : node.type === "branch" ? 18 : 16;
      const baseWidth = Math.max(textWidth + paddingX * 2, node.radius * 2);
      const baseHeight = Math.max(blockHeight + paddingY * 2, node.radius * 2);
      const aspectRatio = baseHeight === 0 ? 1 : baseWidth / baseHeight;

      let shapeType;
      if (node.shape === "circle") {
        shapeType = "circle";
      } else if (node.shape === "rounded-rect") {
        shapeType = "rounded-rect";
      } else {
        shapeType = aspectRatio > 1.2 ? "rounded-rect" : "circle";
      }

      let shapeWidth = shapeType === "circle" ? Math.max(baseWidth, baseHeight) : baseWidth;
      let shapeHeight = shapeType === "circle" ? Math.max(baseWidth, baseHeight) : baseHeight;
      const visualRadius = shapeType === "circle" ? shapeWidth / 2 : Math.max(shapeWidth, shapeHeight) / 2;
      const cornerRadius = shapeType === "rounded-rect" ? Math.min(26, shapeHeight / 2.2) : 0;

      const bounds =
        shapeType === "circle"
          ? {
              left: node.x - visualRadius,
              right: node.x + visualRadius,
              top: node.y - visualRadius,
              bottom: node.y + visualRadius
            }
          : {
              left: node.x - shapeWidth / 2,
              right: node.x + shapeWidth / 2,
              top: node.y - shapeHeight / 2,
              bottom: node.y + shapeHeight / 2
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
          textWidth,
          blockTop,
          blockBottom
        },
        shape: shapeType,
        shapeWidth,
        shapeHeight,
        visualRadius,
        cornerRadius,
        padding: { x: paddingX, y: paddingY },
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
        const shapeOpacity = isDimmed ? (node.opacity ?? 0.5) : node.opacity ?? 0.92;
        const { primary: labelColor, secondary: contextColor } = getReadableTextColors(
          node.color
        );
        const isCircle = node.shape === "circle";
        const activeInset = isActive ? 4 : 0;

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
            {isCircle ? (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.visualRadius + activeInset}
                fill={node.color}
                stroke="#ffffff"
                strokeWidth={isActive ? 3.2 : 2.4}
                opacity={shapeOpacity}
                style={{
                  transition: "all 0.3s ease",
                  filter: isActive
                    ? `drop-shadow(0 18px 38px ${hexToRgba(node.color, 0.45)})`
                    : "drop-shadow(0 8px 18px rgba(15, 23, 42, 0.18))"
                }}
              />
            ) : (
              <rect
                x={node.x - node.shapeWidth / 2 - activeInset}
                y={node.y - node.shapeHeight / 2 - activeInset}
                width={node.shapeWidth + activeInset * 2}
                height={node.shapeHeight + activeInset * 2}
                rx={Math.min(node.cornerRadius + activeInset, (node.shapeHeight + activeInset * 2) / 2)}
                ry={Math.min(node.cornerRadius + activeInset, (node.shapeHeight + activeInset * 2) / 2)}
                fill={node.color}
                stroke="#ffffff"
                strokeWidth={isActive ? 3 : 2.2}
                opacity={shapeOpacity}
                style={{
                  transition: "all 0.3s ease",
                  filter: isActive
                    ? `drop-shadow(0 20px 44px ${hexToRgba(node.color, 0.38)})`
                    : "drop-shadow(0 10px 24px rgba(15, 23, 42, 0.16))"
                }}
              />
            )}

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
                  dominantBaseline="middle"
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
                  dominantBaseline="middle"
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
      shape: "circle",
      text: {
        anchor: "middle",
        offsetX: 0,
        offsetY: 0,
        baseline: "middle",
        maxChars: 16,
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
        shape: "auto",
        text: {
          anchor: "middle",
          offsetX: 0,
          offsetY: 0,
          baseline: "middle",
          maxChars: 16,
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
          shape: "auto",
          text: {
            anchor: "middle",
            offsetX: 0,
            offsetY: 0,
            baseline: "middle",
            maxChars: 18,
            maxLines: 3
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
