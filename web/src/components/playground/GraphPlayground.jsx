import { useEffect, useMemo, useState } from "react";

const GRAPH_NODES = [
  { id: "A", label: "A", x: 8, y: 20 },
  { id: "B", label: "B", x: 45, y: 10 },
  { id: "C", label: "C", x: 82, y: 26 },
  { id: "D", label: "D", x: 72, y: 78 },
  { id: "E", label: "E", x: 28, y: 82 },
  { id: "F", label: "F", x: 10, y: 50 },
];

const GRAPH_EDGES = [
  { from: "A", to: "B", weight: 3 },
  { from: "A", to: "F", weight: 2 },
  { from: "B", to: "C", weight: 4 },
  { from: "B", to: "F", weight: 6 },
  { from: "B", to: "E", weight: 5 },
  { from: "C", to: "D", weight: 3 },
  { from: "C", to: "E", weight: 2 },
  { from: "D", to: "E", weight: 2 },
  { from: "E", to: "F", weight: 4 },
];

const ALGORITHMS = [
  { id: "bfs", label: "너비 우선 탐색 (BFS)" },
  { id: "dfs", label: "깊이 우선 탐색 (DFS)" },
  { id: "dijkstra", label: "다익스트라 최단 경로" },
  { id: "kruskal", label: "크루스칼 최소 신장 트리" },
];

const EDGE_ID = (a, b) => [a, b].sort().join("-");

const buildAdjacency = () => {
  const adjacency = new Map();
  GRAPH_NODES.forEach((node) => adjacency.set(node.id, []));
  GRAPH_EDGES.forEach(({ from, to, weight }) => {
    adjacency.get(from).push({ node: to, weight });
    adjacency.get(to).push({ node: from, weight });
  });
  return adjacency;
};

const ADJACENCY = buildAdjacency();

const runBfs = (start, goal) => {
  const visited = new Set([start]);
  const queue = [start];
  const parents = {};
  const steps = [
    {
      title: "초기 상태",
      description: `${start}을(를) 시작점으로 큐에 넣습니다.`,
      current: null,
      visited: Array.from(visited),
      frontier: Array.from(queue),
      highlightedEdges: [],
      distances: {},
    },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    const newlyDiscovered = [];

    ADJACENCY.get(current)
      .sort((a, b) => a.node.localeCompare(b.node))
      .forEach(({ node }) => {
        if (!visited.has(node)) {
          visited.add(node);
          parents[node] = current;
          newlyDiscovered.push(node);
          queue.push(node);
        }
      });

    steps.push({
      title: `${current} 탐색`,
      description:
        newlyDiscovered.length > 0
          ? `${newlyDiscovered.join(", ")}을(를) 방문하고 큐에 추가했습니다.`
          : "더 이상 방문할 인접 노드가 없습니다.",
      current,
      visited: Array.from(visited),
      frontier: Array.from(queue),
      highlightedEdges: newlyDiscovered.map((node) => EDGE_ID(current, node)),
      distances: {},
    });

    if (current === goal) {
      break;
    }
  }

  const path = reconstructPath(goal, parents, start);

  if (path.length > 0) {
    steps.push({
      title: "경로 완성",
      description: `${start}에서 ${goal}까지의 경로: ${path.join(" → ")}`,
      current: goal,
      visited: Array.from(visited),
      frontier: [],
      highlightedEdges: buildEdgeChain(path),
      distances: {},
      path,
    });
  }

  return steps;
};

