import { useEffect, useMemo, useState } from "react";

const cloneLevels = (levels) => levels.map((level) => level.map((node) => ({ ...node })));

const createQueueSteps = () => {
  const operations = [
    { type: "enqueue", value: 5 },
    { type: "enqueue", value: 2 },
    { type: "enqueue", value: 9 },
    { type: "dequeue" },
    { type: "enqueue", value: 4 },
    { type: "dequeue" },
  ];

  const buffer = [];
  let front = 0;
  let rear = 0;
  const steps = [
    {
      title: "초기 상태",
      description: "비어 있는 큐를 준비하고 front, rear 포인터를 0으로 설정합니다.",
      state: { storage: [], front, rear },
    },
  ];

  operations.forEach((operation) => {
    if (operation.type === "enqueue") {
      buffer[rear] = operation.value;
      rear += 1;
      steps.push({
        title: `enqueue(${operation.value})`,
        description: `${operation.value}을(를) rear 위치에 삽입하고 rear를 한 칸 이동합니다.`,
        state: { storage: buffer.slice(), front, rear },
      });
    } else {
      const removed = front < rear ? buffer[front] : null;
      if (front < rear) {
        front += 1;
      }
      steps.push({
        title: "dequeue()",
        description:
          removed !== null
            ? `${removed}을(를) front 위치에서 꺼내고 front를 한 칸 이동합니다.`
            : "큐가 비어 있어 꺼낼 값이 없습니다.",
        state: { storage: buffer.slice(), front, rear },
      });
    }
  });

  return steps;
};

const createStackSteps = () => {
  const operations = [
    { type: "push", value: 3 },
    { type: "push", value: 7 },
    { type: "push", value: 1 },
    { type: "pop" },
    { type: "push", value: 9 },
    { type: "pop" },
  ];

  const stack = [];
  const steps = [
    {
      title: "초기 상태",
      description: "비어 있는 스택을 준비합니다.",
      state: { items: [] },
    },
  ];

  operations.forEach((operation) => {
    if (operation.type === "push") {
      stack.push(operation.value);
      steps.push({
        title: `push(${operation.value})`,
        description: `${operation.value}을(를) 스택의 맨 위에 추가합니다.`,
        state: { items: stack.slice() },
      });
    } else {
      const removed = stack.pop();
      steps.push({
        title: "pop()",
        description:
          removed !== undefined
            ? `${removed}을(를) 스택의 맨 위에서 꺼냅니다.`
            : "스택이 비어 있어 꺼낼 값이 없습니다.",
        state: { items: stack.slice() },
      });
    }
  });

  return steps;
};

const insertBst = (root, value) => {
  const node = { value, left: null, right: null };
  if (!root) {
    return node;
  }

  if (value < root.value) {
    root.left = insertBst(root.left, value);
  } else {
    root.right = insertBst(root.right, value);
  }

  return root;
};

const treeToLevels = (root) => {
  const levels = [];
  const queue = root ? [{ node: root, depth: 0 }] : [];

  while (queue.length > 0) {
    const { node, depth } = queue.shift();
    if (!levels[depth]) {
      levels[depth] = [];
    }
    levels[depth].push({
      value: node.value,
      hasLeft: Boolean(node.left),
      hasRight: Boolean(node.right),
    });

    if (node.left) {
      queue.push({ node: node.left, depth: depth + 1 });
    }
    if (node.right) {
      queue.push({ node: node.right, depth: depth + 1 });
    }
  }

  return levels;
};

const createTreeSteps = () => {
  const values = [8, 3, 10, 1, 6, 14, 4, 7, 13];
  let root = null;
  const steps = [
    {
      title: "빈 이진 검색 트리",
      description: "왼쪽은 더 작은 값, 오른쪽은 더 큰 값을 배치하는 규칙을 기억하세요.",
      state: { levels: [] },
    },
  ];

  values.forEach((value) => {
    root = insertBst(root, value);
    steps.push({
      title: `${value} 삽입`,
      description: `${value}보다 작은 값은 왼쪽, 큰 값은 오른쪽 자식에 배치합니다.`,
      state: { levels: treeToLevels(root) },
    });
  });

  const inorder = [];
  const traverse = (node) => {
    if (!node) {
      return;
    }
    traverse(node.left);
    inorder.push(node.value);
    traverse(node.right);
  };
  traverse(root);

  steps.push({
    title: "중위 순회",
    description: `중위 순회 결과는 ${inorder.join(", ")}로, 값이 정렬된 순서를 확인할 수 있습니다.`,
    state: { levels: treeToLevels(root), traversal: inorder },
  });

  return steps;
};

