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
  merge: {
    name: "Merge Sort",
    description:
      "배열을 반으로 나누고 정렬된 부분 배열을 병합하는 분할 정복 정렬입니다. 시간 복잡도는 O(n log n)입니다.",
    generator: mergeSortSteps,
  },
  quick: {
    name: "Quick Sort",
    description:
      "피벗을 기준으로 분할 정복을 수행하는 빠른 정렬입니다. 평균 시간 복잡도는 O(n log n)입니다.",
    generator: quickSortSteps,
  },
};

const MIN_ARRAY_SIZE = 4;
const MAX_ARRAY_SIZE = 16;
const MIN_VALUE = 1;
const MAX_VALUE = 120;

const BAR_COLORS = {
  base: "#cbd5f5",
  comparing: "#38bdf8",
  swapped: "#f59e0b",
  pivot: "#34d399",
};

const SortingPlayground = () => {
  const [algorithmKey, setAlgorithmKey] = useState("bubble");
  const [values, setValues] = useState(() => createRandomArray(10));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const algorithm = SORTING_ALGORITHMS[algorithmKey];
  const arraySize = values.length;

  const steps = useMemo(() => {
    const generator = SORTING_ALGORITHMS[algorithmKey].generator;
    return generator(values);
  }, [algorithmKey, values]);
  const frame = steps[currentStep] ?? {
    array: values,
    comparing: [],
    swapped: false,
    pivotIndex: null,
    leftPointer: null,
    rightPointer: null,
  };

  const maxValue = Math.max(...frame.array, 1);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithmKey, values]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (steps.length <= 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentStep((previous) => {
        if (previous >= steps.length - 1) {
          setIsPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [isPlaying, steps]);

  const handleArraySizeChange = (size) => {
    const nextSize = clamp(size, MIN_ARRAY_SIZE, MAX_ARRAY_SIZE);
    setValues(createRandomArray(nextSize));
  };

  const handleShuffle = () => {
    setValues(createRandomArray(arraySize));
  };

  const handleMakeSorted = () => {
    setValues([...values].sort((a, b) => a - b));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">정렬 알고리즘 시각화</h2>
          <p className="text-sm text-slate-600">{algorithm.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SORTING_ALGORITHMS).map(([key, item]) => (
            <button
              key={key}
              type="button"
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

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr,280px]">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">배열 크기</label>
              <span className="text-sm text-slate-500">{arraySize}개</span>
            </div>
            <input
              aria-label="array-size"
              type="range"
              min={MIN_ARRAY_SIZE}
              max={MAX_ARRAY_SIZE}
              value={arraySize}
              onChange={(event) => handleArraySizeChange(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={handleShuffle}
            >
              배열 다시 섞기
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={handleMakeSorted}
            >
              오름차순 정렬된 배열 만들기
            </button>
          </div>

          <div className="relative mt-6 flex h-64 items-end gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 pb-4">
            {frame.array.map((value, index) => {
              const heightPercent = Math.max((value / maxValue) * 100, 8);
              const isComparing = frame.comparing?.includes(index);
              const isPivot = frame.pivotIndex === index;
              const isLeftPointer = frame.leftPointer === index;
              const isRightPointer = frame.rightPointer === index;
              const bothPointers =
                typeof frame.leftPointer === "number" &&
                frame.leftPointer === frame.rightPointer &&
                frame.leftPointer === index;
              const barColor = isPivot
                ? BAR_COLORS.pivot
                : isComparing
                ? frame.swapped
                  ? BAR_COLORS.swapped
                  : BAR_COLORS.comparing
                : BAR_COLORS.base;

              return (
                <div
                  key={index}
                  className="relative flex h-full min-w-[24px] flex-1 flex-col items-center"
                >
                  {isLeftPointer && (
                    <PointerIndicator
                      label="L"
                      color="sky"
                      topOffset={bothPointers ? -76 : -60}
                    />
                  )}
                  {isRightPointer && (
                    <PointerIndicator label="R" color="rose" topOffset={-60} />
                  )}
                  <div className="flex w-full flex-1 flex-col justify-end">
                    <div
                      className="w-full rounded-t-lg shadow-sm"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: barColor,
                        transition: "height 0.4s ease, background-color 0.3s ease",
                      }}
                      aria-label={`value-${value}`}
                    />
                  </div>
                  <span className="mt-2 text-xs font-medium text-slate-600">{value}</span>
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
              각 단계에서 비교되는 막대를 색으로 구분했습니다. 피벗이 있는 알고리즘은 초록색, 교환이 발생한 단계는 주황색으로 표시돼요.
              그래프 아래 숫자는 현재 배열의 값을 나타냅니다.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

function createRandomArray(size) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
    steps.push(createSortingFrame(arr, [low, high], false, high, i, high));

    for (let j = low; j < high; j += 1) {
      steps.push(createSortingFrame(arr, [j, high], false, high, i, j));
      if (arr[j] < pivot) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push(createSortingFrame(arr, [i, j], true, high, i, j));
        }
        i += 1;
      }
    }

    [arr[i], arr[high]] = [arr[high], arr[i]];
    steps.push(createSortingFrame(arr, [i, high], true, i, i, high));
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

function mergeSortSteps(initialArray) {
  const arr = [...initialArray];
  const temp = Array(arr.length).fill(0);
  const steps = [createSortingFrame(arr)];

  function merge(left, mid, right) {
    let i = left;
    let j = mid + 1;
    let k = left;

    while (i <= mid && j <= right) {
      steps.push(createSortingFrame(arr, [i, j], false, null, i, j));
      if (arr[i] <= arr[j]) {
        temp[k] = arr[i];
        i += 1;
      } else {
        temp[k] = arr[j];
        j += 1;
      }
      k += 1;
    }

    while (i <= mid) {
      steps.push(createSortingFrame(arr, [i], false, null, i, null));
      temp[k] = arr[i];
      i += 1;
      k += 1;
    }

    while (j <= right) {
      steps.push(createSortingFrame(arr, [j], false, null, null, j));
      temp[k] = arr[j];
      j += 1;
      k += 1;
    }

    for (let index = left; index <= right; index += 1) {
      arr[index] = temp[index];
      steps.push(createSortingFrame(arr, [index], true, null, left, right));
    }
  }

  function mergeSort(left, right) {
    if (left >= right) {
      return;
    }

    const mid = Math.floor((left + right) / 2);
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);
  steps.push(createSortingFrame(arr));
  return steps;
}

function PointerIndicator({ label, color, topOffset }) {
  const baseColorClasses =
    color === "sky"
      ? {
          badge: "border-sky-300 bg-sky-50 text-sky-600",
          arrow: "text-sky-500",
        }
      : {
          badge: "border-rose-300 bg-rose-50 text-rose-600",
          arrow: "text-rose-500",
        };

  return (
    <div
      className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
      style={{ top: `${topOffset}px` }}
    >
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none ${baseColorClasses.badge}`}
      >
        {label}
      </span>
      <span className={`mt-1 text-lg leading-none ${baseColorClasses.arrow}`}>▼</span>
    </div>
  );
}

function createSortingFrame(
  array,
  comparing = [],
  swapped = false,
  pivotIndex = null,
  leftPointer = null,
  rightPointer = null,
) {
  return {
    array: [...array],
    comparing,
    swapped,
    pivotIndex,
    leftPointer,
    rightPointer,
  };
}

export default SortingPlayground;
