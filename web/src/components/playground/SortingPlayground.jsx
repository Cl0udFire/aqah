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

const MIN_ARRAY_SIZE = 4;
const MAX_ARRAY_SIZE = 16;
const MIN_VALUE = 1;
const MAX_VALUE = 120;
const LOCAL_STORAGE_KEY = "aqah-sorting-playground-presets";

const BAR_COLORS = {
  base: "#cbd5f5",
  comparing: "#38bdf8",
  swapped: "#f59e0b",
  pivot: "#34d399",
};

const PRESET_SCENARIOS = [
  {
    id: "nearly-sorted",
    label: "거의 정렬된 배열",
    description: "마지막 두 값만 뒤바뀐 상태",
    values: [9, 12, 15, 18, 21, 24, 27, 23, 30, 33],
  },
  {
    id: "reverse-order",
    label: "역순 배열",
    description: "완전히 내림차순으로 정렬된 데이터",
    values: [96, 88, 79, 71, 63, 55, 47, 38, 29, 20],
  },
  {
    id: "many-duplicates",
    label: "중복이 많은 배열",
    description: "동일한 값이 자주 등장하는 예시",
    values: [18, 24, 18, 42, 36, 24, 18, 30, 36, 24],
  },
];

const SortingPlayground = () => {
  const [algorithmKey, setAlgorithmKey] = useState("bubble");
  const [values, setValues] = useState(() => createRandomArray(10));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [presetName, setPresetName] = useState("");
  const [presetError, setPresetError] = useState("");
  const [presetFeedback, setPresetFeedback] = useState("");
  const [savedPresets, setSavedPresets] = useState(() => loadPresetsFromStorage());
  const [selectedPresetId, setSelectedPresetId] = useState("");

  const arraySize = values.length;
  const algorithm = SORTING_ALGORITHMS[algorithmKey];

  const steps = useMemo(() => {
    return algorithm.generator(values);
  }, [algorithm, values]);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithmKey, values]);

  useEffect(() => {
    setManualInput(values.join(", "));
  }, [values]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(savedPresets)
    );
  }, [savedPresets]);

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

  const clearMessages = () => {
    setInputError("");
    setPresetError("");
    setPresetFeedback("");
  };

  const frame = steps[currentStep] ?? {
    array: values,
    comparing: [],
    swapped: false,
    pivotIndex: null,
  };

  const maxValue = Math.max(...frame.array, 1);

  const handleArraySizeChange = (nextSize) => {
    const normalized = clamp(nextSize, MIN_ARRAY_SIZE, MAX_ARRAY_SIZE);
    const newArray = createRandomArray(normalized);
    clearMessages();
    setSelectedPresetId("");
    setValues(newArray);
  };

  const handleShuffle = () => {
    const newArray = createRandomArray(arraySize);
    clearMessages();
    setSelectedPresetId("");
    setValues(newArray);
  };

  const handleMakeSorted = () => {
    const sortedArray = [...values].sort((a, b) => a - b);
    clearMessages();
    setSelectedPresetId("");
    setValues(sortedArray);
  };

  const handleApplyManualInput = () => {
    clearMessages();
    const result = parseArrayInput(manualInput);
    if (result.error) {
      setInputError(result.error);
      return;
    }

    setSelectedPresetId("");
    setValues(result.values);
  };

  const handleApplyScenario = (scenario) => {
    clearMessages();
    setSelectedPresetId(scenario.id);
    setValues([...scenario.values]);
    setPresetFeedback(`'${scenario.label}' 프리셋을 적용했어요.`);
  };

  const handleApplySavedPreset = (preset) => {
    clearMessages();
    setSelectedPresetId(preset.id);
    setValues([...preset.values]);
    setPresetFeedback(`'${preset.name}' 프리셋을 적용했어요.`);
  };

  const handleSavePreset = () => {
    clearMessages();
    const trimmed = presetName.trim();
    if (!trimmed) {
      setPresetError("프리셋 이름을 입력해주세요.");
      return;
    }

    const newPreset = {
      id: `saved-${Date.now()}`,
      name: trimmed,
      values: [...values],
    };

    setSavedPresets((previous) => {
      const filtered = previous.filter((item) => item.name !== trimmed);
      return [newPreset, ...filtered].slice(0, 12);
    });

    setSelectedPresetId(newPreset.id);
    setPresetName("");
    setPresetFeedback(`'${trimmed}' 프리셋을 저장했어요.`);
  };

  const handleDeletePreset = (presetId) => {
    clearMessages();
    setSavedPresets((previous) => previous.filter((item) => item.id !== presetId));
    if (selectedPresetId === presetId) {
      setSelectedPresetId("");
    }
    setPresetFeedback("선택한 프리셋을 삭제했어요.");
  };

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
            min={MIN_ARRAY_SIZE}
            max={MAX_ARRAY_SIZE}
            value={arraySize}
            onChange={(event) => handleArraySizeChange(Number(event.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
          />

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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">직접 구성</h3>
            <p className="mt-1 text-xs text-slate-500">
              콤마나 공백으로 구분된 {MIN_ARRAY_SIZE}~{MAX_ARRAY_SIZE}개의 숫자를 입력하면
              그대로 시각화에 반영돼요. ({MIN_VALUE}~{MAX_VALUE})
            </p>
            <textarea
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
              className="mt-3 h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none"
              placeholder="예) 12, 4, 8, 20, 16"
            />
            {inputError ? (
              <p className="mt-2 text-xs font-medium text-rose-500">{inputError}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                현재 입력: {manualInput.split(/[,\s]+/).filter(Boolean).length}개 값
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                onClick={handleApplyManualInput}
              >
                배열에 적용하기
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                onClick={() => {
                  clearMessages();
                  setManualInput(values.join(", "));
                }}
              >
                현재 배열 불러오기
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">빠른 프리셋</h3>
            <p className="mt-1 text-xs text-slate-500">
              학습하기 좋은 대표 상황을 한 번에 불러올 수 있어요.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = selectedPresetId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                    onClick={() => handleApplyScenario(scenario)}
                  >
                    <span className="block font-semibold">{scenario.label}</span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      {scenario.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative mt-6 flex h-64 items-end justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            {frame.array.map((value, index) => {
              const height = Math.max((value / maxValue) * 100, 6);
              const isComparing = frame.comparing?.includes(index);
              const isPivot = frame.pivotIndex === index;
              const barColor = isPivot
                ? BAR_COLORS.pivot
                : isComparing
                ? frame.swapped
                  ? BAR_COLORS.swapped
                  : BAR_COLORS.comparing
                : BAR_COLORS.base;

              return (
                <div key={index} className="flex w-8 flex-col items-center gap-2">
                  <div
                    className="flex w-full items-end justify-center rounded-t-lg shadow-sm"
                    style={{
                      height: `${height}%`,
                      backgroundColor: barColor,
                      transition: "height 0.4s ease, background-color 0.3s ease",
                    }}
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
            {presetFeedback ? (
              <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs font-medium text-sky-700">
                {presetFeedback}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">나만의 프리셋 저장</p>
            <p className="mt-2 text-xs text-slate-500">
              현재 배열 구성을 이름과 함께 저장하면 언제든 다시 불러올 수 있어요.
              (브라우저 로컬 저장소 사용)
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none"
                placeholder="예) 8개 무작위"
              />
              <button
                type="button"
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                onClick={handleSavePreset}
              >
                현재 배열을 프리셋으로 저장
              </button>
            </div>
            {presetError ? (
              <p className="mt-2 text-xs font-semibold text-rose-500">{presetError}</p>
            ) : null}

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">저장한 프리셋</p>
              {savedPresets.length === 0 ? (
                <p className="text-xs text-slate-500">
                  아직 저장된 프리셋이 없어요. 위 버튼으로 첫 프리셋을 만들어보세요.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {savedPresets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <li
                        key={preset.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <button
                          type="button"
                          className="flex-1 text-left font-semibold"
                          onClick={() => handleApplySavedPreset(preset)}
                        >
                          {preset.name}
                        </button>
                        <button
                          type="button"
                          className="ml-2 text-[11px] font-medium text-slate-400 underline transition hover:text-rose-500"
                          onClick={() => handleDeletePreset(preset.id)}
                        >
                          삭제
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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

function parseArrayInput(input) {
  if (!input.trim()) {
    return { error: "숫자를 입력해주세요." };
  }

  const tokens = input
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length < MIN_ARRAY_SIZE || tokens.length > MAX_ARRAY_SIZE) {
    return {
      error: `${MIN_ARRAY_SIZE}~${MAX_ARRAY_SIZE}개의 숫자를 입력해주세요.`,
    };
  }

  const values = tokens.map((token) => Number(token));

  if (values.some((value) => Number.isNaN(value))) {
    return { error: "숫자와 구분자만 입력할 수 있어요." };
  }

  const roundedValues = values.map((value) => Math.round(value));

  if (
    roundedValues.some(
      (value) => value < MIN_VALUE || value > MAX_VALUE || !Number.isFinite(value)
    )
  ) {
    return {
      error: `${MIN_VALUE}~${MAX_VALUE} 범위의 정수를 입력해주세요.`,
    };
  }

  return { values: roundedValues };
}

function loadPresetsFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((preset) => sanitizePreset(preset))
      .filter(Boolean)
      .slice(0, 12);
  } catch (error) {
    console.warn("프리셋을 불러오는 중 문제가 발생했어요.", error);
    return [];
  }
}

function sanitizePreset(preset) {
  if (!preset || typeof preset !== "object") {
    return null;
  }

  const { id, name, values } = preset;
  if (typeof id !== "string" || typeof name !== "string" || !Array.isArray(values)) {
    return null;
  }

  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (
    numericValues.length < MIN_ARRAY_SIZE ||
    numericValues.length > MAX_ARRAY_SIZE ||
    numericValues.some((value) => value < MIN_VALUE || value > MAX_VALUE)
  ) {
    return null;
  }

  return {
    id,
    name,
    values: numericValues.map((value) => Math.round(value)),
  };
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
