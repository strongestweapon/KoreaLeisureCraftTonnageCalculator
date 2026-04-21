import type { Calculation } from './tonnage';

type Props = { calc: Calculation };

const f = (n: number, d = 4) => (isFinite(n) ? n.toFixed(d) : '-');

export default function CalcPanel({ calc }: Props) {
  return (
    <aside style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 14,
      background: '#fffdf5',
      position: 'sticky',
      top: 12
    }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>계산 결과 / Calculation (debug)</h3>

      <div style={{
        border: '1px solid #cbd5e1',
        borderRadius: 6,
        background: '#f8fafc',
        padding: '10px 12px',
        marginBottom: 12
      }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, letterSpacing: 0.3 }}>
          V 공식 / Formula (Art. 9 입력값)
        </div>
        <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, lineHeight: 1.7, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
          <span>V =</span>
          <PlusTerm>V<sub>선체하부</sub></PlusTerm>
          <Op>+</Op>
          <PlusTerm>V<sub>돌출부</sub></PlusTerm>
          <Op>+</Op>
          <PlusTerm>V<sub>상부(＋포함)</sub></PlusTerm>
          <Op>−</Op>
          <MinusTerm>V<sub>상부(−제외)</sub></MinusTerm>
        </div>
        <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, marginTop: 4, color: '#334155', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
          <span>=</span>
          <PlusNum>{f(calc.V_hull, 3)}</PlusNum>
          <Op>+</Op>
          <PlusNum>{f(calc.V_added, 3)}</PlusNum>
          <Op>+</Op>
          <PlusNum>{f(calc.V_upperEnclosed, 3)}</PlusNum>
          <Op>−</Op>
          <MinusNum>{f(calc.V_upperExcluded, 3)}</MinusNum>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>
          = <span style={{ color: '#1e3a8a' }}>{f(calc.V, 3)} ㎥</span>
        </div>
      </div>

      <Group title="제19조 1항 · Hull Volume (Art. 19-1)">
        <Row
          k={`B 적용값 (${
            calc.B_rule === 'avg' ? '범선 평균' :
            calc.B_rule === 'max' ? '범선 단서 미충족 → Bmax' :
            '동력선 Bmax'
          })`}
          v={`${f(calc.B_effective, 3)} m`}
        />
        <Row k="중괄호 {Dm + (2/3)C + (1/3)(Ds−Dm)}" v={`${f(calc.bracket)} m`} />
        <Row k="V_hull = 0.65·L·B·{...}" v={`${f(calc.V_hull)} ㎥`} emphasize />
      </Group>

      <Group title="제19조 2항 · Added Parts (Art. 19-2)">
        <Row k="V_added = Σ(길×너×깊)" v={`${f(calc.V_added)} ㎥`} />
        <Row k="상갑판 하부 합계" v={`${f(calc.V_underDeck)} ㎥`} emphasize />
      </Group>

      <Group title="상갑판 상부 · Above Upper Deck">
        <Row k="폐위장소 합계" v={`${f(calc.V_upperEnclosed)} ㎥`} />
        <Row k="제외장소 합계" v={`${f(calc.V_upperExcluded)} ㎥`} />
      </Group>

      <Group title="V · Total Volume (Art. 9 input)">
        <Row k="폐위 전체" v={`${f(calc.V_enclosedTotal)} ㎥`} />
        <Row k="제외 전체" v={`${f(calc.V_excludedTotal)} ㎥`} />
        <Row k="V = 폐위 − 제외" v={`${f(calc.V)} ㎥`} emphasize />
      </Group>

      <Group title="제9조 · International GT  t  (Art. 9)">
        <Row k="K1 = 0.2 + 0.02·log₁₀(V)" v={f(calc.K1, 5)} />
        <Row k="t = K1 · V" v={f(calc.t, 4)} emphasize />
      </Group>

      <Group title="제35조 · Conversion Coeff.  k₁  (Art. 35)">
        <Row k={`구간: ${bandLabel(calc.t)}`} v="" />
        <Row k="k1" v={f(calc.k1, 5)} />
      </Group>

      <div style={{
        background: '#2b4b7a',
        color: '#fff',
        borderRadius: 6,
        padding: '12px 14px',
        marginTop: 10,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>총톤수 / Gross Tonnage  GT = t · k₁</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>
          {f(calc.GT, 3)} <span style={{ fontSize: 16 }}>톤 / ton</span>
        </div>
      </div>
    </aside>
  );
}

function bandLabel(t: number): string {
  if (t >= 4000) return 't ≥ 4000 → k1=1';
  if (t >= 30) return '30 ≤ t < 4000';
  return 't < 30';
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: '#777', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{title}</div>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: '4px 8px' }}>
        {children}
      </div>
    </div>
  );
}

function PlusTerm({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: '#ecf7ec', color: '#166534', padding: '1px 5px', borderRadius: 3, border: '1px solid #bbe2bb' }}>
      {children}
    </span>
  );
}
function MinusTerm({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: '#fdecec', color: '#991b1b', padding: '1px 5px', borderRadius: 3, border: '1px solid #f0b5b5' }}>
      {children}
    </span>
  );
}
function PlusNum({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#166534', fontWeight: 600 }}>{children}</span>;
}
function MinusNum({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#991b1b', fontWeight: 600 }}>{children}</span>;
}
function Op({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#475569', fontWeight: 700, padding: '0 2px' }}>{children}</span>;
}

function Row({ k, v, emphasize = false }: { k: string; v: string; emphasize?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      padding: '3px 0',
      color: emphasize ? '#111' : '#555',
      fontWeight: emphasize ? 700 : 400,
      borderTop: emphasize ? '1px dashed #ddd' : 'none'
    }}>
      <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
