import { useEffect, useMemo, useState } from "react";

const HASH_ALGORITHMS = {
  djb2: {
    label: "DJB2 해시",
    description: "각 문자에 33을 곱해 누적하며 만들어지는 고전적인 문자열 해시입니다.",
    compute: (text) => {
      let hash = 5381;
      const steps = [];

      [...text].forEach((char, index) => {
        const code = char.codePointAt(0) ?? 0;
        const before = hash;
        hash = ((hash << 5) + hash + code) >>> 0;
        steps.push({
          index,
          char,
          code,
          before,
          after: hash,
          formula: `(${before} × 33 + ${code}) mod 2³²`,
        });
      });

      return { result: `0x${hash.toString(16).padStart(8, "0")}`, steps };
    },
  },
  polynomial: {
    label: "다항 해시 (base 31)",
    description: "가변 길이 문자열에 자주 쓰이는 base-31 다항 해시입니다.",
    compute: (text) => {
      const base = 31;
      const mod = 1_000_000_007;
      let hash = 0;
      const steps = [];

      [...text].forEach((char, index) => {
        const code = char.codePointAt(0) ?? 0;
        const before = hash;
        hash = (hash * base + code) % mod;
        steps.push({
          index,
          char,
          code,
          before,
          after: hash,
          formula: `(${before} × ${base} + ${code}) mod ${mod}`,
        });
      });

      return { result: hash.toString(), steps };
    },
  },
};

const ENCRYPTION_ALGORITHMS = {
  caesar: {
    label: "시저 암호",
    description: "알파벳을 지정한 만큼 회전시키는 가장 단순한 치환 암호입니다.",
    parameterLabel: "이동 거리",
    parameterType: "number",
    defaultParameter: 3,
    compute: (text, shift) => {
      const normalizedShift = Number.isFinite(shift) ? ((shift % 26) + 26) % 26 : 0;
      let result = "";
      const steps = [];

      [...text].forEach((char, index) => {
        const code = char.codePointAt(0) ?? 0;
        let transformed = char;
        if (code >= 65 && code <= 90) {
          transformed = String.fromCharCode(65 + ((code - 65 + normalizedShift) % 26));
        } else if (code >= 97 && code <= 122) {
          transformed = String.fromCharCode(97 + ((code - 97 + normalizedShift) % 26));
        }
        result += transformed;
        steps.push({
          index,
          original: char,
          detail: `${char} → ${transformed}`,
        });
      });

      return { result, steps };
    },
  },
  xor: {
    label: "XOR 암호",
    description: "문자 코드를 반복되는 키와 XOR 연산해 간단히 암호화합니다.",
    parameterLabel: "키 문자열",
    parameterType: "text",
    defaultParameter: "key",
    compute: (text, key) => {
      if (!key) {
        return { result: text, steps: [] };
      }

      let result = "";
      const steps = [];
      const keyCodes = [...key].map((char) => char.codePointAt(0) ?? 0);

      [...text].forEach((char, index) => {
        const code = char.codePointAt(0) ?? 0;
        const keyCode = keyCodes[index % keyCodes.length];
        const xorValue = code ^ keyCode;
        const transformed = String.fromCharCode(xorValue);
        result += transformed;
        steps.push({
          index,
          original: char,
          detail: `${code} XOR ${keyCode} = ${xorValue} (${JSON.stringify(transformed)})`,
        });
      });

      return { result, steps };
    },
  },
};

