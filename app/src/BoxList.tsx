import type { Box } from './tonnage';
import { boxVolume } from './tonnage';

type Props = {
  title: string;
  subtitle?: string;
  boxes: Box[];
  onChange: (boxes: Box[]) => void;
  presetNames?: string[];      // 드롭다운 기본 이름
  allowKindToggle: boolean;    // true: 폐위/제외 토글 (상갑판 상부), false: 고정 (19조 2항은 항상 폐위)
  fixedKind?: Box['kind'];
};

export default function BoxList({
  title, subtitle, boxes, onChange, presetNames = [], allowKindToggle, fixedKind = 'enclosed'
}: Props) {
  const add = (name = '') => {
    onChange([
      ...boxes,
      {
        id: crypto.randomUUID(),
        name,
        length: 0,
        breadth: 0,
        depth: 0,
        kind: fixedKind
      }
    ]);
  };

  const update = (id: string, patch: Partial<Box>) => {
    onChange(boxes.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const remove = (id: string) => onChange(boxes.filter((b) => b.id !== id));

  const total = boxes.reduce((s, b) => s + boxVolume(b), 0);

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fff' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#666' }}>{subtitle}</p>}
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>합계: <b>{total.toFixed(3)}</b> ㎥</div>
      </header>

      {boxes.length === 0 && (
        <p style={{ fontSize: 12, color: '#999', margin: '8px 0' }}>항목 없음</p>
      )}

      {boxes.map((b) => {
        const isAdd = b.kind === 'enclosed';
        return (
          <div
            key={b.id}
            style={{
              display: 'grid',
              gridTemplateColumns: allowKindToggle
                ? 'auto 1.6fr 0.8fr 0.8fr 0.8fr 0.9fr 1.1fr auto'
                : 'auto 1.6fr 0.8fr 0.8fr 0.8fr 0.9fr auto',
              gap: 6,
              alignItems: 'center',
              marginBottom: 6,
              padding: '4px 6px',
              borderRadius: 4,
              background: isAdd ? '#ecf7ec' : '#fdecec',
              borderLeft: `3px solid ${isAdd ? '#2a7' : '#c33'}`
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 4, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14,
              background: isAdd ? '#2a7' : '#c33', color: '#fff'
            }}>
              {isAdd ? '+' : '−'}
            </span>
            <input
              type="text"
              placeholder="명칭 (예: 선수루)"
              value={b.name}
              onChange={(e) => update(b.id, { name: e.target.value })}
              style={inp}
            />
            <input type="number" step="0.01" min="0" placeholder="길이" value={b.length || ''} onChange={(e) => update(b.id, { length: parseFloat(e.target.value) || 0 })} style={inp} />
            <input type="number" step="0.01" min="0" placeholder="너비" value={b.breadth || ''} onChange={(e) => update(b.id, { breadth: parseFloat(e.target.value) || 0 })} style={inp} />
            <input type="number" step="0.01" min="0" placeholder="깊이" value={b.depth || ''} onChange={(e) => update(b.id, { depth: parseFloat(e.target.value) || 0 })} style={inp} />
            <div style={{ fontSize: 12, color: '#333', textAlign: 'right', paddingRight: 4 }}>
              {boxVolume(b).toFixed(3)} ㎥
            </div>
            {allowKindToggle && (
              <select
                value={b.kind}
                onChange={(e) => update(b.id, { kind: e.target.value as Box['kind'] })}
                style={{ ...inp, padding: '5px', fontWeight: 700, color: isAdd ? '#2a7' : '#c33' }}
              >
                <option value="enclosed">＋ 포함 (폐위)</option>
                <option value="excluded">－ 제외 (excluded)</option>
              </select>
            )}
            <button onClick={() => remove(b.id)} style={btnDel}>×</button>
          </div>
        );
      })}

      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {presetNames.map((n) => (
          <button key={n} onClick={() => add(n)} style={btnPreset}>+ {n}</button>
        ))}
        <button onClick={() => add('')} style={btnAdd}>+ 직접입력</button>
      </div>
    </section>
  );
}

const inp: React.CSSProperties = {
  padding: '5px 7px',
  fontSize: 13,
  border: '1px solid #ccc',
  borderRadius: 4
};
const btnDel: React.CSSProperties = {
  background: '#fee',
  border: '1px solid #e99',
  color: '#c00',
  borderRadius: 4,
  padding: '2px 8px',
  cursor: 'pointer',
  fontWeight: 700
};
const btnPreset: React.CSSProperties = {
  background: '#eef5ff',
  border: '1px solid #9bf',
  color: '#246',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer'
};
const btnAdd: React.CSSProperties = {
  background: '#f4f4f4',
  border: '1px dashed #999',
  color: '#333',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer'
};
