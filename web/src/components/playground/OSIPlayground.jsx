import { useEffect, useMemo, useState } from "react";

const OSI_LAYERS = [
  {
    id: "application",
    name: "7. 애플리케이션 계층",
    unit: "데이터",
    summary:
      "사용자와 가장 가까운 계층으로, 실제 서비스 요청과 응답이 만들어집니다.",
  },
  {
    id: "presentation",
    name: "6. 표현 계층",
    unit: "데이터",
    summary:
      "전송 가능한 형태로 데이터 포맷을 변환하고 암호화·압축 작업을 수행합니다.",
  },
  {
    id: "session",
    name: "5. 세션 계층",
    unit: "데이터",
    summary:
      "통신 세션을 열고 닫으며, 대화 제어와 동기화를 담당합니다.",
  },
  {
    id: "transport",
    name: "4. 전송 계층",
    unit: "세그먼트/데이터그램",
    summary:
      "종단 간 전송을 담당하며 신뢰성, 흐름 제어, 분할/재조립을 처리합니다.",
  },
  {
    id: "network",
    name: "3. 네트워크 계층",
    unit: "패킷",
    summary: "경로를 선택하고 IP 주소를 사용해 목적지까지 패킷을 전달합니다.",
  },
  {
    id: "dataLink",
    name: "2. 데이터 링크 계층",
    unit: "프레임",
    summary:
      "같은 네트워크 구간 내에서 오류 검출과 재전송을 담당하며 MAC 주소로 통신합니다.",
  },
  {
    id: "physical",
    name: "1. 물리 계층",
    unit: "비트",
    summary: "전기·광 신호 등 물리적인 매체를 통해 비트를 전달합니다.",
  },
];

const OSI_SCENARIOS = {
  web: {
    label: "HTTP 웹 요청",
    description:
      "브라우저가 웹 서버에 HTML 페이지를 요청하는 전형적인 흐름을 따라가 봅니다.",
    defaultMessage:
      "GET /playground HTTP/1.1\nHost: example.com\nUser-Agent: AQAH/1.0\nAccept: text/html\n\n",
    applicationProtocol: "HTTP/1.1",
    ports: { source: 54832, destination: 80 },
    addresses: {
      sourceIp: "192.168.0.24",
      destinationIp: "151.101.1.140",
      sourceMac: "02:42:ac:11:00:02",
      destinationMac: "7c:2f:80:1b:99:aa",
    },
    dataLinkProtocol: "Ethernet II",
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
      transport: ["tcp"],
    },
    presentationProtocols: {
      plaintext: "UTF-8 텍스트",
      encrypted: "TLS 1.3 (HTTPS)",
    },
    sessionNotes: {
      persistent: "HTTP keep-alive로 하나의 TCP 연결을 재사용합니다.",
      stateless: "요청마다 연결을 열고 닫는 단순한 HTTP/1.0 스타일.",
    },
    physicalMedium: "CAT6 구리선 — 전기 신호",
  },
  https: {
    label: "HTTPS API 호출",
    description:
      "클라이언트가 TLS 위에서 JSON API 호출을 전송하는 상황을 살펴봅니다.",
    defaultMessage:
      "POST /api/login HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nContent-Length: 48\n\n{\n  \"email\": \"user@example.com\",\n  \"password\": \"hunter2\"\n}\n",
    applicationProtocol: "HTTPS (HTTP/1.1)",
    ports: { source: 51344, destination: 443 },
    addresses: {
      sourceIp: "10.0.0.5",
      destinationIp: "172.67.142.21",
      sourceMac: "d2:71:34:8c:12:ff",
      destinationMac: "3c:52:82:b1:7d:10",
    },
    dataLinkProtocol: "Ethernet II",
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
      transport: ["tcp"],
    },
    presentationProtocols: {
      plaintext: "JSON (UTF-8)",
      encrypted: "TLS 1.3 (AES-128-GCM)",
    },
    sessionNotes: {
      persistent: "세션 재개(PSK)로 핸드셰이크 지연을 줄입니다.",
      stateless: "매 요청마다 새로운 TLS 핸드셰이크를 수행합니다.",
    },
    physicalMedium: "광섬유 — 가시광 신호",
  },
  dns: {
    label: "DNS 조회",
    description:
      "클라이언트가 도메인의 IP 주소를 조회하는 UDP 기반 DNS 쿼리를 재현합니다.",
    defaultMessage: "example.com A IN",
    applicationProtocol: "DNS Query",
    ports: { source: 50623, destination: 53 },
    addresses: {
      sourceIp: "192.168.0.11",
      destinationIp: "8.8.8.8",
      sourceMac: "e4:16:2d:4a:17:01",
      destinationMac: "00:1a:11:ff:ac:33",
    },
    dataLinkProtocol: "802.11 Data",
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
      transport: ["udp", "tcp"],
    },
    presentationProtocols: {
      plaintext: "DNS 질의 포맷",
      encrypted: "DoH/DoT",
    },
    sessionNotes: {
      persistent: "(선택 불가)",
      stateless: "각 DNS 질의는 독립적이며 세션 상태를 유지하지 않습니다.",
    },
    physicalMedium: "무선 전파 (802.11ac)",
  },
};

