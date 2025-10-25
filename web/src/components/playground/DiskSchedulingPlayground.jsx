import { useEffect, useMemo, useState } from "react";

const DISK_ALGORITHMS = {
  fcfs: {
    name: "FCFS",
    description: "도착 순서대로 요청을 처리합니다. 구현이 가장 단순하지만 최적의 이동 거리를 보장하지는 않습니다.",
    generator: simulateFCFS,
  },
  sstf: {
    name: "SSTF",
    description: "현재 헤드 위치에서 가장 가까운 요청을 선택합니다. 기아 현상이 발생할 수 있으므로 주의가 필요합니다.",
    generator: simulateSSTF,
  },
  scan: {
    name: "SCAN",
    description: "엘리베이터 알고리즘이라고도 부르며 한쪽 끝까지 이동하면서 요청을 처리한 뒤 방향을 바꿉니다.",
    generator: simulateSCAN,
  },
};

const DIRECTION_OPTIONS = [
  { value: "up", label: "오름차순" },
  { value: "down", label: "내림차순" },
];

const svgWidth = 720;
const svgHeight = 180;
const margin = 32;

const DiskSchedulingPlayground = () => {
  const [algorithmKey, setAlgorithmKey] = useState("fcfs");
  const [direction, setDirection] = useState("up");
  const [maxTrack, setMaxTrack] = useState(199);
  const [head, setHead] = useState(53);
  const [requestInput, setRequestInput] = useState(
    "98, 183, 37, 122, 14, 124, 65, 67"
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const requests = useMemo(
    () => parseRequests(requestInput, maxTrack),
    [requestInput, maxTrack]
  );

  const algorithm = DISK_ALGORITHMS[algorithmKey];

  const simulation = useMemo(() => {
    return algorithm.generator({ requests, head, maxTrack, direction });
  }, [algorithm, requests, head, maxTrack, direction]);

  const { frames, path, servedOrder, totalDistance, averageSeek, legend } =
    simulation;

  const frame = frames[currentStep] ?? frames[frames.length - 1];
  const scale = (value) =>
    margin + ((svgWidth - margin * 2) * value) / Math.max(maxTrack, 1);
  const requestSet = useMemo(() => new Set(requests), [requests]);
  const servedSet = new Set(
    (frame?.path?.slice(1) ?? []).filter((track) => requestSet.has(track))
  );

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithmKey, requestInput, head, direction, maxTrack]);

  useEffect(() => {
    if (!isPlaying) return;
    if (frames.length <= 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [frames, isPlaying]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            디스크 스케줄링 시각화
          </h2>
          <p className="text-sm text-slate-600">{algorithm.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DISK_ALGORITHMS).map(([key, item]) => (
            <button
              key={key}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                key === algorithmKey
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => setAlgorithmKey(key)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,300px]">
        <div className="space-y-4">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="head-slider" className="font-medium text-slate-800">
                헤드 시작 위치
              </label>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>0</span>
                <span>{head}</span>
                <span>{maxTrack}</span>
              </div>
              <input
                id="head-slider"
                type="range"
                min={0}
                max={maxTrack}
                value={head}
                onChange={(event) => setHead(Number(event.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="track-slider" className="font-medium text-slate-800">
                트랙 범위
              </label>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>50</span>
                <span>{maxTrack}</span>
                <span>400</span>
              </div>
              <input
                id="track-slider"
                type="range"
                min={50}
                max={400}
                value={maxTrack}
                onChange={(event) =>
                  setMaxTrack(Math.max(Number(event.target.value), head))
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-800">요청 목록</label>
              <textarea
                value={requestInput}
                onChange={(event) => setRequestInput(event.target.value)}
                className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none"
                placeholder="쉼표로 구분된 트랙 번호를 입력하세요"
              />
              <p className="text-xs text-slate-500">
                {requests.length}개의 유효한 요청이 감지되었습니다. (0 ~ {maxTrack})
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-slate-800">이동 방향</span>
              <div className="flex gap-2">
                {DIRECTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      direction === option.value
                        ? "border-sky-400 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                    onClick={() => setDirection(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                SCAN 알고리즘에서만 사용됩니다. 다른 알고리즘에는 영향을 주지 않아요.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full"
              role="img"
              aria-label="디스크 스케줄링 경로"
            >
              <title>디스크 스케줄링 경로</title>
              <line
                x1={margin}
                x2={svgWidth - margin}
                y1={svgHeight / 2}
                y2={svgHeight / 2}
                stroke="#cbd5f5"
                strokeWidth={3}
                strokeLinecap="round"
              />

              {requests.map((track, index) => {
                const x = scale(track);
                const isVisited = servedSet.has(track);
                return (
                  <g key={`request-${track}-${index}`}>
                    <circle
                      cx={x}
                      cy={svgHeight / 2}
                      r={8}
                      fill={isVisited ? "#38bdf8" : "white"}
                      stroke={isVisited ? "#0ea5e9" : "#94a3b8"}
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={svgHeight / 2 - 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#475569"
                    >
                      {track}
                    </text>
                  </g>
                );
              })}

              {frame?.path.length > 1 && (
                <polyline
                  points={frame.path
                    .map((track) => `${scale(track)},${svgHeight / 2}`)
                    .join(" ")}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {typeof frame?.position === "number" && (
                <g>
                  <circle
                    cx={scale(frame.position)}
                    cy={svgHeight / 2}
                    r={14}
                    fill="#fb7185"
                    stroke="#be123c"
                    strokeWidth={3}
                  />
                  <text
                    x={scale(frame.position)}
                    y={svgHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                  >
                    H
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">현재 상태</h3>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>스텝</dt>
                <dd>
                  {Math.min(currentStep + 1, frames.length)} / {frames.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>현재 위치</dt>
                <dd>{frame?.position ?? head}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>총 이동 거리</dt>
                <dd>{frame?.distanceTravelled ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>다음 목표</dt>
                <dd>{frame?.nextTarget ?? "없음"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <h3 className="text-sm font-semibold text-slate-800">전체 통계</h3>
            <dl className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <dt>요청 순서</dt>
                <dd className="text-right font-medium text-slate-700">
                  {servedOrder.length > 0
                    ? servedOrder.join(" → ")
                    : "요청 없음"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>총 이동 거리</dt>
                <dd>{totalDistance}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>평균 탐색 거리</dt>
                <dd>{averageSeek.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
            >
              이전 단계
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold text-white transition ${
                isPlaying ? "bg-rose-500 hover:bg-rose-600" : "bg-sky-500 hover:bg-sky-600"
              }`}
              onClick={() => setIsPlaying((prev) => !prev)}
              disabled={frames.length <= 1}
            >
              {isPlaying ? "일시정지" : "자동 재생"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, frames.length - 1))
              }
              disabled={currentStep >= frames.length - 1}
            >
              다음 단계
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-medium text-slate-800">색상 가이드</p>
            <ul className="mt-2 space-y-1">
              {legend.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-8 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

function parseRequests(input, maxTrack) {
  return input
    .split(/[,\s]+/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= maxTrack);
}

function simulateFCFS({ requests, head }) {
  const path = [head, ...requests];
  return enrichSimulation(path, { requests });
}

function simulateSSTF({ requests, head }) {
  const remaining = [...requests];
  const order = [head];

  let current = head;
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let bestDistance = Infinity;

    remaining.forEach((request, index) => {
      const distance = Math.abs(request - current);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearestIndex = index;
      }
    });

    current = remaining[nearestIndex];
    order.push(current);
    remaining.splice(nearestIndex, 1);
  }

  return enrichSimulation(order, { requests });
}

function simulateSCAN({ requests, head, maxTrack, direction }) {
  const sorted = [...requests].sort((a, b) => a - b);
  const lower = sorted.filter((track) => track < head);
  const higher = sorted.filter((track) => track >= head);

  let order = [head];

  if (direction === "up") {
    order = order.concat(higher, lower.reverse());
  } else {
    order = order.concat(lower.reverse(), higher);
  }

  if (order.length === 1) {
    order.push(head);
  }

  return enrichSimulation(order, {
    boundary: direction === "up" ? maxTrack : 0,
    requests,
  });
}

function enrichSimulation(path, { boundary = null, requests = [] } = {}) {
  const cleanedPath = [...path];
  if (boundary !== null) {
    const last = cleanedPath[cleanedPath.length - 1];
    if (last !== boundary) {
      cleanedPath.push(boundary);
    }
  }

  const frames = [];
  let totalDistance = 0;
  const requestSet = new Set(requests);

  for (let index = 0; index < cleanedPath.length; index += 1) {
    const position = cleanedPath[index];
    const previous = index > 0 ? cleanedPath[index - 1] : position;
    if (index > 0) {
      totalDistance += Math.abs(position - previous);
    }

    frames.push({
      position,
      path: cleanedPath.slice(0, index + 1),
      distanceTravelled: totalDistance,
      nextTarget: cleanedPath[index + 1] ?? null,
    });
  }

  const averageSeek = cleanedPath.length > 1
    ? totalDistance / (cleanedPath.length - 1)
    : 0;

  const servedOrder = cleanedPath
    .slice(1)
    .filter((track) => requestSet.has(track));

  const legend = [
    { label: "요청 (미방문)", color: "#cbd5f5" },
    { label: "요청 (방문)", color: "#38bdf8" },
    { label: "헤드 이동 경로", color: "#fb7185" },
  ];

  return {
    frames,
    path: cleanedPath,
    servedOrder,
    totalDistance,
    averageSeek,
    legend,
  };
}

export default DiskSchedulingPlayground;