const runDfs = (start, goal) => {
  const visited = new Set();
  const stack = [start];
  const parents = {};
  const steps = [
    {
      title: "초기 상태",
      description: `${start}을(를) 시작점으로 스택에 넣습니다.`,
      current: null,
      visited: [],
      frontier: Array.from(stack),
      highlightedEdges: [],
      distances: {},
    },
  ];

  while (stack.length > 0) {
    const current = stack.pop();

    if (visited.has(current)) {
      steps.push({
        title: `${current} 재방문`,
        description: `${current}은(는) 이미 방문했습니다.`,
        current,
        visited: Array.from(visited),
        frontier: Array.from(stack),
        highlightedEdges: [],
        distances: {},
      });
      continue;
    }

    visited.add(current);
    const neighbors = ADJACENCY.get(current)
      .slice()
      .sort((a, b) => b.node.localeCompare(a.node));
    const pushed = [];

    neighbors.forEach(({ node }) => {
      if (!visited.has(node)) {
        parents[node] = current;
        stack.push(node);
        pushed.push(node);
      }
    });

    steps.push({
      title: `${current} 탐색`,
      description:
        pushed.length > 0
          ? `${pushed.join(", ")}을(를) 스택에 넣고 깊이 탐색합니다.`
          : "인접한 미방문 노드가 없습니다.",
      current,
      visited: Array.from(visited),
      frontier: Array.from(stack),
      highlightedEdges: pushed.map((node) => EDGE_ID(current, node)),
      distances: {},
    });

    if (current === goal) {
      break;
    }
  }

  const path = reconstructPath(goal, parents, start);

  if (path.length > 0) {
    steps.push({
      title: "경로 완성",
      description: `${start}에서 ${goal}까지의 경로: ${path.join(" → ")}`,
      current: goal,
      visited: Array.from(visited),
      frontier: [],
      highlightedEdges: buildEdgeChain(path),
      distances: {},
      path,
    });
  }

  return steps;
};

const runDijkstra = (start, goal) => {
  const distances = Object.fromEntries(
    GRAPH_NODES.map((node) => [node.id, Infinity])
  );
  distances[start] = 0;
  const visited = new Set();
  const queue = [start];
  const parents = {};
  const steps = [
    {
      title: "초기 상태",
      description: `${start}을(를) 시작점으로 설정하고 거리 0을 부여합니다.`,
      current: null,
      visited: [],
      frontier: Array.from(queue),
      highlightedEdges: [],
      distances: { ...distances },
    },
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift();

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const relaxations = [];

    ADJACENCY.get(current).forEach(({ node, weight }) => {
      const alt = distances[current] + weight;
      if (alt < distances[node]) {
        distances[node] = alt;
        parents[node] = current;
        queue.push(node);
        relaxations.push({ node, weight });
      }
    });

    steps.push({
      title: `${current} 확정`,
      description:
        relaxations.length > 0
          ? `${relaxations
              .map(({ node, weight }) => `${node}까지 ${weight} 가중치로 갱신`)
              .join(", ")}`
          : "더 짧은 경로가 없어 갱신하지 않았습니다.",
      current,
      visited: Array.from(visited),
      frontier: Array.from(queue),
      highlightedEdges: relaxations.map(({ node }) => EDGE_ID(current, node)),
      distances: { ...distances },
    });

    if (current === goal) {
      break;
    }
  }

  const path = reconstructPath(goal, parents, start);

  if (path.length > 0) {
    steps.push({
      title: "최단 경로",
      description: `${start}에서 ${goal}까지의 최단 경로는 ${path.join(" → ")}, 거리 ${distances[goal]}입니다.`,
      current: goal,
      visited: Array.from(visited),
      frontier: [],
      highlightedEdges: buildEdgeChain(path),
      distances: { ...distances },
      path,
    });
  }

  return steps;
};

