import { useEffect, useMemo, useState } from "react";

const OSI_LAYERS = [
  {
    id: "application",
    name: "7. 애플리케이션 계층",
    pdu: "데이터",
    summary:
      "사용자 요청을 구체적인 애플리케이션 프로토콜 메시지로 변환합니다.",
  },
  {
    id: "presentation",
    name: "6. 표현 계층",
    pdu: "데이터",
    summary:
      "데이터 형식을 정규화하고 필요하다면 압축·암호화를 수행합니다.",
  },
  {
    id: "session",
    name: "5. 세션 계층",
    pdu: "데이터",
    summary: "통신 세션을 생성하고 동기화·유지를 담당합니다.",
  },
  {
    id: "transport",
    name: "4. 전송 계층",
    pdu: "세그먼트/데이터그램",
    summary:
      "종단 간 연결을 제어하며 포트 번호와 전송 방식을 캡슐화합니다.",
  },
  {
    id: "network",
    name: "3. 네트워크 계층",
    pdu: "패킷",
    summary: "IP 주소를 기반으로 최종 목적지를 선택하여 라우팅합니다.",
  },
  {
    id: "dataLink",
    name: "2. 데이터 링크 계층",
    pdu: "프레임",
    summary: "같은 링크 내에서 MAC 주소와 오류 제어를 제공합니다.",
  },
  {
    id: "physical",
    name: "1. 물리 계층",
    pdu: "비트",
    summary: "전기·광·무선 신호로 비트를 전송합니다.",
  },
];

const OSI_SCENARIOS = {
  web: {
    label: "HTTP 웹 요청",
    description:
      "브라우저가 HTML 페이지를 요청하는 상황에서 패킷이 어떻게 변하는지 살펴봅니다.",
    defaultMessage:
      "GET /playground HTTP/1.1\nHost: example.com\nUser-Agent: AQAH/1.0\n\n",
    applicationProtocol: "HTTP/1.1",
    presentation: {
      plaintext: "UTF-8 텍스트",
      encrypted: "TLS 1.3",
    },
    session: {
      persistent: "HTTP keep-alive로 동일한 연결을 유지합니다.",
      stateless: "요청마다 새로운 연결을 생성합니다.",
    },
    transport: {
      options: ["tcp"],
      ports: { source: 54832, destination: 80 },
    },
    network: {
      sourceIp: "192.168.0.24",
      destinationIp: "151.101.1.140",
    },
    dataLink: {
      sourceMac: "02:42:ac:11:00:02",
      destinationMac: "7c:2f:80:1b:99:aa",
      protocol: "Ethernet II",
    },
    physical: "CAT6 구리선 — 전기 신호",
    defaults: {
      transportProtocol: "tcp",
      useEncryption: false,
      useCompression: false,
      maintainSession: true,
    },
    supports: {
      encryption: true,
      compression: true,
      session: true,
    },
  },
  https: {
    label: "HTTPS API 호출",
    description:
      "TLS 위에서 JSON API 요청을 보낼 때 캡슐화/역캡슐화 흐름을 확인합니다.",
    defaultMessage:
      "POST /api/login HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n{\n  \"email\": \"user@example.com\",\n  \"password\": \"hunter2\"\n}\n",
    applicationProtocol: "HTTPS",
    presentation: {
      plaintext: "JSON (UTF-8)",
      encrypted: "TLS 1.3 (AES-128-GCM)",
    },
    session: {
      persistent: "TLS 세션 재개로 지연을 줄입니다.",
      stateless: "요청마다 핸드셰이크를 새로 수행합니다.",
    },
    transport: {
      options: ["tcp"],
      ports: { source: 51344, destination: 443 },
    },
    network: {
      sourceIp: "10.0.0.5",
      destinationIp: "172.67.142.21",
    },
    dataLink: {
      sourceMac: "d2:71:34:8c:12:ff",
      destinationMac: "3c:52:82:b1:7d:10",
      protocol: "Ethernet II",
    },
    physical: "광섬유 — 광 신호",
    defaults: {
      transportProtocol: "tcp",
      useEncryption: true,
      useCompression: true,
      maintainSession: true,
    },
    supports: {
      encryption: true,
      compression: true,
      session: true,
    },
  },
  dns: {
    label: "DNS 조회",
    description:
      "UDP 기반 DNS 쿼리가 전송되고 응답이 되돌아오는 경로를 따라갑니다.",
    defaultMessage: "example.com A IN",
    applicationProtocol: "DNS Query",
    presentation: {
      plaintext: "DNS 질의 포맷",
      encrypted: "DoH/DoT",
    },
    session: {
      persistent: "(사용하지 않음)",
      stateless: "각 요청은 독립적으로 처리됩니다.",
    },
    transport: {
      options: ["udp", "tcp"],
      ports: { source: 50623, destination: 53 },
    },
    network: {
      sourceIp: "192.168.0.11",
      destinationIp: "8.8.8.8",
    },
    dataLink: {
      sourceMac: "e4:16:2d:4a:17:01",
      destinationMac: "00:1a:11:ff:ac:33",
      protocol: "802.11 Data",
    },
    physical: "무선 전파 (802.11ac)",
    defaults: {
      transportProtocol: "udp",
      useEncryption: false,
      useCompression: false,
      maintainSession: false,
    },
    supports: {
      encryption: false,
      compression: false,
      session: false,
    },
  },
};

