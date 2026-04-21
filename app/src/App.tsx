import { useMemo, useState } from 'react';
import YachtDiagram from './YachtDiagram';
import BoxList from './BoxList';
import CalcPanel from './CalcPanel';
import { calculate, type Dimensions, type Box } from './tonnage';
import './App.css';

export default function App() {
  const [dims, setDims] = useState<Dimensions>({
    L: 9.5,
    Dm: 1.4,
    Ds: 1.7,
    C: 0.1,
    sailing: true,
    B_max: 3.2,
    B_25: 2.1,
    B_75: 2.4
  });

  const [addedParts, setAddedParts] = useState<Box[]>([]);
  const [upperStructures, setUpperStructures] = useState<Box[]>([]);

  const calc = useMemo(
    () => calculate({ dims, addedParts, upperStructures }),
    [dims, addedParts, upperStructures]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>대한민국 수상레저기구 총톤수 계산기 · Korea Leisure Craft Tonnage Calculator</h1>
        <p>「선박톤수의 측정에 관한 규칙」 제9조·제19조·제35조 기반 · 측정길이 (Tonnage Length) 24 m 미만 대상</p>
      </header>

      <main className="layout">
        <div className="col-main">
          <section style={{ marginBottom: 12 }}>
            <h2 className="sec">① 주요치수 / Principal Dimensions (UC-1)</h2>
            <YachtDiagram dims={dims} onChange={setDims} />
          </section>

          <section>
            <h2 className="sec">② 돌출부 / Added Parts — 제19조 2항 (Beyond F.P. / A.P.)</h2>
            <BoxList
              title="돌출부 / Protruding Hull Parts"
              subtitle="측정길이 전단(F.P.) 앞 또는 후단(A.P.) 뒤로 튀어나온 선체부분 · Treated as enclosed volume and added."
              boxes={addedParts}
              onChange={setAddedParts}
              presetNames={['선수 오버행 (Bow overhang)', '선미 플랫폼 (Stern platform)']}
              allowKindToggle={false}
              fixedKind="enclosed"
            />
          </section>

          <section>
            <h2 className="sec">③ 상갑판 상부 / Above Upper Deck (UC-3)</h2>
            <BoxList
              title="상부 구조물 / Upper Structures"
              subtitle="최대길이 × 평균너비 × 평균깊이 근사 · Choose Enclosed (closed) / Excluded (open) correctly."
              boxes={upperStructures}
              onChange={setUpperStructures}
              presetNames={[
                '선수루 / Forecastle',
                '선교루 / Bridge',
                '선미루 / Poop',
                '갑판실 / Deckhouse',
                '콕핏 / Cockpit (excluded)',
                '기타 / Other'
              ]}
              allowKindToggle={true}
              fixedKind="enclosed"
            />
          </section>
        </div>

        <div className="col-side">
          <CalcPanel calc={calc} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          ※ 본 앱은 규칙상 간이 산식(제19조, 24 m 미만 선박)을 적용한 <b>참고용</b> 계산기입니다.
          공식 총톤수는 반드시 검사대행기관의 실측을 따르세요.
        </p>
        <p style={{ marginTop: 6 }}>
          Credit: <b>랜덤호 KOR 132 선장 송호준</b>
        </p>
      </footer>
    </div>
  );
}