const createSegmentTreeSteps = () => {
  const array = [5, 8, 6, 3, 2, 7, 4, 6];
  const steps = [
    {
      title: "초기 배열",
      description: "구간 합을 빠르게 계산하기 위해 세그먼트 트리를 구성합니다.",
      state: { array: array.slice(), levels: [], highlighted: [], summary: null },
    },
  ];

  const levels = [];

  const build = (start, end, depth) => {
    const node = { start, end, value: 0, left: null, right: null };
    if (!levels[depth]) {
      levels[depth] = [];
    }

    if (start === end) {
      node.value = array[start];
      levels[depth].push(node);
      steps.push({
        title: `리프 노드 [${start}, ${end}]`,
        description: `단일 원소 ${array[start]}을(를) 그대로 저장합니다.`,
        state: { array: array.slice(), levels: cloneLevels(levels), highlighted: [[start, end]], summary: null },
      });
      return node;
    }

    const mid = Math.floor((start + end) / 2);
    node.left = build(start, mid, depth + 1);
    node.right = build(mid + 1, end, depth + 1);
    node.value = node.left.value + node.right.value;
    levels[depth].push(node);
    steps.push({
      title: `내부 노드 [${start}, ${end}]`,
      description: `[${start}, ${mid}]의 합 ${node.left.value}과 [${mid + 1}, ${end}]의 합 ${node.right.value}을 더합니다.`,
      state: {
        array: array.slice(),
        levels: cloneLevels(levels),
        highlighted: [
          [node.left.start, node.left.end],
          [node.right.start, node.right.end],
          [start, end],
        ],
        summary: null,
      },
    });
    return node;
  };

  const root = build(0, array.length - 1, 0);

  const queryRange = [2, 5];
  const query = (node, left, right) => {
    if (!node || right < node.start || node.end < left) {
      steps.push({
        title: `구간 [${node?.start ?? "-"}, ${node?.end ?? "-"}] 무시`,
        description: "요청한 구간과 겹치지 않아 값을 사용하지 않습니다.",
        state: {
          array: array.slice(),
          levels: cloneLevels(levels),
          highlighted: node ? [[node.start, node.end]] : [],
          summary: { range: queryRange, result: null },
        },
      });
      return 0;
    }

    if (left <= node.start && node.end <= right) {
      steps.push({
        title: `구간 [${node.start}, ${node.end}] 포함`,
        description: `요청한 구간에 완전히 포함되어 ${node.value}을(를) 더합니다.`,
        state: {
          array: array.slice(),
          levels: cloneLevels(levels),
          highlighted: [[node.start, node.end]],
          summary: { range: queryRange, result: node.value },
        },
      });
      return node.value;
    }

    const leftSum = query(node.left, left, right);
    const rightSum = query(node.right, left, right);
    const subtotal = leftSum + rightSum;
    steps.push({
      title: `부분 합 결합`,
      description: `왼쪽 합 ${leftSum}과 오른쪽 합 ${rightSum}을 더해 ${subtotal}을 얻습니다.`,
      state: {
        array: array.slice(),
        levels: cloneLevels(levels),
        highlighted: [
          node.left ? [node.left.start, node.left.end] : [],
          node.right ? [node.right.start, node.right.end] : [],
        ].filter((range) => range.length > 0),
        summary: { range: queryRange, result: subtotal },
      },
    });
    return subtotal;
  };

  const finalSum = query(root, queryRange[0], queryRange[1]);
  steps.push({
    title: `구간 합 [${queryRange[0]}, ${queryRange[1]}]`,
    description: `요청한 구간의 합은 ${finalSum}입니다.`,
    state: {
      array: array.slice(),
      levels: cloneLevels(levels),
      highlighted: [[queryRange[0], queryRange[1]]],
      summary: { range: queryRange, result: finalSum },
    },
  });

  return steps;
};

const STRUCTURES = {
  queue: {
    label: "큐 (Queue)",
    description: "먼저 들어온 데이터가 먼저 나가는 FIFO 구조입니다.",
    steps: createQueueSteps(),
  },
  stack: {
    label: "스택 (Stack)",
    description: "마지막에 들어온 데이터가 먼저 나가는 LIFO 구조입니다.",
    steps: createStackSteps(),
  },
  tree: {
    label: "이진 검색 트리",
    description: "왼쪽 서브트리는 더 작은 값, 오른쪽 서브트리는 더 큰 값을 저장합니다.",
    steps: createTreeSteps(),
  },
  segment: {
    label: "세그먼트 트리",
    description: "배열 구간 합을 빠르게 계산하기 위한 완전 이진 트리입니다.",
    steps: createSegmentTreeSteps(),
  },
};

