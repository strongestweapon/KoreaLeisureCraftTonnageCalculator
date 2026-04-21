import type { Dimensions } from './tonnage';
import { effectiveB } from './tonnage';

type Props = {
  dims: Dimensions;
  onChange: (d: Dimensions) => void;
};

const VB = { w: 900, h: 520 };
const HULL = {
  apX: 120,
  fpX: 780,
  deckY: 150,
  keelY: 310,
  sheerLift: 22,
  camberLift: 10,
  wlY: 270,      // 워터라인 Y (형깊이 85% 위치 시각용)
  keelTipY: 430, // 킬 끝단 Y
  keelTopY: 310  // 킬 루트 Y (= 용골 라인)
};

function NumDot({ cx, cy, n, color, small = false }: { cx: number; cy: number; n: number; color: string; small?: boolean }) {
  const r = small ? 7 : 9;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={color} strokeWidth={1.5} />
      <text x={cx} y={cy + (small ? 3 : 4)} fontSize={small ? 10 : 12} fill={color} textAnchor="middle" fontWeight={700}>
        {n}
      </text>
    </g>
  );
}

function MeasureCard({
  color, label, title, from, to, note
}: { color: string; label: string; title: string; from: string; to: string; note: string }) {
  return (
    <div style={{ padding: 8, background: '#fafafa', borderRadius: 4, borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{
          background: color, color: '#fff', width: 28, height: 22,
          borderRadius: 4, display: 'inline-flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: 13
        }}>{label}</span>
        <b style={{ fontSize: 12, color: '#222' }}>{title}</b>
      </div>
      <div style={{ fontSize: 11.5, color: '#444', lineHeight: 1.55 }}>
        <div><b style={{ color }}>시작</b> · {from}</div>
        <div><b style={{ color }}>끝</b> · {to}</div>
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#777' }}>{note}</div>
    </div>
  );
}

function DimInput({
  label, hint, value, onChange, color = '#333'
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color?: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
      <span style={{ color, fontWeight: 700, fontSize: 13 }}>
        {label} <span style={{ color: '#888', fontWeight: 400 }}>{hint}</span>
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value || ''}
        onChange={onChange}
        style={{ padding: '6px 8px', border: '1px solid #bbb', borderRadius: 4, fontSize: 14, marginTop: 2 }}
      />
    </label>
  );
}

const seg: React.CSSProperties = {
  padding: '5px 12px',
  border: 'none',
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 700
};

const LEGEND: { abbr: string; ko: string; en: string; desc?: string }[] = [
  { abbr: 'L',   ko: '측정길이',     en: 'Tonnage Length',          desc: '형깊이 85% 위치 수선 전장 × 0.96 등' },
  { abbr: 'B',   ko: '너비',         en: 'Moulded Breadth',         desc: '상갑판 하 선측외판 외면간 최대너비' },
  { abbr: 'Dm',  ko: '중앙 형깊이',  en: 'Moulded Depth (midship)', desc: '용골 하면 ~ 선측 상갑판 하면' },
  { abbr: 'Ds',  ko: '양단연결선 깊이', en: 'Depth to Sheer Line',  desc: '용골 하면 ~ 선수·선미 양단을 잇는 직선' },
  { abbr: 'C',   ko: '캠버',         en: 'Camber',                  desc: '갑판 중앙부가 볼록한 높이' },
  { abbr: 'A.P', ko: '선미 수선',    en: 'After Perpendicular',     desc: '측정길이 후단 수직선' },
  { abbr: 'F.P', ko: '선수 수선',    en: 'Fore Perpendicular',      desc: '측정길이 전단 수직선' },
  { abbr: 'B.L', ko: '기선',         en: 'Base Line',               desc: '용골 하면을 지나는 수평기준선' },
  { abbr: 'W.L', ko: '계획만재흘수선', en: 'Designed Water Line',  desc: '형깊이 85% 위치' },
  { abbr: 'GT',  ko: '총톤수',       en: 'Gross Tonnage',           desc: '최종 산출 결과' },
  { abbr: 'V',   ko: '용적',         en: 'Volume',                  desc: '폐위장소 합계 − 제외장소 합계' },
  { abbr: 'K₁',  ko: '계수 (제9조)', en: 'Coefficient (Art. 9)',    desc: '0.2 + 0.02·log₁₀(V)' },
  { abbr: 'k₁',  ko: '환산계수 (제35조)', en: 'Conversion Coeff. (Art. 35)', desc: 't 구간별' }
];