const TRANSPORT_LABELS = {
  tcp: "TCP",
  udp: "UDP",
};

const buildEncapsulationSteps = (
  scenario,
  message,
  { transportProtocol, useEncryption, useCompression, maintainSession }
) => {
  const steps = [];
  let payload = message.trim() ? message : "(빈 메시지)";

  OSI_LAYERS.forEach((layer) => {
    const { description, payloadAfter, header, annotation } =
      applyLayerTransformation(layer.id, scenario, {
        payload,
        transportProtocol,
        useEncryption,
        useCompression,
        maintainSession,
      });

    steps.push({
      layer,
      action: "encapsulation",
      description,
      header,
      payloadBefore: payload,
      payloadAfter,
      annotation,
    });

    payload = payloadAfter;
  });

  return steps;
};

const applyLayerTransformation = (
  layerId,
  scenario,
  { payload, transportProtocol, useEncryption, useCompression, maintainSession }
) => {
  switch (layerId) {
    case "application": {
      const header = `${scenario.applicationProtocol} 메시지`;
      return {
        description: `사용자 입력을 ${scenario.applicationProtocol} 형식으로 구성합니다.`,
        header,
        annotation: scenario.description,
        payloadAfter: `${header}\n${payload}`,
      };
    }
    case "presentation": {
      const operations = [];
      if (useCompression && scenario.supports.compression) {
        operations.push("압축");
      }
      if (useEncryption && scenario.supports.encryption) {
        operations.push("암호화");
      }
      const annotation = operations.length
        ? `${operations.join(" 및 ")} 수행`
        : "변환 없음";
      const header = operations.includes("암호화")
        ? scenario.presentation.encrypted
        : scenario.presentation.plaintext;
      return {
        description: "표현 계층에서 데이터 형식을 맞추고 필요 시 보안을 적용합니다.",
        header,
        annotation,
        payloadAfter: `${header}\n${payload}`,
      };
    }
    case "session": {
      const annotation = maintainSession && scenario.supports.session
        ? scenario.session.persistent
        : scenario.session.stateless;
      const header = maintainSession && scenario.supports.session
        ? "세션 ID + 동기화 정보"
        : "세션 정보 없음";
      return {
        description: "세션을 설정하거나 상태 없이 요청을 전달합니다.",
        header,
        annotation,
        payloadAfter:
          maintainSession && scenario.supports.session
            ? `${header}\n${payload}`
            : payload,
      };
    }
    case "transport": {
      const ports = scenario.transport.ports;
      const header = `${TRANSPORT_LABELS[transportProtocol]} 헤더 (포트 ${ports.source} → ${ports.destination})`;
      const reliability =
        transportProtocol === "tcp"
          ? "신뢰성과 순서 보장을 제공합니다."
          : "연결 설정 없이 빠르게 전달합니다.";
      const pdu = `${header}\n${payload}`;
      return {
        description: "전송 계층이 포트 번호와 전송 방식을 지정해 종단 간 연결을 만듭니다.",
        header,
        annotation: reliability,
        payloadAfter: pdu,
      };
    }
    case "network": {
      const header = `IP 헤더 (${scenario.network.sourceIp} → ${scenario.network.destinationIp})`;
      return {
        description: "네트워크 계층이 IP 주소를 붙여 라우팅할 준비를 합니다.",
        header,
        annotation: "라우팅 테이블에 따라 다음 홉을 선택합니다.",
        payloadAfter: `${header}\n${payload}`,
      };
    }
    case "dataLink": {
      const header = `${scenario.dataLink.protocol} 프레임 헤더 (${scenario.dataLink.sourceMac} → ${scenario.dataLink.destinationMac})`;
      return {
        description: "링크 계층이 MAC 주소와 오류 검출 정보를 추가합니다.",
        header,
        annotation: "같은 네트워크 구간에서만 유효한 주소입니다.",
        payloadAfter: `${header}\n${payload}`,
      };
    }
    case "physical": {
      const annotation = scenario.physical;
      return {
        description: "물리 계층에서 전기·광 신호로 비트를 실어 보냅니다.",
        header: "신호 파형",
        annotation,
        payloadAfter: `신호 (${annotation})\n${payload}`,
      };
    }
    default:
      return {
        description: "",
        header: "",
        annotation: "",
        payloadAfter: payload,
      };
  }
};

