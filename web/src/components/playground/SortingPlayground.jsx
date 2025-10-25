import { useEffect, useMemo, useState } from "react";

const SORTING_ALGORITHMS = {
  bubble: {
    name: "Bubble Sort",
    description:
      "이웃한 두 값을 비교하고 필요하면 교환하는 안정적인 정렬입니다. 시간 복잡도는 O(n^2)입니다.",
    generator: bubbleSortSteps,
  },
  insertion: {
    name: "Insertion Sort",
    description:
      "정렬된 부분에 새로운 값을 끼워 넣는 방식으로 동작합니다. 작은 입력에서 효율적입니다.",
    generator: insertionSortSteps,
  },
  quick: {
    name: "Quick Sort",
    description:
      "피벗을 기준으로 분할 정복을 수행하는 빠른 정렬입니다. 평균 시간 복잡도는 O(n log n)입니다.",
    generator: quickSortSteps,
  },
};

const BAR_COLORS = {
  base: "bg-slate-300",
  comparing: "bg-sky-400",
  swapped: "bg-amber-400",
  pivot: "bg-emerald-400",
};

const SortingPlayground = () => {
  const [arraySize, setArraySize] = useState(10);
  const [algorithmKey, setAlgorithmKey] = useState("bubble");
  const [values, setValues] = useState(() => createRandomArray(10));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const algorithm = SORTING_ALGORITHMS[algorithmKey];

  const steps = useMemo(() => {
    return algorithm.generator(values);
  }, [algorithm, values]);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithmKey, values]);

  useEffect(() => {
    setValues(createRandomArray(arraySize));
  }, [arraySize]);

  useEffect(() => {
    if (!isPlaying) return;
    if (steps.length <= 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [isPlaying, steps]);

  const frame = steps[currentStep] ?? {
    array: values,
    comparing: [],
    swapped: false,
    pivotIndex: null,
  };

  const maxValue = Math.max(...frame.array, 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            정렬 알고리즘 시각화
          </h2>
          <p className="text-sm text-slate-600">{algorithm.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SORTING_ALGORITHMS).map(([key, item]) => (
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

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr,280px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              배열 크기
            </label>
            <span className="text-sm text-slate-500">{arraySize}개</span>
          </div>
          <input
            aria-label="array-size"
            type="range"
            min={4}
            max={16}
            value={arraySize}
            onChange={(event) => setArraySize(Number(event.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={() => setValues(createRandomArray(arraySize))}
            >
              배열 다시 섞기
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={() => setValues([...values].sort((a, b) => a - b))}
            >
              오름차순 정렬된 배열 만들기
            </button>
          </div>

          <div className="relative mt-6 flex h-64 items-end justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            {frame.array.map((value, index) => {
              const height = Math.max((value / maxValue) * 100, 6);
              const isComparing = frame.comparing?.includes(index);
              const isPivot = frame.pivotIndex === index;
              const colorClass = isPivot
                ? BAR_COLORS.pivot
                : isComparing
                ? frame.swapped
                  ? BAR_COLORS.swapped
                  : BAR_COLORS.comparing
                : BAR_COLORS.base;

              return (
                <div key={index} className="flex w-6 flex-col items-center gap-2">
                  <div
                    className={`flex w-full items-end justify-center rounded-t-md ${colorClass}`}
                    style={{ height: `${height}%` }}
                    aria-label={`value-${value}`}
                  ></div>
                  <span className="text-xs font-medium text-slate-600">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">현재 상태</h3>
            <dl className="mt-2 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt>스텝</dt>
                <dd>
                  {Math.min(currentStep + 1, steps.length)} / {steps.length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>비교 중인 인덱스</dt>
                <dd>
                  {frame.comparing?.length
                    ? frame.comparing.map((idx) => idx + 1).join(", ")
                    : "없음"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>피벗</dt>
                <dd>
                  {typeof frame.pivotIndex === "number"
                    ? `${frame.pivotIndex + 1}번째`
                    : "없음"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>교환 발생</dt>
                <dd>{frame.swapped ? "예" : "아니오"}</dd>
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
              disabled={steps.length <= 1}
            >
              {isPlaying ? "일시정지" : "자동 재생"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
              }
              disabled={currentStep >= steps.length - 1}
            >
              다음 단계
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">알고리즘 노트</p>
            <p className="mt-2 leading-relaxed">
              각 단계에서 비교되는 막대를 색으로 구분했습니다. 피벗이 있는
              알고리즘은 초록색, 교환이 발생한 단계는 주황색으로 표시돼요.
              그래프 아래 숫자는 현재 배열의 값을 나타냅니다.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

function createRandomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
}

function bubbleSortSteps(initialArray) {
  const arr = [...initialArray];
  const steps = [createSortingFrame(arr)];

  for (let i = 0; i < arr.length - 1; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      steps.push(createSortingFrame(arr, [j, j + 1]));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push(createSortingFrame(arr, [j, j + 1], true));
      }
    }
  }

  steps.push(createSortingFrame(arr));
  return steps;
}

function insertionSortSteps(initialArray) {
  const arr = [...initialArray];
  const steps = [createSortingFrame(arr)];

  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i];
    let j = i - 1;
    steps.push(createSortingFrame(arr, [i], false, i));

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push(createSortingFrame(arr, [j, j + 1], true, i));
      j -= 1;
    }

    arr[j + 1] = key;
    steps.push(createSortingFrame(arr, [j + 1], false, j + 1));
  }

  steps.push(createSortingFrame(arr));
  return steps;
}

function quickSortSteps(initialArray) {
  const arr = [...initialArray];
  const steps = [createSortingFrame(arr)];

  function partition(low, high) {
    const pivot = arr[high];
    let i = low;
    steps.push(createSortingFrame(arr, [low, high], false, high));

    for (let j = low; j < high; j += 1) {
      steps.push(createSortingFrame(arr, [j, high], false, high));
      if (arr[j] < pivot) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push(createSortingFrame(arr, [i, j], true, high));
        }
        i += 1;
      }
    }

    [arr[i], arr[high]] = [arr[high], arr[i]];
    steps.push(createSortingFrame(arr, [i, high], true, i));
    return i;
  }

  function quickSort(low, high) {
    if (low >= high) {
      return;
    }

    const pivotIndex = partition(low, high);
    quickSort(low, pivotIndex - 1);
    quickSort(pivotIndex + 1, high);
  }

  quickSort(0, arr.length - 1);
  steps.push(createSortingFrame(arr));
  return steps;
}

function createSortingFrame(array, comparing = [], swapped = false, pivotIndex = null) {
  return {
    array: [...array],
    comparing,
    swapped,
    pivotIndex,
  };
}

export default SortingPlayground;
