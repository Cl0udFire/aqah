import { useMemo, useState } from "react";

const POINTER_SCENARIOS = {
  arrayWindow: {
    name: "슬라이딩 윈도우",
    description:
      "두 개의 포인터가 배열 위를 이동하며 구간을 확장하거나 축소하는 패턴을 연습해보세요.",
    defaultValues: [12, 5, 9, 3, 7, 10, 4, 8],
  },
  partition: {
    name: "분할 정복",
    description:
      "피벗을 기준으로 작은 값과 큰 값을 나누는 포인터 이동을 시각화합니다.",
    defaultValues: [24, 11, 32, 7, 19, 5, 28, 14],
  },
};

const MIN_LENGTH = 4;
const MAX_LENGTH = 10;

const PointerPlayground = () => {
  const [scenarioKey, setScenarioKey] = useState("arrayWindow");
  const [values, setValues] = useState(() => POINTER_SCENARIOS.arrayWindow.defaultValues);
  const [leftPointer, setLeftPointer] = useState(1);
  const [rightPointer, setRightPointer] = useState(4);

  const scenario = POINTER_SCENARIOS[scenarioKey];

  const normalizedLeft = clamp(leftPointer, 0, values.length - 1);
  const normalizedRight = clamp(rightPointer, 0, values.length - 1);

  const sortedPointers = normalizedLeft <= normalizedRight
    ? [normalizedLeft, normalizedRight]
    : [normalizedRight, normalizedLeft];

  const activeWindow = useMemo(() => {
    const [start, end] = sortedPointers;
    return values.slice(start, end + 1);
  }, [sortedPointers, values]);

  const windowSum = activeWindow.reduce((acc, value) => acc + value, 0);
  const windowAverage = activeWindow.length
    ? (windowSum / activeWindow.length).toFixed(2)
    : "-";

  const handleScenarioChange = (key) => {
    setScenarioKey(key);
    const defaults = POINTER_SCENARIOS[key].defaultValues;
    setValues(defaults);
    setLeftPointer(Math.max(0, Math.min(1, defaults.length - 1)));
    setRightPointer(Math.max(0, Math.min(4, defaults.length - 1)));
  };

  const handleLengthChange = (length) => {
    const nextLength = clamp(length, MIN_LENGTH, MAX_LENGTH);
    const nextValues = Array.from({ length: nextLength }, (_, index) =>
      scenario.defaultValues[index % scenario.defaultValues.length]
    );
    setValues(nextValues);
    setLeftPointer(clamp(normalizedLeft, 0, nextLength - 1));
    setRightPointer(clamp(normalizedRight, 0, nextLength - 1));
  };

  const handleShuffle = () => {
    setValues((previous) => shuffleArray([...previous]));
  };

  const swapPointers = () => {
    setLeftPointer(normalizedRight);
    setRightPointer(normalizedLeft);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">포인터 실험장</h2>
          <p className="text-sm text-slate-600">{scenario.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(POINTER_SCENARIOS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                key === scenarioKey
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => handleScenarioChange(key)}
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
              <label className="text-sm font-medium text-slate-700">배열 길이</label>
              <span className="text-sm text-slate-500">{values.length} 칸</span>
            </div>
            <input
              type="range"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              value={values.length}
              onChange={(event) => handleLengthChange(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
              aria-label="array-length"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={handleShuffle}
            >
              값 섞기
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              onClick={swapPointers}
            >
              포인터 맞바꾸기
            </button>
          </div>

          <PointerBoard
            values={values}
            leftPointer={normalizedLeft}
            rightPointer={normalizedRight}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <PointerControl
              label="왼쪽 포인터"
              value={normalizedLeft}
              max={values.length - 1}
              onChange={setLeftPointer}
              color="text-sky-500"
            />
            <PointerControl
              label="오른쪽 포인터"
              value={normalizedRight}
              max={values.length - 1}
              onChange={setRightPointer}
              color="text-amber-500"
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <h3 className="text-sm font-semibold text-slate-800">현재 윈도우</h3>
            <dl className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <dt>범위</dt>
                <dd>
                  {sortedPointers[0] + 1}번째 ~ {sortedPointers[1] + 1}번째
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>포함된 값</dt>
                <dd>{activeWindow.join(", ") || "없음"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>합계</dt>
                <dd>{windowSum}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>평균</dt>
                <dd>{windowAverage}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600">
            <p className="font-medium text-slate-800">학습 팁</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>왼쪽 포인터를 이동하면 윈도우의 시작점을 조절할 수 있어요.</li>
              <li>오른쪽 포인터는 윈도우 끝을 확장하거나 좁힙니다.</li>
              <li>두 포인터가 교차하면 자동으로 범위가 정렬되어 표현돼요.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

const PointerBoard = ({ values, leftPointer, rightPointer }) => {
  const maxValue = Math.max(...values, 1);

  return (
    <div className="relative mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 pb-6 pt-10">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-4 md:grid-cols-8">
        {values.map((value, index) => {
          const markers = [];
          if (index === leftPointer) {
            markers.push({ label: "Left", color: "bg-sky-500" });
          }
          if (index === rightPointer) {
            markers.push({ label: "Right", color: "bg-amber-500" });
          }

          const heightPercent = Math.max((value / maxValue) * 100, 10);

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex h-10 items-end gap-1">
                {markers.map((marker) => (
                  <span
                    key={marker.label}
                    className={`flex h-8 min-w-[48px] flex-col items-center justify-end rounded-full ${marker.color} px-2 text-[11px] font-semibold uppercase tracking-wide text-white`}
                  >
                    ↑
                    <span>{marker.label}</span>
                  </span>
                ))}
              </div>
              <div className="flex h-32 w-full flex-col justify-end">
                <div
                  className="w-full rounded-t-lg bg-slate-200 shadow-inner"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">index {index}</div>
              <div className="text-sm font-semibold text-slate-800">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PointerControl = ({ label, value, max, onChange, color }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <span className="text-sm text-slate-500">{value + 1}번째</span>
    </div>
    <input
      type="range"
      min={0}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
    />
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <button
        type="button"
        className="rounded border border-slate-200 px-2 py-1 font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
        onClick={() => onChange(clamp(value - 1, 0, max))}
      >
        ← 왼쪽
      </button>
      <button
        type="button"
        className="rounded border border-slate-200 px-2 py-1 font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
        onClick={() => onChange(clamp(value + 1, 0, max))}
      >
        오른쪽 →
      </button>
    </div>
  </div>
);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default PointerPlayground;