const buildReturnSteps = (forwardSteps) =>
  forwardSteps
    .slice()
    .reverse()
    .map((step) => ({
      ...step,
      action: "decapsulation",
      payloadBefore: step.payloadAfter,
      payloadAfter: step.payloadBefore,
      description: `${step.layer.name.replace(/^[0-9]. /, "")}에서 상위 계층으로 올리며 캡슐을 제거합니다.`,
    }));

const StepCard = ({ step, index, active }) => {
  if (!step) {
    return null;
  }

  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${
        active
          ? "border-sky-400 bg-sky-50 shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          STEP {index + 1} · {step.action === "encapsulation" ? "캡슐화" : "역캡슐화"}
        </p>
        <h3 className="text-lg font-semibold text-slate-900">{step.layer.name}</h3>
      </div>
      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
        {step.layer.pdu}
      </span>
    </header>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
    <dl className="mt-4 space-y-2 text-sm">
      <div>
        <dt className="font-medium text-slate-800">헤더</dt>
        <dd className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">
          {step.header}
        </dd>
      </div>
      <div>
        <dt className="font-medium text-slate-800">부가 설명</dt>
        <dd className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          {step.annotation}
        </dd>
      </div>
      <div>
        <dt className="font-medium text-slate-800">입력</dt>
        <dd className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 whitespace-pre-wrap">
          {step.payloadBefore}
        </dd>
      </div>
      <div>
        <dt className="font-medium text-slate-800">출력</dt>
        <dd className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 whitespace-pre-wrap">
          {step.payloadAfter}
        </dd>
      </div>
    </dl>
    </article>
  );
};

const StepTimeline = ({ steps, activeIndex }) => (
  <ol className="flex flex-wrap gap-2 text-xs text-slate-500">
    {steps.map((step, index) => (
      <li
        key={`${step.layer.id}-${step.action}-timeline`}
        className={`rounded-full border px-3 py-1 ${
          index === activeIndex
            ? "border-sky-400 bg-sky-50 text-sky-600"
            : "border-slate-200 bg-white"
        }`}
      >
        {index + 1}. {step.layer.name.replace(/^[0-9]. /, "")}
      </li>
    ))}
  </ol>
);