const DataStructuresPlayground = () => {
  const [structureId, setStructureId] = useState("queue");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const structure = STRUCTURES[structureId];

  const steps = useMemo(() => structure.steps, [structure]);

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [structureId]);

  const activeStep = steps[stepIndex];

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
            <h2 className="text-xl font-bold text-slate-900">자료구조 탐험</h2>
            <p className="mt-2 text-sm text-slate-600">
              큐, 스택, 트리, 세그먼트 트리가 데이터를 어떻게 저장하고 처리하는지 단계를 따라가며 살펴보세요.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              자료구조
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={structureId}
              onChange={(event) => setStructureId(event.target.value)}
            >
              {Object.entries(STRUCTURES).map(([id, item]) => (
                <option key={id} value={id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            {structure.description}
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">단계 제어</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition ${
                  isPlaying ? "bg-rose-500 hover:bg-rose-600" : "bg-sky-500 hover:bg-sky-600"
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
        </aside>

        <div className="flex-1 space-y-4">
          <StructureVisualizer structureId={structureId} state={activeStep?.state} />

          {activeStep && (
            <article className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-900">{activeStep.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{activeStep.description}</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};

const StructureVisualizer = ({ structureId, state }) => {
  if (!state) {
    return null;
  }

  switch (structureId) {
    case "queue":
      return <QueueVisualizer storage={state.storage} front={state.front} rear={state.rear} />;
    case "stack":
      return <StackVisualizer items={state.items} />;
    case "tree":
      return <TreeVisualizer levels={state.levels} traversal={state.traversal} />;
    case "segment":
      return (
        <SegmentTreeVisualizer
          array={state.array}
          levels={state.levels}
          highlighted={state.highlighted}
          summary={state.summary}
        />
      );
    default:
      return null;
  }
};

const QueueVisualizer = ({ storage, front, rear }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
    <h3 className="text-sm font-semibold text-slate-700">배열 기반 큐</h3>
    <div className="mt-4 grid gap-2 text-xs text-slate-600">
      <div className="grid grid-cols-[repeat(6,minmax(0,1fr))] gap-2">
        {Array.from({ length: Math.max(storage.length, rear) || 1 }).map((_, index) => (
          <div
            key={index}
            className={`flex h-16 items-center justify-center rounded-lg border text-sm font-semibold ${
              index >= front && index < rear ? "border-sky-400 bg-white text-sky-600" : "border-slate-200 bg-white"
            }`}
          >
            {storage[index] ?? ""}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
        <span>front → {front}</span>
        <span>rear → {rear}</span>
      </div>
    </div>
  </div>
);

const StackVisualizer = ({ items }) => (
  <div className="flex h-full min-h-[240px] items-end justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
    <div className="flex w-32 flex-col items-stretch gap-2">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-6 text-center text-xs text-slate-400">
          (empty)
        </div>
      )}
      {[...items].reverse().map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={`flex items-center justify-center rounded-lg border bg-white py-3 text-sm font-semibold ${
            index === 0 ? "border-sky-400 text-sky-600" : "border-slate-200 text-slate-600"
          }`}
        >
          {value}
        </div>
      ))}
    </div>
  </div>
);

const TreeVisualizer = ({ levels, traversal }) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
    <div className="space-y-3">
      {levels.length === 0 ? (
        <p className="text-center text-sm text-slate-400">(노드가 없습니다)</p>
      ) : (
        levels.map((level, index) => (
          <div key={index} className="flex items-center justify-center gap-4">
            {level.map((node, nodeIndex) => (
              <div
                key={nodeIndex}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700"
              >
                {node.value}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
    {traversal && (
      <p className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        중위 순회: {traversal.join(" → ")}
      </p>
    )}
  </div>
);

const SegmentTreeVisualizer = ({ array, levels, highlighted, summary }) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
    <div>
      <h3 className="text-sm font-semibold text-slate-700">기본 배열</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {array.map((value, index) => (
          <span key={index} className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {index}: {value}
          </span>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      {levels.map((level, index) => (
        <div key={index} className="flex flex-wrap items-center justify-center gap-3">
          {level.map((node, nodeIndex) => {
            const isHighlighted = highlighted?.some(
              ([start, end]) => start === node.start && end === node.end
            );
            return (
              <div
                key={nodeIndex}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  isHighlighted ? "border-sky-400 bg-white text-sky-600" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                [{node.start}, {node.end}] → {node.value}
              </div>
            );
          })}
        </div>
      ))}
    </div>

    {summary && summary.range && (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        <p>
          구간 [{summary.range[0]}, {summary.range[1]}]의 현재 합: {summary.result ?? 0}
        </p>
      </div>
    )}
  </div>
);

export default DataStructuresPlayground;