const TRANSPORT_PROTOCOL_DETAILS = {
  tcp: {
    label: "TCP",
    header: (ports, payloadLength) =>
      `TCP 헤더 (Src ${ports.source} → Dst ${ports.destination}, Seq=${createSequenceNumber(payloadLength)}, Ack 대기)`,
    pdu: "세그먼트",
    notes: [
      "3-way 핸드셰이크와 재전송으로 신뢰성을 보장합니다.",
      "흐름 제어와 혼잡 제어를 통해 네트워크 상태에 적응합니다.",
    ],
    segmentSize: 16,
  },
  udp: {
    label: "UDP",
    header: (ports, payloadLength) =>
      `UDP 헤더 (Src ${ports.source} → Dst ${ports.destination}, 길이=${payloadLength + 8}B)`,
    pdu: "데이터그램",
    notes: [
      "핸드셰이크 없이 빠르게 전송하지만 손실 감지를 애플리케이션에 맡깁니다.",
      "간단한 체크섬만 제공하며 순서 보장은 없습니다.",
    ],
    segmentSize: 24,
  },
};

const createSequenceNumber = (length) => 1000 + length * 3;

const chunkArray = (array, size) => {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
};

const compressCodes = (codes) => {
  if (codes.length <= 4) {
    return [...codes];
  }

  const result = [];
  for (let index = 0; index < codes.length; index += 2) {
    const first = codes[index];
    const second = codes[index + 1] ?? first;
    const averaged = Math.floor((first + second) / 2);
    result.push(averaged);
  }
  return result;
};

const encryptCodes = (codes) =>
  codes.map((code, index) => ((code + 13 + index * 7) % 256));

const toHexBytes = (codes) => codes.map((code) => code.toString(16).padStart(2, "0"));

const toBinaryBytes = (codes) => codes.map((code) => code.toString(2).padStart(8, "0"));