const runKruskal = () => {
  const sortedEdges = GRAPH_EDGES.slice().sort((a, b) => a.weight - b.weight);
  const parent = Object.fromEntries(GRAPH_NODES.map((node) => [node.id, node.id]));
  const rank = Object.fromEntries(GRAPH_NODES.map((node) => [node.id, 0]));

  const find = (node) => {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  };

  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);

    if (rootA === rootB) {
      return false;
    }

    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA] += 1;
    }

    return true;
  };

  const steps = [
    {
      title: "초기 상태",
      description:
        "모든 정점을 서로 다른 집합으로 두고, 간선을 가중치가 낮은 순서로 정렬합니다.",
      current: null,
      visited: [],
      frontier: [],
      highlightedEdges: [],
      distances: {},
    },
  ];

  const mstEdges = [];
  const mstNodes = new Set();
  let totalWeight = 0;

  sortedEdges.forEach(({ from, to, weight }) => {
    const rootA = find(from);
    const rootB = find(to);
    const createsCycle = rootA === rootB;

    steps.push({
      title: `간선 ${from}-${to} (${weight}) 검사`,
      description: createsCycle
        ? `${from}과(와) ${to}는 이미 같은 집합이므로 사이클을 만들게 되어 간선을 선택하지 않습니다.`
        : `${from}과(와) ${to}가 서로 다른 집합이므로 간선을 선택하고 집합을 합칩니다.`,
      current: null,
      visited: Array.from(mstNodes),
      frontier: [],
      highlightedEdges: [
        ...mstEdges.map((edge) => EDGE_ID(edge.from, edge.to)),
        EDGE_ID(from, to),
      ],
      distances: {},
    });

    if (!createsCycle) {
      union(rootA, rootB);
      mstEdges.push({ from, to, weight });
      mstNodes.add(from);
      mstNodes.add(to);
      totalWeight += weight;

      steps.push({
        title: `간선 ${from}-${to} 추가`,
        description: `간선 ${from}-${to}를 최소 신장 트리에 포함합니다. 현재 누적 가중치는 ${totalWeight}입니다.`,
        current: null,
        visited: Array.from(mstNodes),
        frontier: [],
        highlightedEdges: mstEdges.map((edge) => EDGE_ID(edge.from, edge.to)),
        distances: {},
        path: Array.from(mstNodes),
      });
    }
  });

  if (mstEdges.length === GRAPH_NODES.length - 1) {
    steps.push({
      title: "최소 신장 트리 완성",
      description: `선택된 간선: ${mstEdges
        .map(({ from, to, weight }) => `${from}-${to}(${weight})`)
        .join(", ")}. 총 가중치는 ${totalWeight}입니다.`,
      current: null,
      visited: Array.from(mstNodes),
      frontier: [],
      highlightedEdges: mstEdges.map((edge) => EDGE_ID(edge.from, edge.to)),
      distances: {},
      path: Array.from(mstNodes),
    });
  }

  return steps;
};

const reconstructPath = (goal, parents, start) => {
  if (goal !== start && !parents[goal]) {
    return [];
  }

  const path = [goal];
  let current = goal;

  while (current !== start) {
    current = parents[current];
    if (!current) {
      return [];
    }
    path.push(current);
  }

  return path.reverse();
};

const buildEdgeChain = (path) =>
  path.slice(1).map((node, index) => EDGE_ID(path[index], node));

const runAlgorithm = (algorithm, start, goal) => {
  switch (algorithm) {
    case "bfs":
      return runBfs(start, goal);
    case "dfs":
      return runDfs(start, goal);
    case "dijkstra":
      return runDijkstra(start, goal);
    case "kruskal":
      return runKruskal();
    default:
      return [];
  }
};