const OSIPlayground = () => {
  const [scenarioId, setScenarioId] = useState("web");
  const scenario = OSI_SCENARIOS[scenarioId];

  const [message, setMessage] = useState(scenario.defaultMessage);
  const [transportProtocol, setTransportProtocol] = useState(
    scenario.defaults.transportProtocol
  );
  const [useEncryption, setUseEncryption] = useState(
    scenario.defaults.useEncryption
  );
  const [useCompression, setUseCompression] = useState(
    scenario.defaults.useCompression
  );
  const [maintainSession, setMaintainSession] = useState(
    scenario.defaults.maintainSession
  );
  const [direction, setDirection] = useState("forward");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const nextScenario = OSI_SCENARIOS[scenarioId];
    setMessage(nextScenario.defaultMessage);
    setTransportProtocol(nextScenario.defaults.transportProtocol);
    setUseEncryption(nextScenario.defaults.useEncryption);
    setUseCompression(nextScenario.defaults.useCompression);
    setMaintainSession(nextScenario.defaults.maintainSession);
    setStepIndex(0);
    setDirection("forward");
    setIsPlaying(false);
  }, [scenarioId]);

  const forwardSteps = useMemo(
    () =>
      buildEncapsulationSteps(scenario, message, {
        transportProtocol,
        useEncryption,
        useCompression,
        maintainSession,
      }),
    [scenario, message, transportProtocol, useEncryption, useCompression, maintainSession]
  );

  const returnSteps = useMemo(
    () => buildReturnSteps(forwardSteps),
    [forwardSteps]
  );

  const activeSteps = direction === "forward" ? forwardSteps : returnSteps;

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [direction, forwardSteps.length]);

  const finalPayload = forwardSteps[forwardSteps.length - 1]?.payloadAfter;

  const handleToggleDirection = (nextDirection) => {
    setDirection(nextDirection);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const activeStep = activeSteps[stepIndex] ?? activeSteps[0];

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (activeSteps.length <= 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= activeSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, activeSteps]);

  const handleStepChange = (value) => {
    setIsPlaying(false);
    setStepIndex(value);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">OSI 7계층 패킷 여정</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              시나리오를 선택하고 옵션을 조정한 뒤, 송신(7→1)과 수신(1→7) 과정을
              단계별로 따라가 보세요.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                시나리오
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={scenarioId}
                onChange={(event) => setScenarioId(event.target.value)}
              >
                {Object.entries(OSI_SCENARIOS).map(([id, value]) => (
                  <option key={id} value={id}>
                    {value.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">{scenario.description}</p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                메시지
              </label>
              <textarea
                className="mt-1 h-32 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  전송 계층
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={transportProtocol}
                  onChange={(event) => setTransportProtocol(event.target.value)}
                >
                  {scenario.transport.options.map((option) => (
                    <option key={option} value={option}>
                      {TRANSPORT_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              <ToggleControl
                label="암호화"
                description={
                  scenario.supports.encryption
                    ? "TLS와 같은 암호화를 적용합니다."
                    : "이 시나리오는 암호화를 지원하지 않습니다."
                }
                enabled={useEncryption}
                onToggle={() =>
                  scenario.supports.encryption && setUseEncryption((prev) => !prev)
                }
                disabled={!scenario.supports.encryption}
              />

              <ToggleControl
                label="압축"
                description={
                  scenario.supports.compression
                    ? "전송량을 줄이기 위해 메시지를 압축합니다."
                    : "이 시나리오는 압축을 지원하지 않습니다."
                }
                enabled={useCompression}
                onToggle={() =>
                  scenario.supports.compression && setUseCompression((prev) => !prev)
                }
                disabled={!scenario.supports.compression}
              />

              <ToggleControl
                label="세션 유지"
                description={
                  scenario.supports.session
                    ? "동일한 연결을 유지해 오버헤드를 줄입니다."
                    : "상태 없는 프로토콜입니다."
                }
                enabled={maintainSession}
                onToggle={() =>
                  scenario.supports.session &&
                  setMaintainSession((prev) => !prev)
                }
                disabled={!scenario.supports.session}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">최종 전송 단위</p>
            <p className="mt-1 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
              {finalPayload}
            </p>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <button
                className={`rounded-full px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  direction === "forward"
                    ? "bg-sky-500 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => handleToggleDirection("forward")}
              >
                송신 7→1
              </button>
              <button
                className={`rounded-full px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  direction === "return"
                    ? "bg-sky-500 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => handleToggleDirection("return")}
              >
                수신 1→7
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition ${
                  isPlaying ? "bg-rose-500 hover:bg-rose-600" : "bg-sky-500 hover:bg-sky-600"
                }`}
                onClick={() => setIsPlaying((prev) => !prev)}
                disabled={activeSteps.length <= 1}
              >
                {isPlaying ? "일시정지" : "자동 재생"}
              </button>
              <span className="font-medium text-slate-700">단계</span>
              <input
                type="range"
                min={0}
                max={Math.max(activeSteps.length - 1, 0)}
                value={stepIndex}
                onChange={(event) => handleStepChange(Number(event.target.value))}
                className="w-40 accent-sky-500"
              />
              <span className="font-medium text-slate-700">
                {stepIndex + 1} / {activeSteps.length}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="max-h-[420px] overflow-y-auto pr-1">
              {activeStep && <StepCard step={activeStep} index={stepIndex} active />}
            </div>
            <StepTimeline steps={activeSteps} activeIndex={stepIndex} />
          </div>
        </div>
      </div>

      {activeStep && (
        <footer className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">
            현재 단계 요약 — {activeStep.layer.name}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
            {activeStep.payloadAfter}
          </p>
        </footer>
      )}
    </section>
  );
};

const ToggleControl = ({ label, description, enabled, onToggle, disabled }) => (
  <button
    type="button"
    className={`flex w-full items-start justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
      enabled ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white"
    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    onClick={onToggle}
    disabled={disabled}
  >
    <span>
      <span className="block font-semibold text-slate-800">{label}</span>
      <span className="mt-0.5 block text-xs text-slate-600">{description}</span>
    </span>
    <span
      className={`mt-1 inline-flex h-5 w-9 items-center rounded-full border ${
        enabled ? "border-sky-400 bg-sky-500" : "border-slate-300 bg-slate-200"
      }`}
    >
      <span
        className={`ml-1 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
  </button>
);

export default OSIPlayground;