export default function YachtDiagram({ dims, onChange }: Props) {
  const setNum = (k: keyof Dimensions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    onChange({ ...dims, [k]: isNaN(v) ? 0 : v } as Dimensions);
  };
  const setSailing = (v: boolean) => onChange({ ...dims, sailing: v });

  const { apX, fpX, deckY, keelY, sheerLift, camberLift, wlY, keelTipY, keelTopY } = HULL;
  const midX = (apX + fpX) / 2;
  // 25% / 75% 위치 (F.P.로부터 뒤쪽)
  const x25 = fpX - (fpX - apX) * 0.25;
  const x75 = fpX - (fpX - apX) * 0.75;
  const dsY = deckY - sheerLift;

  const hullPath = [
    `M ${apX - 6} ${keelY}`,
    `L ${fpX + 6} ${keelY}`,
    `Q ${fpX + 40} ${keelY - 40} ${fpX + 30} ${deckY - sheerLift}`,
    `Q ${midX} ${deckY - camberLift} ${apX - 30} ${deckY - sheerLift}`,
    `Q ${apX - 45} ${keelY - 30} ${apX - 6} ${keelY}`,
    'Z'
  ].join(' ');

  const eb = effectiveB(dims);

  return (
    <div style={{ background: '#fafafa', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      {/* 모드 토글 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#555' }}>
          <b style={{ color: dims.sailing ? '#c26' : '#2b4b7a' }}>
            {dims.sailing ? '범선 (Sailing Vessel)' : '동력선 (Motor Vessel)'}
          </b>
          <span style={{ marginLeft: 8, color: '#888' }}>
            {dims.sailing
              ? '25%·75% 너비 합 ≤ 1.5·Bmax 이면 평균값을 B로 사용'
              : 'B는 선체 최광부(widest section)의 너비 그대로 사용'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid #bbb', borderRadius: 4, overflow: 'hidden' }}>
          <button
            onClick={() => setSailing(true)}
            style={{ ...seg, background: dims.sailing ? '#c26' : '#fff', color: dims.sailing ? '#fff' : '#555' }}
          >범선</button>
          <button
            onClick={() => setSailing(false)}
            style={{ ...seg, background: !dims.sailing ? '#2b4b7a' : '#fff', color: !dims.sailing ? '#fff' : '#555' }}
          >동력선</button>
        </div>
      </div>

      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ width: '100%', height: 'auto' }}>
        {/* Baseline */}
        <line x1={40} y1={keelY} x2={VB.w - 10} y2={keelY} stroke="#999" strokeDasharray="4 4" />
        <text x={46} y={keelY - 6} fontSize={11} fill="#666">B.L · Base Line (용골 하면)</text>

        {/* A.P / F.P */}
        <line x1={apX} y1={60} x2={apX} y2={keelY + 30} stroke="#888" strokeDasharray="3 3" />
        <line x1={fpX} y1={60} x2={fpX} y2={keelY + 30} stroke="#888" strokeDasharray="3 3" />
        <text x={apX - 16} y={55} fontSize={12} fill="#333">A.P</text>
        <text x={fpX - 2} y={55} fontSize={12} fill="#333">F.P</text>

        {/* 범선 모드: 25% / 75% 위치 수직선 */}
        {dims.sailing && (
          <>
            <line x1={x25} y1={90} x2={x25} y2={keelY} stroke="#c26" strokeDasharray="2 3" opacity={0.6} />
            <line x1={x75} y1={90} x2={x75} y2={keelY} stroke="#c26" strokeDasharray="2 3" opacity={0.6} />
            <text x={x25 - 12} y={85} fontSize={11} fill="#c26" fontWeight={600}>25%</text>
            <text x={x75 - 12} y={85} fontSize={11} fill="#c26" fontWeight={600}>75%</text>
            {/* 중앙 (최광부 추정) */}
            <line x1={midX} y1={90} x2={midX} y2={keelY} stroke="#2b4b7a" strokeDasharray="2 3" opacity={0.5} />
            <text x={midX - 18} y={85} fontSize={11} fill="#2b4b7a" fontWeight={600}>Bmax</text>
          </>
        )}

        {/* Ds 연결선 */}
        <line x1={fpX + 30} y1={deckY - sheerLift} x2={apX - 30} y2={deckY - sheerLift} stroke="#c26" strokeDasharray="2 3" opacity={0.7} />

        {/* 워터라인 배경 물 영역 (가장 뒤) */}
        <rect x={30} y={wlY} width={VB.w - 40} height={VB.h - wlY} fill="#cfe6f3" opacity={0.25} />

        {/* 킬 (범선 모드만) — 핀 킬 형태, 선체 중앙 아래 */}
        {dims.sailing && (
          <g>
            <path
              d={[
                `M ${midX - 70} ${keelTopY}`,
                `L ${midX + 70} ${keelTopY}`,
                `L ${midX + 45} ${keelTipY - 18}`,
                `Q ${midX + 30} ${keelTipY + 4} ${midX + 10} ${keelTipY}`,
                `L ${midX - 30} ${keelTipY}`,
                `Q ${midX - 48} ${keelTipY + 4} ${midX - 55} ${keelTipY - 18}`,
                'Z'
              ].join(' ')}
              fill="#4a5a6a"
              stroke="#223"
              strokeWidth={1.5}
            />
            <text x={midX + 78} y={keelTipY - 6} fontSize={12} fill="#223" fontWeight={600}>킬 (Keel)</text>

            {/* 러더 */}
            <path
              d={[
                `M ${apX + 20} ${keelTopY}`,
                `L ${apX + 40} ${keelTopY}`,
                `L ${apX + 38} ${keelTipY - 40}`,
                `L ${apX + 22} ${keelTipY - 40}`,
                'Z'
              ].join(' ')}
              fill="#5a6a7a"
              stroke="#223"
              strokeWidth={1.2}
            />
            <text x={apX + 46} y={keelTipY - 40} fontSize={11} fill="#445" fontWeight={500}>러더</text>
          </g>
        )}

        {/* 선체 */}
        <path d={hullPath} fill="#e8f0fa" stroke="#2b4b7a" strokeWidth={2} />

        {/* 마스트 + 붐 (범선 모드 시각 힌트) */}
        {dims.sailing && (
          <g opacity={0.75}>
            <line x1={midX - 30} y1={deckY - camberLift - 6} x2={midX - 30} y2={10} stroke="#334" strokeWidth={2} />
            <line x1={midX - 30} y1={deckY - 4} x2={midX + 20} y2={deckY - 4} stroke="#334" strokeWidth={2} />
            {/* 돛 실루엣 (붐 길이에 맞춤) */}
            <path
              d={`M ${midX - 30} 14 L ${midX + 15} ${deckY - 8} L ${midX - 30} ${deckY - 8} Z`}
              fill="#fff"
              stroke="#88a"
              strokeWidth={1}
              opacity={0.6}
            />
          </g>
        )}

        {/* 워터라인 선 (선체 위에 올려 잘 보이게) */}
        <line x1={30} y1={wlY} x2={VB.w - 10} y2={wlY} stroke="#2a8ab8" strokeWidth={1.5} strokeDasharray="6 3" />
        <text x={40} y={wlY - 5} fontSize={10} fill="#2a8ab8" opacity={0.9}>
          W.L · 계획만재흘수선 (형깊이 85%)
        </text>
        <text x={VB.w - 48} y={wlY - 5} fontSize={11} fill="#2a8ab8" fontWeight={700}>W.L</text>

        {/* ==================== Dm 측정 (파랑) ==================== */}
        {/* 시작점 ① 용골 하면 (keelY) / 끝점 ② 선측 상갑판 하면 (deckY) */}
        {/* 연장선: 우측으로 긋고, 끝에 점 + 번호 */}
        <line x1={midX + 30} y1={keelY} x2={midX + 70} y2={keelY} stroke="#2b4b7a" strokeDasharray="3 3" />
        <line x1={midX + 30} y1={deckY} x2={midX + 70} y2={deckY} stroke="#2b4b7a" strokeDasharray="3 3" />
        <line x1={midX + 60} y1={deckY} x2={midX + 60} y2={keelY} stroke="#2b4b7a" strokeWidth={1.5} markerEnd="url(#arr)" markerStart="url(#arr)" />
        <text x={midX + 68} y={(deckY + keelY) / 2 + 4} fontSize={14} fill="#2b4b7a" fontWeight={700}>Dm</text>
        {/* 번호 마커 ① ② */}
        <NumDot cx={midX + 60} cy={keelY} n={1} color="#2b4b7a" />
        <NumDot cx={midX + 60} cy={deckY} n={2} color="#2b4b7a" />

        {/* ==================== Ds 측정 (자주) ==================== */}
        {/* 시작점 ① 용골 하면 (keelY) / 끝점 ③ 양단 연결선이 중앙 지나는 점 (dsY) */}
        <line x1={midX - 30} y1={keelY} x2={midX - 110} y2={keelY} stroke="#c26" strokeDasharray="3 3" />
        <line x1={midX - 30} y1={dsY} x2={midX - 110} y2={dsY} stroke="#c26" strokeDasharray="3 3" />
        <line x1={midX - 90} y1={dsY} x2={midX - 90} y2={keelY} stroke="#c26" strokeWidth={1.5} markerEnd="url(#arrR)" markerStart="url(#arrR)" />
        <text x={midX - 130} y={(dsY + keelY) / 2 + 4} fontSize={14} fill="#c26" fontWeight={700}>Ds</text>
        <NumDot cx={midX - 90} cy={keelY} n={1} color="#c26" />
        <NumDot cx={midX - 90} cy={dsY} n={3} color="#c26" />
        {/* 양단 연결선 끝점에도 점 */}
        <NumDot cx={fpX + 30} cy={dsY} n={3} color="#c26" small />
        <NumDot cx={apX - 30} cy={dsY} n={3} color="#c26" small />

        {/* 캠버 C 는 가로단면 개념이므로 우측 '중앙 단면 상세' 인셋에서만 표시 */}

        {/* 중앙 수직 기준선 (흐리게) */}
        <line x1={midX} y1={deckY - camberLift - 5} x2={midX} y2={keelY} stroke="#aaa" strokeDasharray="1 3" />

        {/* ==================== 캠버 단면 상세 (우측 콜아웃) ==================== */}
        {(() => {
          const cx = VB.w - 150, cy = 395, w = 120, arcH = 18;
          return (
            <g>
              <rect x={cx - 10} y={cy - 40} width={w + 30} height={80} fill="#f9fff5" stroke="#2a7" strokeDasharray="2 2" rx={4} />
              <text x={cx - 5} y={cy - 28} fontSize={10} fill="#2a7" fontWeight={700}>
                중앙 단면 상세 / Midship cross-section
              </text>
              {/* 갑판 현측 수평선 */}
              <line x1={cx} y1={cy} x2={cx + w} y2={cy} stroke="#888" strokeDasharray="2 2" />
              {/* 캠버 아크 */}
              <path d={`M ${cx} ${cy} Q ${cx + w / 2} ${cy - arcH * 2} ${cx + w} ${cy}`} stroke="#2b4b7a" strokeWidth={1.6} fill="none" />
              {/* 캠버 높이 화살표 */}
              <line x1={cx + w / 2} y1={cy} x2={cx + w / 2} y2={cy - arcH} stroke="#2a7" strokeWidth={1.5} markerEnd="url(#arrG)" markerStart="url(#arrG)" />
              <text x={cx + w / 2 + 6} y={cy - arcH / 2 + 4} fontSize={11} fill="#2a7" fontWeight={700}>C</text>
              {/* 선측 라벨 */}
              <NumDot cx={cx} cy={cy} n={2} color="#2a7" small />
              <NumDot cx={cx + w} cy={cy} n={2} color="#2a7" small />
              <NumDot cx={cx + w / 2} cy={cy - arcH} n={4} color="#2a7" small />
              <text x={cx - 8} y={cy + 14} fontSize={9} fill="#666">선측</text>
              <text x={cx + w - 10} y={cy + 14} fontSize={9} fill="#666">선측</text>
              <text x={cx + w / 2 - 12} y={cy - arcH - 4} fontSize={9} fill="#666">중앙</text>
            </g>
          );
        })()}

        {/* L */}
        <line x1={apX} y1={keelY + 40} x2={fpX} y2={keelY + 40} stroke="#333" markerEnd="url(#arr2)" markerStart="url(#arr2)" />
        <text x={midX - 10} y={keelY + 56} fontSize={14} fill="#333" fontWeight={700}>L</text>

        <defs>
          <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2b4b7a" />
          </marker>
          <marker id="arrR" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#c26" />
          </marker>
          <marker id="arr2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#333" />
          </marker>
          <marker id="arrG" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2a7" />
          </marker>
        </defs>
      </svg>

      {/* 치수 입력 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
        <DimInput label="L" hint="측정길이 / Tonnage Length [m]" value={dims.L} onChange={setNum('L')} />
        <DimInput label="Dm" hint="중앙 형깊이 / Moulded Depth (mid) [m]" value={dims.Dm} onChange={setNum('Dm')} color="#2b4b7a" />
        <DimInput label="Ds" hint="양단연결선까지 / Depth to Sheer Line [m]" value={dims.Ds} onChange={setNum('Ds')} color="#c26" />
        <DimInput label="C" hint="캠버 높이 / Camber [m]" value={dims.C} onChange={setNum('C')} color="#2a7" />
      </div>

      <div style={{
        marginTop: 10,
        padding: 10,
        background: dims.sailing ? '#fff6f8' : '#f5f8fc',
        border: `1px solid ${dims.sailing ? '#f0c8d0' : '#cddaed'}`,
        borderRadius: 6
      }}>
        {dims.sailing ? (
          <>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
              범선 너비 측정 (Breadth, sailing vessel rule · 제19조 1항 단서)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <DimInput label="B(25%)" hint="F.P.로부터 L·25% 뒤 / at 25% L aft of F.P." value={dims.B_25} onChange={setNum('B_25')} color="#c26" />
              <DimInput label="B(75%)" hint="F.P.로부터 L·75% 뒤 / at 75% L aft of F.P." value={dims.B_75} onChange={setNum('B_75')} color="#c26" />
              <DimInput label="Bmax" hint="선체 최광부 너비 / Max Moulded Breadth" value={dims.B_max} onChange={setNum('B_max')} color="#2b4b7a" />
            </div>
            <div style={{ fontSize: 12, marginTop: 8, color: '#444' }}>
              판정: B₂₅+B₇₅ = <b>{(dims.B_25 + dims.B_75).toFixed(3)}</b> m,
              {'  '}1.5·Bmax = <b>{(1.5 * dims.B_max).toFixed(3)}</b> m →{' '}
              {eb.rule === 'avg' ? (
                <span style={{ color: '#c26', fontWeight: 700 }}>
                  평균값 적용: B = (B₂₅+B₇₅)/2 = {eb.B.toFixed(3)} m
                </span>
              ) : (
                <span style={{ color: '#2b4b7a', fontWeight: 700 }}>
                  조건 미충족 → Bmax 적용: B = {eb.B.toFixed(3)} m
                </span>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <DimInput label="B" hint="최대너비 / Moulded Breadth [m]" value={dims.B_max} onChange={setNum('B_max')} color="#2b4b7a" />
          </div>
        )}
      </div>

      {/* 측정 가이드 (Dm/Ds/C 시작점·끝점 설명) */}
      <div style={{ marginTop: 10, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 6 }}>
          측정 가이드 / How to Measure
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, fontSize: 12 }}>
          <MeasureCard
            color="#2b4b7a"
            label="Dm"
            title="중앙 형깊이 / Moulded Depth (midship)"
            from="① 용골 하면 / Keel bottom (B.L)"
            to="② 선측 상갑판 하면 / Upper deck underside at ship's side"
            note="배 중앙에서 재는 수직거리. 갑판이 볼록한 중앙이 아닌 '선측' 높이임."
          />
          <MeasureCard
            color="#c26"
            label="Ds"
            title="양단연결선 깊이 / Depth to Sheer Line"
            from="① 용골 하면 / Keel bottom (B.L)"
            to="③ 선수·선미 갑판 끝을 이은 직선이 중앙에서 지나는 높이"
            note="보통 선수·선미가 위로 들려(현호·sheer) 있어 Ds ≥ Dm. 차이 (Ds−Dm)가 sheer 효과를 반영."
          />
          <MeasureCard
            color="#2a7"
            label="C"
            title="캠버 높이 / Camber"
            from="② 갑판 선측 / Deck edge"
            to="④ 갑판 중앙 (볼록하게 올라온 꼭대기) / Deck crown at centerline"
            note="프로필(옆모습)에서는 보이지 않는 가로 단면의 개념 — 우측 '중앙 단면 상세' 참고."
          />
        </div>
      </div>

      {/* 약자 범례 (Legend) */}
      <details style={{ marginTop: 10, border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff', padding: '6px 10px' }} open>
        <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#444' }}>
          약자 설명 / Abbreviations Legend
        </summary>
        <div style={{
          marginTop: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 6,
          fontSize: 11.5,
          color: '#333'
        }}>
          {LEGEND.map(({ abbr, ko, en, desc }) => (
            <div key={abbr} style={{ padding: '4px 6px', background: '#fafafa', borderRadius: 4, borderLeft: '3px solid #2b4b7a' }}>
              <b style={{ color: '#2b4b7a' }}>{abbr}</b>
              {'  '}<span style={{ color: '#555' }}>{ko}</span>
              {'  '}<span style={{ color: '#888' }}>/ {en}</span>
              {desc && <div style={{ color: '#777', fontSize: 11, marginTop: 2 }}>{desc}</div>}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

