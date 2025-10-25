import { useEffect, useMemo, useState } from "react";

const RECURSION_ALGORITHMS = {
  factorial: {
    name: "팩토리얼",
    description: "n! = n × (n-1)! 규칙을 따르는 재귀 함수를 시각화합니다.",
    minInput: 1,
    maxInput: 8,
    simulate: simulateFactorial,
  },
  fibonacci: {
    name: "피보나치",
    description: "F(n) = F(n-1) + F(n-2)의 호출 트리를 확인해보세요.",
    minInput: 1,
    maxInput: 7,
    simulate: simulateFibonacci,
  },
  binarySearch: {
    name: "이진 탐색",
    description: "정렬된 배열에서 타겟을 찾는 분할 재귀 호출을 살펴봅니다.",
    minInput: 1,
    maxInput: 10,
    simulate: simulateBinarySearch,
  },
};

const RecursionPlayground = () => {
  const [algorithmKey, setAlgorithmKey] = useState("factorial");
  const [inputValue, setInputValue] = useState(4);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const algorithm = RECURSION_ALGORITHMS[algorithmKey];
  const clampedInput = clamp(inputValue, algorithm.minInput, algorithm.maxInput);

  const simulation = useMemo(
    () => algorithm.simulate(clampedInput),
    [algorithm, clampedInput]
  );

  const steps = simulation.steps;
  const frame = steps[currentStep] ?? steps[steps.length - 1];

  const goToStep = (next) => {
    const safe = clamp(next, 0, steps.length - 1);
    setCurrentStep(safe);
    setIsPlaying(false);
  };

  useEffect(() => {
    setCurrentStep((previous) => clamp(previous, 0, steps.length - 1));
    setIsPlaying(false);
  }, [steps.length]);

  const handleAlgorithmChange = (key) => {
    setAlgorithmKey(key);
    const config = RECURSION_ALGORITHMS[key];
    setInputValue(config.minInput);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (steps.length <= 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">재귀 함수 탐구</h2>
          <p className="text-sm text-slate-600">{algorithm.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(RECURSION_ALGORITHMS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                key === algorithmKey
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => handleAlgorithmChange(key)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr,280px]">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">입력 값</label>
              <span className="text-sm text-slate-500">{clampedInput}</span>
            </div>
            <input
              type="range"
              min={algorithm.minInput}
              max={algorithm.maxInput}
              value={clampedInput}
              onChange={(event) => handleInputChange(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
              aria-label="recursion-input"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              호출 스택 프레임
            </h3>
            <div className="mt-4 max-h-80 overflow-y-auto pr-1">
              <StackFrameTree frames={frame.stack} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>
                단계 {currentStep + 1} / {steps.length}
              </span>
              <span className="text-slate-500">{frame.message}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
              >
                이전 단계
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
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
                max={steps.length - 1}
                value={currentStep}
                onChange={(event) => goToStep(Number(event.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200"
                aria-label="step-range"
              />
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => goToStep(currentStep + 1)}
                disabled={currentStep >= steps.length - 1}
              >
                다음 단계
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <h3 className="text-sm font-semibold text-slate-800">최종 결과</h3>
            <p className="mt-2 text-lg font-bold text-slate-900">{simulation.result}</p>
            <p className="mt-2 leading-relaxed text-slate-600">{simulation.summary}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600">
            <p className="font-medium text-slate-800">관찰 포인트</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>각 호출은 독립적인 스택 프레임으로 표현되며 상위 프레임 안에 중첩됩니다.</li>
              <li>return 단계에서는 프레임 배경이 초록색으로 변하며 반환 값이 기록돼요.</li>
              <li>재귀가 끝나면 가장 안쪽 프레임부터 차례로 닫히며 스택이 비어 있습니다.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

const StackFrameTree = ({ frames }) => {
  if (!frames.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        스택이 비어 있어요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FrameNode frames={frames} index={0} depth={0} />
    </div>
  );
};

const FrameNode = ({ frames, index, depth }) => {
  const frame = frames[index];
  const isLeaf = index === frames.length - 1;
  const nextDepth = depth + 1;

  const stateStyles =
    frame.state === "returning"
      ? {
          border: "border-emerald-400",
          background: "bg-emerald-50",
          badge: "bg-emerald-100 text-emerald-700",
          label: "RETURN",
        }
      : {
          border: "border-sky-300",
          background: depth % 2 === 0 ? "bg-slate-50" : "bg-white",
          badge: "bg-sky-100 text-sky-700",
          label: "CALL",
        };

  return (
    <div
      className={`rounded-2xl border ${stateStyles.border} ${stateStyles.background} p-4 shadow-sm transition`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-slate-900">{frame.signature}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${stateStyles.badge}`}
        >
          {stateStyles.label}
        </span>
      </div>
      {frame.result !== undefined && (
        <p className="mt-2 text-xs text-slate-600">
          반환 값: <span className="font-semibold text-slate-800">{frame.result}</span>
        </p>
      )}
      {isLeaf && frame.state !== "returning" && (
        <p className="mt-3 text-xs text-slate-500">/* 현재 실행 중인 프레임 */</p>
      )}
      {!isLeaf && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
          <FrameNode frames={frames} index={index + 1} depth={nextDepth} />
        </div>
      )}
    </div>
  );
};

function simulateFactorial(n) {
  const events = [];
  const result = factorial(n, events);
  return buildSimulation(events, `입력 ${n}에 대한 팩토리얼을 계산했습니다.`, result);
}

function factorial(n, events) {
  events.push({ kind: "call", signature: `factorial(${n})` });
  if (n <= 1) {
    events.push({ kind: "return", signature: `factorial(${n})`, result: 1 });
    return 1;
  }
  const child = factorial(n - 1, events);
  const total = n * child;
  events.push({ kind: "return", signature: `factorial(${n})`, result: total });
  return total;
}

function simulateFibonacci(n) {
  const events = [];
  const result = fibonacci(n, events);
  return buildSimulation(
    events,
    `F(${n})를 재귀적으로 계산하며 중복 호출의 구조를 살펴보세요.`,
    result
  );
}

function fibonacci(n, events) {
  events.push({ kind: "call", signature: `fibonacci(${n})` });
  if (n <= 1) {
    events.push({ kind: "return", signature: `fibonacci(${n})`, result: n });
    return n;
  }
  const a = fibonacci(n - 1, events);
  const b = fibonacci(n - 2, events);
  const total = a + b;
  events.push({ kind: "return", signature: `fibonacci(${n})`, result: total });
  return total;
}

function simulateBinarySearch(target) {
  const events = [];
  const sortedArray = Array.from({ length: 16 }, (_, index) => index + 1);
  const result = binarySearch(sortedArray, target, 0, sortedArray.length - 1, events);
  const summary = result.found
    ? `${target} 값을 찾았습니다! 인덱스 ${result.index + 1} (1-based)입니다.`
    : `${target} 값이 배열에 존재하지 않습니다.`;

  const displayResult = result.found
    ? `${target} (인덱스 ${result.index + 1})`
    : "없음";

  return buildSimulation(events, summary, displayResult);
}

function binarySearch(array, target, low, high, events) {
  events.push({
    kind: "call",
    signature: `binarySearch(low=${low}, high=${high})`,
  });

  if (low > high) {
    events.push({
      kind: "return",
      signature: `binarySearch(low=${low}, high=${high})`,
      result: "없음",
    });
    return { found: false };
  }

  const mid = Math.floor((low + high) / 2);
  const value = array[mid];

  if (value === target) {
    events.push({
      kind: "return",
      signature: `binarySearch(low=${low}, high=${high})`,
      result: `found=${mid}`,
    });
    return { found: true, index: mid };
  }

  if (value > target) {
    const result = binarySearch(array, target, low, mid - 1, events);
    events.push({
      kind: "return",
      signature: `binarySearch(low=${low}, high=${high})`,
      result: result.found ? `found=${result.index}` : "없음",
    });
    return result;
  }

  const result = binarySearch(array, target, mid + 1, high, events);
  events.push({
    kind: "return",
    signature: `binarySearch(low=${low}, high=${high})`,
    result: result.found ? `found=${result.index}` : "없음",
  });
  return result;
}

function buildSimulation(events, summary, result) {
  const steps = [];
  const stack = [];

  events.forEach((event, index) => {
    if (event.kind === "call") {
      stack.push({
        id: `${event.signature}-${index}`,
        signature: event.signature,
        state: "call",
      });
      steps.push({
        stack: snapshotStack(stack),
        message: `${event.signature} 호출`,
      });
    } else {
      if (stack.length) {
        const last = stack[stack.length - 1];
        last.state = "returning";
        last.result = event.result;
        steps.push({
          stack: snapshotStack(stack),
          message: `${event.signature} 반환`,
        });
        stack.pop();
      } else {
        steps.push({
          stack: [],
          message: `${event.signature} 반환`,
        });
      }
    }
  });

  steps.push({
    stack: [],
    message: "호출이 모두 종료되었습니다.",
  });

  return {
    steps,
    summary,
    result,
  };
}

function snapshotStack(stack) {
  return stack.map((frame) => ({ ...frame }));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default RecursionPlayground;
