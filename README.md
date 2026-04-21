# Korea Leisure Craft Tonnage Calculator
대한민국 수상레저기구 총톤수 계산기

24 m 미만 동력수상레저기구의 총톤수(GT)를 「선박톤수의 측정에 관한 규칙」 제9조·제19조·제35조에 따라 계산하는 웹 계산기. 배 옆모습 도면 위에 치수(L, B, Dm, Ds, C)를 직접 입력하고, 상갑판 상부 구조물과 19조 2항 돌출부를 추가해 실시간으로 GT를 산출합니다. 기본 모드는 **범선(Sailing Vessel)**.

A web calculator for the Korean statutory gross tonnage of leisure craft under 24 m tonnage length, per the Ship Tonnage Measurement Rules (Articles 9, 19, 35). Enter dimensions directly on a side-profile SVG; upper-deck structures and Article 19(2) protrusions are added as boxes. Sailing vessel mode is the default.

## 개발 / Development

```sh
cd app
npm install
npm run dev
```

## 배포 / Deployment

`main` 브랜치에 푸시하면 GitHub Actions (`.github/workflows/deploy.yml`)가 `app/` 에서 Vite 프로덕션 빌드 후 GitHub Pages로 배포합니다.

Live: https://strongestweapon.github.io/KoreaLeisureCraftTonnageCalculator/

## 주의 / Disclaimer

본 계산기는 참고용이며 공식 검사를 대체하지 않습니다. 공식 총톤수는 검사대행기관의 실측을 따르세요.

This is a reference tool and does not replace official inspection. For statutory tonnage, refer to the authorized inspection agency.

## Credit

제작 · Capt. Hojun Song (송호준), s/v RANDOM · KOR 132
