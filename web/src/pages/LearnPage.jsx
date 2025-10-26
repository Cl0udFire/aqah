import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/Topbar";

const mockMindMaps = {
  "인공지능 일반": {
    overview: "데이터 준비부터 모델 학습까지의 핵심 흐름을 한 장에서 정리합니다.",
    spotlight: "전처리-분석-설계-학습 순환을 이해하면 실무 전반을 연결할 수 있습니다.",
    branches: [
      {
        title: "데이터 전처리",
        color: "#2563eb",
        summary: "데이터 품질을 정비하는 단계",
        subtopics: [
          {
            title: "원천 수집",
            context: "파일·API에서 데이터를 모읍니다.",
            insights: ["형식과 인코딩 점검"]
          },
          {
            title: "Pandas 기본",
            context: "행·열 구조의 DataFrame을 다룹니다.",
            insights: ["row/column 개념"]
          },
          {
            title: "정제 기법",
            context: "결측치·이상치를 처리하고 스케일링합니다.",
            insights: ["전처리 파이프라인"]
          }
        ]
      },
      {
        title: "데이터 분석",
        color: "#14b8a6",
        summary: "패턴과 인사이트를 찾는 단계",
        subtopics: [
          {
            title: "EDA 절차",
            context: "질문을 세우고 분포를 시각화합니다.",
            insights: ["질문-그래프-해석"]
          },
          {
            title: "통계 기초",
            context: "평균·분산과 검정 논리를 이해합니다.",
            insights: ["샘플 vs 모집단"]
          },
          {
            title: "시각화 도구",
            context: "Matplotlib·Seaborn으로 패턴을 드러냅니다.",
            insights: ["그래프 선택 기준"]
          }
        ]
      },
      {
        title: "인공지능 모델 설계",
        color: "#f97316",
        summary: "문제를 구조화하고 모델을 고르는 단계",
        subtopics: [
          {
            title: "문제 정의",
            context: "업무 목표와 평가 지표를 확정합니다.",
            insights: ["분류·회귀 구분"]
          },
          {
            title: "피처 설계",
            context: "도메인 지식을 반영한 변수를 만듭니다.",
            insights: ["파생 피처 기획"]
          },
          {
            title: "모델 선택",
            context: "여러 기법을 비교해 구조를 정합니다.",
            insights: ["베이스라인 확보"]
          }
        ]
      },
      {
        title: "인공지능 학습",
        color: "#6366f1",
        summary: "훈련과 검증을 반복하는 단계",
        subtopics: [
          {
            title: "학습 파이프라인",
            context: "데이터 분할과 배치를 구성합니다.",
            insights: ["재현성 관리"]
          },
          {
            title: "성능 검증",
            context: "검증·테스트로 과적합을 점검합니다.",
            insights: ["교차검증 활용"]
          },
          {
            title: "배포 준비",
            context: "모델을 저장하고 모니터링을 설계합니다.",
            insights: ["MLOps 연계"]
          }
        ]
      }
    ]
  }
};

const availableTopics = Object.keys(mockMindMaps);

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

