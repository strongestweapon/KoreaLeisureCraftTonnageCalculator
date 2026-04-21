// 동력수상레저기구 총톤수 계산 (대한민국 「선박톤수의 측정에 관한 규칙」 기반)
// - 제19조 제1항: 선체 기본 용적
// - 제19조 제2항: 측정길이 전후단 돌출부 가산
// - 제9조: 국제총톤수 t = K1 × V,   K1 = 0.2 + 0.02·log10(V)
// - 제35조: 국내 총톤수 환산계수 k1 (t 구간별)

export type Dimensions = {
  L: number;       // 측정길이 [m]
  Dm: number;      // 중앙부 형깊이 [m]
  Ds: number;      // 중앙에서 양단 연결선까지 수직거리 [m]
  C: number;       // 캠버 높이 [m]

  sailing: boolean; // 범선 모드 여부
  B_max: number;    // 선체 최광부 너비 [m] (비범선은 이 값이 곧 B)
  B_25: number;     // 범선: F.P.로부터 L의 25% 뒤 위치 최대너비 [m]
  B_75: number;     // 범선: F.P.로부터 L의 75% 뒤 위치 최대너비 [m]
};

// 제19조 1항 단서: 범선이고 (B25+B75) ≤ 1.5·Bmax 이면 (B25+B75)/2 를 B로 사용, 아니면 Bmax.
export function effectiveB(d: Dimensions): { B: number; rule: 'avg' | 'max' | 'motor' } {
  if (!d.sailing) return { B: d.B_max, rule: 'motor' };
  const sum = d.B_25 + d.B_75;
  if (sum > 0 && sum <= 1.5 * d.B_max) {
    return { B: sum / 2, rule: 'avg' };
  }
  return { B: d.B_max, rule: 'max' };
}

// 상갑판 상부 구조물 or 19조 2항 돌출부 (직육면체 근사)
export type Box = {
  id: string;
  name: string;       // 예: "선수루", "갑판실 A", "콕핏" 등
  length: number;     // 최대길이 [m]
  breadth: number;    // 평균너비 [m]
  depth: number;      // 평균깊이 [m]
  kind: 'enclosed' | 'excluded'; // 폐위 | 제외
};

export type Inputs = {
  dims: Dimensions;
  addedParts: Box[];       // 제19조 2항 (선수·선미 돌출부) — 무조건 폐위로 더함
  upperStructures: Box[];  // 상갑판 상부 (선수루/선교루/선미루/갑판실/기타) + 폐위/제외
};

export type Calculation = {
  V_hull: number;            // 19조 1항 본체 용적
  V_added: number;           // 19조 2항 돌출부 용적 합
  V_underDeck: number;       // 상갑판 하부 합계 (hull + added)
  V_upperEnclosed: number;   // 상갑판 상부 폐위 합
  V_upperExcluded: number;   // 상갑판 상부 제외 합
  V_enclosedTotal: number;   // 전체 폐위장소 합계
  V_excludedTotal: number;   // 전체 제외장소 합계
  V: number;                 // V = 폐위합계 − 제외합계
  K1: number;                // 0.2 + 0.02·log10(V)
  t: number;                 // 국제총톤수 = K1·V
  k1: number;                // 국내 환산계수
  GT: number;                // 최종 총톤수 = t·k1
  bracket: number;           // 19조1항 중괄호 안쪽 값 (디버그용)
  B_effective: number;       // 실제 적용된 B [m]
  B_rule: 'avg' | 'max' | 'motor'; // 적용 규칙
};

// 제19조 1항 중괄호 안쪽: Dm + (2/3)C + (1/3)(Ds − Dm)
export function bracket19({ Dm, Ds, C }: Dimensions): number {
  return Dm + (2 / 3) * C + (1 / 3) * (Ds - Dm);
}

// 제19조 1항: 0.65 × L × B × { ... }
export function hullVolume(dims: Dimensions): number {
  const { L } = dims;
  const { B } = effectiveB(dims);
  return 0.65 * L * B * bracket19(dims);
}

export function boxVolume(b: Box): number {
  return b.length * b.breadth * b.depth;
}

// 제9조: K1 = 0.2 + 0.02·log10(V), t = K1·V
export function computeK1(V: number): number {
  if (V <= 0) return 0;
  return 0.2 + 0.02 * Math.log10(V);
}

// 제35조: 국내 총톤수 환산계수 k1
//  t ≥ 4000         → 1
//  30 ≤ t < 4000    → (0.6 + t/10000)
//  t < 30           → (0.6 + t/10000) × (1 + (30−t)/180)
export function computeK1Coefficient(t: number): number {
  if (t >= 4000) return 1;
  const f1 = 0.6 + t / 10000;
  if (t >= 30) return f1;
  const f2 = 1 + (30 - t) / 180;
  return f1 * f2;
}

export function calculate(inputs: Inputs): Calculation {
  const { dims, addedParts, upperStructures } = inputs;

  const V_hull = hullVolume(dims);
  const V_added = addedParts.reduce((s, b) => s + boxVolume(b), 0);
  const V_underDeck = V_hull + V_added;

  const V_upperEnclosed = upperStructures
    .filter((b) => b.kind === 'enclosed')
    .reduce((s, b) => s + boxVolume(b), 0);

  const V_upperExcluded = upperStructures
    .filter((b) => b.kind === 'excluded')
    .reduce((s, b) => s + boxVolume(b), 0);

  // 상갑판 하부 용적은 전부 "폐위장소"로 취급 (DTC-1 서식 기준)
  const V_enclosedTotal = V_underDeck + V_upperEnclosed;
  const V_excludedTotal = V_upperExcluded;

  const V = Math.max(0, V_enclosedTotal - V_excludedTotal);
  const K1 = computeK1(V);
  const t = K1 * V;
  const k1 = computeK1Coefficient(t);
  const GT = t * k1;

  const eb = effectiveB(dims);

  return {
    V_hull,
    V_added,
    V_underDeck,
    V_upperEnclosed,
    V_upperExcluded,
    V_enclosedTotal,
    V_excludedTotal,
    V,
    K1,
    t,
    k1,
    GT,
    bracket: bracket19(dims),
    B_effective: eb.B,
    B_rule: eb.rule,
  };
}