const CryptoPlayground = () => {
  const [mode, setMode] = useState("hash");
  const [hashAlgorithm, setHashAlgorithm] = useState("djb2");
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("caesar");
  const [inputText, setInputText] = useState("Algorithm Playground");
  const [parameter, setParameter] = useState(ENCRYPTION_ALGORITHMS.caesar.defaultParameter);

  useEffect(() => {
    if (mode === "encrypt") {
      const metadata = ENCRYPTION_ALGORITHMS[encryptionAlgorithm];
      setParameter(metadata.defaultParameter);
    }
  }, [mode, encryptionAlgorithm]);

  const hashResult = useMemo(() => {
    if (mode !== "hash") {
      return null;
    }
    const algorithm = HASH_ALGORITHMS[hashAlgorithm];
    return algorithm.compute(inputText);
  }, [mode, hashAlgorithm, inputText]);

  const encryptionResult = useMemo(() => {
    if (mode !== "encrypt") {
      return null;
    }
    const algorithm = ENCRYPTION_ALGORITHMS[encryptionAlgorithm];
    return algorithm.compute(inputText, parameter);
  }, [mode, encryptionAlgorithm, inputText, parameter]);

  const activeMetadata = mode === "hash"
    ? HASH_ALGORITHMS[hashAlgorithm]
    : ENCRYPTION_ALGORITHMS[encryptionAlgorithm];

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full max-w-xs space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">해시 & 암호화 연구실</h2>
            <p className="mt-2 text-sm text-slate-600">
              문자열이 해시 함수와 암호화 알고리즘을 거치며 어떻게 변형되는지 단계별로 살펴보세요.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                mode === "hash" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"
              }`}
              onClick={() => setMode("hash")}
            >
              해시 함수
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                mode === "encrypt" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700"
              }`}
              onClick={() => setMode("encrypt")}
            >
              암호화
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              알고리즘
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={mode === "hash" ? hashAlgorithm : encryptionAlgorithm}
              onChange={(event) => {
                if (mode === "hash") {
                  setHashAlgorithm(event.target.value);
                } else {
                  setEncryptionAlgorithm(event.target.value);
                }
              }}
            >
              {Object.entries(mode === "hash" ? HASH_ALGORITHMS : ENCRYPTION_ALGORITHMS).map(
                ([id, item]) => (
                  <option key={id} value={id}>
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          <textarea
            className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="문자열을 입력하세요"
          />

          {mode === "encrypt" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">추가 매개변수</p>
              {activeMetadata.parameterType === "number" ? (
                <input
                  type="number"
                  value={parameter}
                  onChange={(event) => setParameter(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              ) : (
                <input
                  type="text"
                  value={parameter}
                  onChange={(event) => setParameter(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              )}
              <p>
                {activeMetadata.parameterLabel}: {parameter}
              </p>
            </div>
          )}

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            {activeMetadata.description}
          </p>
        </aside>

        <div className="flex-1 space-y-4">
          <ResultPanel
            mode={mode}
            hashResult={hashResult}
            encryptionResult={encryptionResult}
            algorithmLabel={activeMetadata.label}
          />
        </div>
      </div>
    </section>
  );
};

const ResultPanel = ({ mode, hashResult, encryptionResult, algorithmLabel }) => {
  if (mode === "hash" && hashResult) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{algorithmLabel} 결과</p>
          <p className="mt-1 font-mono text-base text-sky-600">{hashResult.result}</p>
        </div>
        <HashStepsTable steps={hashResult.steps} />
      </div>
    );
  }

  if (mode === "encrypt" && encryptionResult) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{algorithmLabel} 결과</p>
          <p className="mt-1 font-mono text-base text-sky-600">{encryptionResult.result}</p>
        </div>
        <EncryptionStepsTable steps={encryptionResult.steps} />
      </div>
    );
  }

  return null;
};

const HashStepsTable = ({ steps }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-600">
      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-3 py-2 text-left">Index</th>
          <th className="px-3 py-2 text-left">문자</th>
          <th className="px-3 py-2 text-left">코드</th>
          <th className="px-3 py-2 text-left">이전 해시</th>
          <th className="px-3 py-2 text-left">공식</th>
          <th className="px-3 py-2 text-left">새 해시</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {steps.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
              (문자가 없습니다)
            </td>
          </tr>
        ) : (
          steps.map((step) => (
            <tr key={step.index}>
              <td className="px-3 py-2 font-mono">{step.index}</td>
              <td className="px-3 py-2 font-mono">{JSON.stringify(step.char)}</td>
              <td className="px-3 py-2 font-mono">{step.code}</td>
              <td className="px-3 py-2 font-mono">{step.before}</td>
              <td className="px-3 py-2 font-mono">{step.formula}</td>
              <td className="px-3 py-2 font-mono text-sky-600">{step.after}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const EncryptionStepsTable = ({ steps }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-600">
      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-3 py-2 text-left">Index</th>
          <th className="px-3 py-2 text-left">변환</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {steps.length === 0 ? (
          <tr>
            <td colSpan={2} className="px-3 py-4 text-center text-slate-400">
              (변환할 문자가 없습니다)
            </td>
          </tr>
        ) : (
          steps.map((step) => (
            <tr key={step.index}>
              <td className="px-3 py-2 font-mono">{step.index}</td>
              <td className="px-3 py-2 font-mono">{step.detail}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default CryptoPlayground;