function MindmapCanvas({
  width,
  height,
  nodes,
  links,
  activeNodeId,
  onNodeSelect,
  onNodePositionChange
}) {
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
  const suppressedClickRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  useEffect(() => {
    baseViewBoxRef.current = baseViewBox;
    if (pointerRef.current?.mode === "drag" || pointerRef.current?.mode === "pan") {
      return;
    }
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

      const point = getSvgPoint(event, viewBox);
      if (!point) {
        return;
      }

      const svg = svgRef.current;
      svg?.setPointerCapture(event.pointerId);
      pointerRef.current = {
        mode: "pan",
        pointerId: event.pointerId,
        lastPoint: point
      };
      setIsPanning(true);
    },
    [decoratedNodes.length, getSvgPoint, viewBox]
  );

  const handleNodePointerDown = useCallback(
    (node, event) => {
      if (event.button !== 0 && event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      suppressedClickRef.current = false;

      const point = getSvgPoint(event, viewBox);
      if (!point) {
        return;
      }

      const svg = svgRef.current;
      svg?.setPointerCapture(event.pointerId);
      pointerRef.current = {
        mode: "drag",
        pointerId: event.pointerId,
        startPoint: point,
        lastPoint: point,
        nodeStart: { x: node.x, y: node.y },
        nodeId: node.id,
        hasMoved: false
      };
      setDraggingNodeId(node.id);
      setIsPanning(false);
    },
    [getSvgPoint, viewBox]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const pointerState = pointerRef.current;
      if (!pointerState || pointerState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();

      if (pointerState.mode === "pan") {
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
        return;
      }

      if (pointerState.mode === "drag") {
        const point = getSvgPoint(event, viewBox);
        if (!point) {
          return;
        }

        const totalDeltaX = point.x - pointerState.startPoint.x;
        const totalDeltaY = point.y - pointerState.startPoint.y;

        pointerState.lastPoint = point;

        if (!pointerState.hasMoved) {
          const distanceSq = totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY;
          if (distanceSq > 16) {
            pointerState.hasMoved = true;
            suppressedClickRef.current = true;
          }
        }

        if (onNodePositionChange) {
          onNodePositionChange(pointerState.nodeId, {
            x: pointerState.nodeStart.x + totalDeltaX,
            y: pointerState.nodeStart.y + totalDeltaY
          });
        }
      }
    },
    [getSvgPoint, onNodePositionChange, viewBox]
  );

  const endInteraction = useCallback((event) => {
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
      if (pointerState.mode === "drag") {
        const nodeId = pointerState.nodeId;
        setDraggingNodeId((current) => (current === nodeId ? null : current));
        if (pointerState.hasMoved) {
          setTimeout(() => {
            suppressedClickRef.current = false;
          }, 0);
        } else {
          suppressedClickRef.current = false;
        }
      }
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
      onPointerUp={endInteraction}
      onPointerLeave={endInteraction}
      onPointerCancel={endInteraction}
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
            onClick={() => {
              if (suppressedClickRef.current) {
                suppressedClickRef.current = false;
                return;
              }
              onNodeSelect(node.id);
            }}
            role="button"
            tabIndex={0}
            style={{ cursor: draggingNodeId === node.id ? "grabbing" : "grab" }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onNodeSelect(node.id);
              }
            }}
            onPointerDown={(event) => handleNodePointerDown(node, event)}
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
  const topics = availableTopics;
  const [selectedTopic, setSelectedTopic] = useState(() => topics[0] ?? "");
  const [graphRef, graphSize] = useContainerSize();
  const [activeNodeId, setActiveNodeId] = useState("root");

  const selectedMindMap = selectedTopic ? mockMindMaps[selectedTopic] : undefined;

  useEffect(() => {
    if (selectedMindMap) {
      setActiveNodeId("root");
    } else {
      setActiveNodeId("");
    }
  }, [selectedMindMap, selectedTopic]);

  const layoutWidth = Math.max(720, graphSize.width || 0);
  const layoutHeight = Math.max(640, graphSize.height || 0);

  const baseGraph = useMemo(() => {
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

  const { nodes: computedNodes, links, detailMap } = baseGraph;
  const [interactiveNodes, setInteractiveNodes] = useState(computedNodes);

  useEffect(() => {
    setInteractiveNodes(computedNodes);
  }, [computedNodes]);

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

  const handleNodePositionChange = useCallback((nodeId, position) => {
    setInteractiveNodes((prev) => {
      let didUpdate = false;
      const next = prev.map((node) => {
        if (node.id === nodeId) {
          didUpdate = true;
          return { ...node, ...position };
        }
        return node;
      });

      return didUpdate ? next : prev;
    });
  }, []);

  const graphNodes = interactiveNodes;

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
              disabled={!topics.length}
            >
              {topics.length ? (
                topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))
              ) : (
                <option value="">준비된 주제가 없습니다.</option>
              )}
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
                  {graphNodes.length ? (
                    <MindmapCanvas
                      width={layoutWidth}
                      height={layoutHeight}
                      nodes={graphNodes}
                      links={links}
                      activeNodeId={activeDetailId}
                      onNodeSelect={handleNodeClick}
                      onNodePositionChange={handleNodePositionChange}
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