const GraphPlayground = () => {
  const [algorithm, setAlgorithm] = useState("bfs");
  const [startNode, setStartNode] = useState("A");
  const [targetNode, setTargetNode] = useState("D");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(
    () => runAlgorithm(algorithm, startNode, targetNode),
    [algorithm, startNode, targetNode]
  );

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [algorithm, startNode, targetNode]);

  const activeStep = steps[stepIndex] ?? steps[steps.length - 1];
  const highlightedEdges = new Set(activeStep?.highlightedEdges ?? []);
  const visitedSet = new Set(activeStep?.visited ?? []);
  const frontierSet = new Set(activeStep?.frontier ?? []);
  const pathNodes = new Set(activeStep?.path ?? []);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (steps.length <= 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleStepChange = (value) => {
    setIsPlaying(false);
    setStepIndex(value);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full max-w-xs space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">그래프 탐색 실험실</h2>
            <p className="mt-2 text-sm text-slate-600">
              동일한 그래프에서 BFS, DFS, 다익스트라, 크루스칼 알고리즘이 어떻게 탐색하거나 최소 신장 트리를 찾는지 비교해 보세요.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              알고리즘
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value)}
            >
              {ALGORITHMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                시작 노드
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={startNode}
                disabled={algorithm === "kruskal"}
                onChange={(event) => setStartNode(event.target.value)}
              >
                {GRAPH_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                목표 노드
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={targetNode}
                disabled={algorithm === "kruskal"}
                onChange={(event) => setTargetNode(event.target.value)}
              >
                {GRAPH_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {algorithm === "kruskal" && (
            <p className="rounded-lg border border-dashed border-sky-200 bg-blue-50 px-3 py-2 text-xs text-sky-700">
              크루스칼 알고리즘은 전체 그래프에서 최소 신장 트리를 구성하므로 시작/목표 노드 선택은 사용되지 않습니다.
            </p>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">단계 제어</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition ${
                  isPlaying ? "bg-rose-500 hover:bg-rose-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={() => setIsPlaying((prev) => !prev)}
                disabled={steps.length <= 1}
              >
                {isPlaying ? "일시정지" : "자동 재생"}
              </button>
              <input
                type="range"
                min={0}
                max={Math.max(steps.length - 1, 0)}
                value={stepIndex}
                onChange={(event) => handleStepChange(Number(event.target.value))}
                className="w-full accent-sky-500"
              />
              <span className="whitespace-nowrap font-semibold text-slate-700">
                {stepIndex + 1} / {steps.length}
              </span>
            </div>
          </div>

          {activeStep?.distances && Object.keys(activeStep.distances).length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">거리 테이블</p>
              <ul className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1">
                {Object.entries(activeStep.distances).map(([node, distance]) => (
                  <li key={node}>
                    <span className="font-semibold text-slate-800">{node}</span>: {distance === Infinity ? "∞" : distance}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="flex-1 space-y-4">
          <GraphView
            nodes={GRAPH_NODES}
            edges={GRAPH_EDGES}
            highlightedEdges={highlightedEdges}
            visited={visitedSet}
            frontier={frontierSet}
            current={activeStep?.current ?? null}
            pathNodes={pathNodes}
          />

          {activeStep && (
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-900">{activeStep.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {activeStep.description}
              </p>
              <div className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-slate-800">방문한 노드</h4>
                  <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono">
                    {(activeStep.visited ?? []).join(", ") || "(없음)"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">프런티어</h4>
                  <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono">
                    {(activeStep.frontier ?? []).join(", ") || "(없음)"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">현재 노드</h4>
                  <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono">
                    {activeStep.current ?? "(없음)"}
                  </p>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};

const GraphView = ({ nodes, edges, highlightedEdges, visited, frontier, current, pathNodes }) => (
  <div className="relative h-[480px] w-full max-w-[480px] rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 flex justify-center items-center mx-auto">
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {edges.map((edge) => {
        const from = nodes.find((node) => node.id === edge.from);
        const to = nodes.find((node) => node.id === edge.to);
        const highlighted = highlightedEdges.has(EDGE_ID(edge.from, edge.to));
        return (
          <g key={EDGE_ID(edge.from, edge.to)}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={highlighted ? "#0ea5e9" : "#94a3b8"}
              strokeWidth={highlighted ? 0.9 : 0.6}
              strokeDasharray={highlighted ? "" : "3 2"}
              strokeLinecap="round"
            />
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 1}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize={3}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {nodes.map((node) => {
        const isVisited = visited.has(node.id);
        const isFrontier = frontier.has(node.id);
        const isCurrent = current === node.id;
        const isPath = pathNodes.has(node.id);
        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle
              r={4.5}
              fill={
                isCurrent
                  ? "#0ea5e9"
                  : isPath
                  ? "#22c55e"
                  : isVisited
                  ? "#2563eb"
                  : "white"
              }
              stroke={isFrontier ? "#f97316" : "#0f172a"}
              strokeWidth={isFrontier ? 1.4 : 0.9}
              className="transition-all duration-200"
            />
            <text
              y={1.5}
              textAnchor="middle"
              fontSize={3.5}
              className={isCurrent || isPath || isVisited ? "fill-white" : "fill-slate-700"}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  </div>
);

export default GraphPlayground;