const truncate = (value, maxLength = 80) => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}…`;
};

const buildOsiFrames = (scenario, message, options) => {
  const cleanedMessage = message.trim() ? message : scenario.defaultMessage;
  const applicationLines = cleanedMessage.split("\n");
  const requestLine = applicationLines[0] ?? cleanedMessage;

  const baseCodes = Array.from(cleanedMessage).map((char) => char.charCodeAt(0));
  const processedCodes = (() => {
    const compressed = options.useCompression ? compressCodes(baseCodes) : baseCodes;
    const encrypted = options.useEncryption ? encryptCodes(compressed) : compressed;
    return encrypted;
  })();

  const hexBytes = toHexBytes(processedCodes);
  const binaryBytes = toBinaryBytes(processedCodes);
  const payloadLength = processedCodes.length;

  const transportDetails =
    TRANSPORT_PROTOCOL_DETAILS[options.transportProtocol] ?? TRANSPORT_PROTOCOL_DETAILS.tcp;
  const segments = chunkArray(hexBytes, transportDetails.segmentSize);

  const presentationProtocol = options.useEncryption
    ? scenario.presentationProtocols.encrypted
    : scenario.presentationProtocols.plaintext;

  const hasSession = Boolean(scenario.supports.session);
  const sessionDescription = hasSession
    ? options.maintainSession
      ? scenario.sessionNotes.persistent
      : scenario.sessionNotes.stateless
    : scenario.sessionNotes.stateless;

  const networkHeader = `IP 헤더 (Src ${scenario.addresses.sourceIp} → Dst ${scenario.addresses.destinationIp})`;
  const dataLinkHeader = `${scenario.dataLinkProtocol} 헤더 (Src ${scenario.addresses.sourceMac} → Dst ${scenario.addresses.destinationMac})`;

  const bitsPreview = truncate(binaryBytes.join(" "));
  const hexPreview = truncate(hexBytes.join(" "));

  return OSI_LAYERS.map((layer, index) => {
    switch (layer.id) {
      case "application":
        return {
          ...layer,
          protocol: scenario.applicationProtocol,
          transformation: "사용자가 작성한 요청을 애플리케이션 프로토콜 형식에 맞춰 구성합니다.",
          payload: cleanedMessage,
          header: "없음",
          trailer: "없음",
          notes: [
            `요청 라인: ${requestLine}`,
            `총 ${cleanedMessage.length}자의 데이터가 준비되었습니다.`,
            scenario.description,
          ],
        };
      case "presentation":
        return {
          ...layer,
          protocol: presentationProtocol,
          transformation: options.useCompression
            ? "데이터를 압축한 뒤 필요 시 암호화하여 전송 크기를 줄입니다."
            : options.useEncryption
            ? "데이터를 암호화하여 전송 중 기밀성을 보장합니다."
            : "데이터 포맷(문자 인코딩 등)을 전송 가능한 형태로 맞춥니다.",
          payload: options.useEncryption
            ? `암호화된 바이트: ${hexPreview}`
            : `헥스 바이트: ${hexPreview}`,
          header: "없음",
          trailer: "없음",
          notes: [
            options.useCompression
              ? `압축으로 ${baseCodes.length}B → ${processedCodes.length}B (대략 ${Math.round((processedCodes.length / Math.max(baseCodes.length, 1)) * 100)}%)`
              : "압축 없이 원본 크기를 유지합니다.",
            options.useEncryption ? "암호화 키 교환은 세션 계층에서 수행됩니다." : "암호화가 비활성화되어 있어 페이로드는 평문입니다.",
          ],
        };
      case "session":
        if (!hasSession) {
          return {
            ...layer,
            protocol: "세션 계층 미사용",
            transformation: "이 통신은 세션 상태를 저장하지 않고 전송 계층으로 바로 전달됩니다.",
            payload: "세션 캡슐화 생략",
            header: "없음",
            trailer: "없음",
            notes: [
              "이 시나리오는 세션 상태를 보존하지 않습니다.",
              "응용 계층 데이터가 전송 계층으로 직접 전달됩니다.",
            ],
          };
        }
        return {
          ...layer,
          protocol: options.maintainSession ? "지속 세션" : "단기 세션",
          transformation: "통신 양 끝단 사이의 대화 상태를 설정하고 동기화합니다.",
          payload: options.maintainSession
            ? "세션 ID, 암호화 키 자료, 상태 체크포인트"
            : "세션 상태 없이 단발성 요청으로 전송",
          header: "세션 제어 정보",
          trailer: "없음",
          notes: [sessionDescription, "세션이 종료되면 전송 계층 연결도 해제됩니다."],
        };
      case "transport":
        return {
          ...layer,
          protocol: transportDetails.label,
          transformation:
            "전송 단위를 분할하고 헤더를 추가하여 종단 간 전달 준비를 마칩니다.",
          payload: `${transportDetails.pdu} ${segments
            .map((segment, segmentIndex) => `#${segmentIndex + 1}`)
            .join(", ")}`,
          header: transportDetails.header(scenario.ports, payloadLength),
          trailer: "없음",
          notes: [
            ...transportDetails.notes,
            `${segments.length}개의 ${transportDetails.pdu}로 페이로드를 분할했습니다.`,
          ],
        };
      case "network":
        return {
          ...layer,
          protocol: scenario.addresses.destinationIp.includes(":") ? "IPv6" : "IPv4",
          transformation: "목적지까지의 경로를 선택하고 패킷에 논리 주소를 부여합니다.",
          payload: `${segments.length}개 ${transportDetails.pdu} → 패킷`,
          header: networkHeader,
          trailer: "없음",
          notes: [
            `라우팅 테이블을 기반으로 다음 홉을 선택합니다.`,
            `TTL를 감소시키며 전달합니다.`,
          ],
        };
      case "dataLink":
        return {
          ...layer,
          protocol: scenario.dataLinkProtocol,
          transformation: "동일 네트워크 구간에서 프레임 단위로 전달되도록 캡슐화합니다.",
          payload: `IP 패킷 → 프레임 (${segments.length}개 ${transportDetails.pdu} 포함)`,
          header: dataLinkHeader,
          trailer: "FCS (CRC-32)",
          notes: [
            "MAC 주소를 사용하여 목적지 장치를 식별합니다.",
            "프레임 체크 시퀀스로 오류를 탐지합니다.",
          ],
        };
      case "physical":
        return {
          ...layer,
          protocol: scenario.physicalMedium,
          transformation: "프레임을 비트 스트림으로 변환하여 실제 매체로 전송합니다.",
          payload: `비트 스트림 미리보기: ${bitsPreview}`,
          header: "없음",
          trailer: "없음",
          notes: [
            `총 ${binaryBytes.length}바이트 → ${binaryBytes.length * 8}비트 전송`,
            "클럭 신호에 맞춰 구간별로 전기/광 신호를 방출합니다.",
          ],
        };
      default:
        return layer;
    }
  });
};

const OSIPlayground = () => {
  const [scenarioKey, setScenarioKey] = useState("web");
  const [message, setMessage] = useState(OSI_SCENARIOS.web.defaultMessage);
  const [options, setOptions] = useState(OSI_SCENARIOS.web.defaults);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const scenario = OSI_SCENARIOS[scenarioKey];
    setMessage(scenario.defaultMessage);
    setOptions(scenario.defaults);
    setActiveIndex(0);
  }, [scenarioKey]);

  const scenario = OSI_SCENARIOS[scenarioKey];

  const frames = useMemo(
    () => buildOsiFrames(scenario, message, options),
    [scenario, message, options],
  );

  const activeFrame = frames[activeIndex] ?? frames[0];

  const handleOptionToggle = (key) => {
    setOptions((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleTransportChange = (protocol) => {
    setOptions((previous) => ({
      ...previous,
      transportProtocol: protocol,
    }));
  };

  const encapsulationStack = frames.slice(0, activeIndex + 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-slate-900">OSI 7계층 패킷 시뮬레이션</h2>
          <p className="text-sm text-slate-600">
            {scenario.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(OSI_SCENARIOS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                key === scenarioKey
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => setScenarioKey(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">요청 구성</h3>
            <p className="mt-1 text-xs text-slate-500">
              메시지를 수정하면 계층별 캡슐화 결과가 즉시 갱신됩니다.
            </p>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
              }}
              className="mt-3 h-44 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-800 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scenario.supports.encryption && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <span>프레젠테이션 암호화</span>
                  <input
                    type="checkbox"
                    checked={options.useEncryption}
                    onChange={() => handleOptionToggle("useEncryption")}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                </label>
              )}
              {scenario.supports.compression && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <span>압축 사용</span>
                  <input
                    type="checkbox"
                    checked={options.useCompression}
                    onChange={() => handleOptionToggle("useCompression")}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                </label>
              )}
              {scenario.supports.session && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <span>세션 유지</span>
                  <input
                    type="checkbox"
                    checked={options.maintainSession}
                    onChange={() => handleOptionToggle("maintainSession")}
                    className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                </label>
              )}
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                <span className="font-medium text-slate-800">전송 계층</span>
                <div className="mt-2 flex gap-2">
                  {scenario.supports.transport.map((protocol) => (
                    <button
                      key={protocol}
                      type="button"
                      className={`flex-1 rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                        options.transportProtocol === protocol
                          ? "border-sky-500 bg-sky-100 text-sky-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                      onClick={() => handleTransportChange(protocol)}
                    >
                      {TRANSPORT_PROTOCOL_DETAILS[protocol].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">전송 흐름</h3>
                <p className="text-xs text-slate-500">각 계층을 클릭해 세부 정보를 확인하세요.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
                  disabled={activeIndex === 0}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setActiveIndex((index) => Math.min(index + 1, frames.length - 1))}
                  disabled={activeIndex === frames.length - 1}
                >
                  다음
                </button>
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              {frames.map((frame, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                return (
                  <li key={frame.id}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${
                        isActive
                          ? "border-sky-400 bg-sky-50"
                          : isPast
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-sky-500 text-white"
                            : isPast
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {frames.length - index}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-slate-800">{frame.name}</span>
                        <span className="truncate text-xs text-slate-500">{frame.summary}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{frame.unit}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-4">
            <h3 className="text-sm font-semibold text-slate-800">캡슐화 스택</h3>
            <p className="text-xs text-slate-500">활성 계층까지 누적된 헤더를 확인하세요.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {encapsulationStack.map((frame) => (
                <div
                  key={frame.id}
                  className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-500">
                    {frame.unit}
                  </span>
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {frame.protocol}
                  </span>
                  <span className="truncate text-xs text-slate-500">{frame.header}</span>
                </div>
              ))}
              {encapsulationStack.length === 0 && (
                <p className="text-xs text-slate-500">계층을 선택하면 캡슐화가 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              현재 계층
            </span>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeFrame.name}</h3>
            <p className="text-sm text-slate-600">{activeFrame.summary}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <dl className="space-y-3 text-sm text-slate-700">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  프로토콜
                </dt>
                <dd className="mt-1 font-mono text-sm text-slate-800">{activeFrame.protocol}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">단위</dt>
                <dd className="mt-1 text-sm text-slate-800">{activeFrame.unit}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  변환 과정
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {activeFrame.transformation}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  헤더
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-700">
                  {activeFrame.header ?? "없음"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  트레일러
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-700">
                  {activeFrame.trailer ?? "없음"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  페이로드
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                  {activeFrame.payload}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-800">핵심 포인트</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {activeFrame.notes?.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default OSIPlayground;
