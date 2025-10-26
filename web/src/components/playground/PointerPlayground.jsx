import { useEffect, useMemo, useState } from "react";

const BYTES_PER_INT = 4;

const MEMORY_BLUEPRINT = {
  value: {
    variable: "value",
    declaration: "int value",
    description: "단일 정수 변수의 주소를 직접 참조합니다.",
    initial: 42,
    address: 0x1000,
  },
  anotherValue: {
    variable: "another",
    declaration: "int another",
    description: "다른 변수의 주소를 가리키도록 포인터를 바꿔보세요.",
    initial: 17,
    address: 0x1004,
  },
  numbers: {
    variable: "numbers",
    declaration: "int numbers[4]",
    description: "배열의 첫 요소 주소를 기준으로 포인터 산술을 연습합니다.",
    initial: [3, 9, 12, 18],
    address: 0x2000,
  },
};

const POINTER_TARGETS = {
  value: {
    key: "value",
    label: "&value (단일 변수)",
  },
  anotherValue: {
    key: "anotherValue",
    label: "&another (다른 변수)",
  },
  numbers: {
    key: "numbers",
    label: "numbers (배열 첫 주소)",
  },
};

const PointerPlayground = () => {
  const [memory, setMemory] = useState(() => ({
    value: MEMORY_BLUEPRINT.value.initial,
    anotherValue: MEMORY_BLUEPRINT.anotherValue.initial,
    numbers: [...MEMORY_BLUEPRINT.numbers.initial],
  }));
  const [pointerTarget, setPointerTarget] = useState("value");
  const [arrayOffset, setArrayOffset] = useState(0);
  const [writeValue, setWriteValue] = useState(MEMORY_BLUEPRINT.value.initial);

  const maxOffset = memory.numbers.length - 1;
  const normalizedOffset = pointerTarget === "numbers" ? clamp(arrayOffset, 0, maxOffset) : 0;
  const pointerCellKey = `${pointerTarget}-${normalizedOffset}`;

  useEffect(() => {
    if (pointerTarget !== "numbers") {
      setArrayOffset(0);
    }
  }, [pointerTarget]);

  useEffect(() => {
    if (pointerTarget === "numbers") {
      setArrayOffset((previous) => clamp(previous, 0, maxOffset));
    }
  }, [pointerTarget, maxOffset]);

  const pointerDetails = useMemo(() => {
    const blueprint = MEMORY_BLUEPRINT[pointerTarget];
    const baseAddress = blueprint.address;

    const pointerExpression =
      pointerTarget === "numbers"
        ? normalizedOffset === 0
          ? blueprint.variable
          : `${blueprint.variable} + ${normalizedOffset}`
        : `&${blueprint.variable}`;

    const address =
      pointerTarget === "numbers"
        ? baseAddress + normalizedOffset * BYTES_PER_INT
        : baseAddress;

    const dereferencedValue =
      pointerTarget === "numbers"
        ? memory.numbers[normalizedOffset]
        : memory[pointerTarget];

    const pointerCellId =
      pointerTarget === "numbers" ? `numbers-${normalizedOffset}` : pointerTarget;

    const pointerSummary =
      pointerTarget === "numbers"
        ? `numbers[${normalizedOffset}] 요소를 가리킵니다.`
        : `${blueprint.variable} 변수의 주소를 가리킵니다.`;

    const dereferenceExpression =
      pointerTarget === "numbers"
        ? `*(numbers + ${normalizedOffset})`
        : "*ptr";

    return {
      pointerExpression,
      address: formatAddress(address),
      dereferencedValue,
      pointerCellId,
      pointerSummary,
      dereferenceExpression,
      blueprint,
    };
  }, [pointerTarget, normalizedOffset, memory]);

  useEffect(() => {
    if (pointerTarget === "numbers") {
      setWriteValue(memory.numbers[normalizedOffset] ?? 0);
    } else {
      setWriteValue(memory[pointerTarget]);
    }
  }, [pointerCellKey, memory, pointerTarget, normalizedOffset]);

  const handleTargetChange = (event) => {
    setPointerTarget(event.target.value);
  };

  const handleOffsetChange = (value) => {
    setArrayOffset(clamp(value, 0, maxOffset));
  };

  const handleWriteThroughPointer = () => {
    if (pointerTarget === "numbers") {
      setMemory((previous) => {
        const nextNumbers = [...previous.numbers];
        nextNumbers[normalizedOffset] = writeValue;
        return { ...previous, numbers: nextNumbers };
      });
      return;
    }

    setMemory((previous) => ({
      ...previous,
      [pointerTarget]: writeValue,
    }));
  };

  const handleResetMemory = () => {
    setMemory({
      value: MEMORY_BLUEPRINT.value.initial,
      anotherValue: MEMORY_BLUEPRINT.anotherValue.initial,
      numbers: [...MEMORY_BLUEPRINT.numbers.initial],
    });
  };

  const memoryCells = buildMemoryCells(memory);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">C 포인터 실험장</h2>
          <p className="text-sm text-slate-600">
            변수의 주소, 포인터 대입, 배열 포인터 산술까지 한 화면에서 관찰해보세요.
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <PointerCodeBlock
            memory={memory}
            pointerExpression={pointerDetails.pointerExpression}
            dereferenceExpression={pointerDetails.dereferenceExpression}
            dereferencedValue={pointerDetails.dereferencedValue}
          />

          <PointerMemoryBoard
            cells={memoryCells}
            activeCellId={pointerDetails.pointerCellId}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">포인터가 가리킬 대상</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={pointerTarget}
                onChange={handleTargetChange}
              >
                {Object.values(POINTER_TARGETS).map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-relaxed text-slate-500">
                {MEMORY_BLUEPRINT[pointerTarget].description}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">포인터로 쓰기</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={writeValue}
                  onChange={(event) => setWriteValue(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  type="button"
                  className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                  onClick={handleWriteThroughPointer}
                >
                  저장
                </button>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                현재 ptr이 가리키는 위치에 값을 씁니다. 배열 요소도 같은 방식으로 수정돼요.
              </p>
            </div>
          </div>

          {pointerTarget === "numbers" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">배열 오프셋 조절</span>
                <span className="text-xs text-slate-500">numbers[{normalizedOffset}]</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxOffset}
                value={normalizedOffset}
                onChange={(event) => handleOffsetChange(Number(event.target.value))}
                className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-300"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>ptr = {pointerDetails.pointerExpression}</span>
                <span>{pointerDetails.address}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            onClick={handleResetMemory}
          >
            초기 상태로 되돌리기
          </button>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <h3 className="text-sm font-semibold text-slate-800">현재 포인터 상태</h3>
            <dl className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <dt>ptr 대입식</dt>
                <dd className="font-mono text-xs text-slate-700">
                  int *ptr = {pointerDetails.pointerExpression};
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>주소</dt>
                <dd className="font-mono text-xs text-slate-700">{pointerDetails.address}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>역참조</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {pointerDetails.dereferenceExpression} = {pointerDetails.dereferencedValue}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>설명</dt>
                <dd className="text-right text-xs text-slate-500">
                  {pointerDetails.pointerSummary}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600">
            <p className="font-medium text-slate-800">학습 포인트</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>포인터 변수는 주소를 저장하는 정수와 같으며 역참조로 실제 값을 읽습니다.</li>
              <li>배열 이름은 첫 요소 주소이므로 ptr = numbers 는 &numbers[0]과 동일합니다.</li>
              <li>포인터 산술은 자료형 크기 단위로 이동하여 numbers + 1은 다음 요소를 가리킵니다.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

const PointerCodeBlock = ({ memory, pointerExpression, dereferenceExpression, dereferencedValue }) => {
  const numbersLiteral = memory.numbers.map((value) => `${value}`).join(", ");

  const codeLines = [
    `${MEMORY_BLUEPRINT.value.declaration} = ${memory.value};`,
    `${MEMORY_BLUEPRINT.anotherValue.declaration} = ${memory.anotherValue};`,
    `${MEMORY_BLUEPRINT.numbers.declaration} = { ${numbersLiteral} };`,
    "",
    `int *ptr = ${pointerExpression};`,
    `int data = ${dereferenceExpression}; // ${dereferencedValue}`,
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 font-mono text-sm text-slate-100 shadow-inner">
      <pre className="whitespace-pre-wrap leading-relaxed">{codeLines.join("\n")}</pre>
    </div>
  );
};

const PointerMemoryBoard = ({ cells, activeCellId }) => (
  <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-inner">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      메모리 레이아웃
    </h3>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {cells.map((cell) => {
        const isActive = cell.id === activeCellId;
        return (
          <div
            key={cell.id}
            className={`relative rounded-2xl border p-4 transition ${
              isActive
                ? "border-sky-400 bg-blue-50 shadow-lg ring-2 ring-sky-200"
                : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            {isActive && (
              <span className="absolute -top-3 left-4 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                ptr
              </span>
            )}
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cell.label}
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{cell.value}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{cell.address}</span>
              <span>{cell.type}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

function buildMemoryCells(memory) {
  const cells = [
    {
      id: "value",
      label: `${MEMORY_BLUEPRINT.value.variable} (int)`,
      address: formatAddress(MEMORY_BLUEPRINT.value.address),
      value: memory.value,
      type: "int",
    },
    {
      id: "anotherValue",
      label: `${MEMORY_BLUEPRINT.anotherValue.variable} (int)`,
      address: formatAddress(MEMORY_BLUEPRINT.anotherValue.address),
      value: memory.anotherValue,
      type: "int",
    },
  ];

  MEMORY_BLUEPRINT.numbers.initial.forEach((_, index) => {
    cells.push({
      id: `numbers-${index}`,
      label: `numbers[${index}]`,
      address: formatAddress(MEMORY_BLUEPRINT.numbers.address + index * BYTES_PER_INT),
      value: memory.numbers[index],
      type: "int",
    });
  });

  return cells;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatAddress(address) {
  return `0x${address.toString(16).toUpperCase()}`;
}

export default PointerPlayground;
