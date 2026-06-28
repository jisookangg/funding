
# Birthday Bose Funding Website

밝고 여백이 많은 Apple-inspired 생일 선물 모금 페이지입니다.  
HTML, CSS, JavaScript만으로 되어 있어서 별도 설치 없이 바로 실행할 수 있습니다.

## 1. 가장 빠르게 미리 보기

`index.html`을 더블클릭하면 브라우저에서 열립니다.

> QR 이미지는 외부 QR 서비스에서 생성하므로, 인터넷 연결이 필요합니다.

## 2. 반드시 바꿔야 할 곳

`script.js` 맨 위의 `CONFIG` 블록만 수정하세요.

```js
const CONFIG = {
  goalAmount: 299000,
  currentAmount: 173000,
  supporterCount: 12,

  bankName: "토스뱅크",
  accountNumber: "1000-0000-0000",
  accountHolder: "홍길동",
};
```

### 추천 목표 금액
목표 선물 가격 + 배송비나 수수료 등을 고려해 `goalAmount`를 입력하세요.

## 3. Google Sheet 연동 (선택)

입금 확인 후 매번 코드를 수정하기 싫다면 Google Sheet의 숫자만 바꿔서 페이지 진행률을 업데이트할 수 있습니다.

### 시트 첫 줄(열 이름)
| goalAmount | currentAmount | supporterCount |
|---|---:|---:|
| 299000 | 173000 | 12 |

### 연결 순서
1. Google Sheet를 만듭니다.
2. 위 열 이름과 값을 첫 번째 시트의 첫 두 줄에 입력합니다.
3. **파일 → 공유 → 웹에 게시**에서 CSV 형식으로 게시합니다.
4. 생성된 `...pub?output=csv` 주소를 복사합니다.
5. `script.js`에서 아래 부분에 붙여넣습니다.

```js
googleSheetCsvUrl: "여기에_게시된_CSV_주소",
```

이후 `currentAmount`나 `supporterCount`를 시트에서 바꾸면 웹페이지를 새로고침했을 때 반영됩니다.

> 주의: "웹에 게시"한 시트는 링크를 아는 사람이 볼 수 있습니다. 따라서 계좌번호나 후원자 실명 등 민감한 정보는 시트에 넣지 말고, 금액 숫자만 넣으세요.

## 4. 무료로 배포하기

### GitHub Pages
1. GitHub에서 새 Repository를 만듭니다.
2. 이 폴더의 파일을 업로드합니다.
3. Repository `Settings → Pages`로 이동합니다.
4. `Deploy from a branch`, `main`, `/root`를 선택하고 저장합니다.
5. 잠시 뒤 생성되는 주소로 누구나 접속할 수 있습니다.

### Netlify Drop
1. Netlify에 로그인합니다.
2. 이 폴더 전체를 Netlify Drop 영역에 끌어놓습니다.
3. 자동으로 공개 URL이 생성됩니다.

## 5. 파일 구조

```text
birthday-bose-funding/
├── index.html     # 페이지 구조
├── styles.css     # 디자인·반응형·애니메이션
├── script.js      # 금액·계좌 수정, 복사, QR, Sheet 연동
├── data.json      # 참고용 기본 데이터
└── README.md      # 사용 설명서
```

## 6. 제품 사진을 실제 이미지로 바꾸고 싶을 때

현재는 저작권·배포 문제 없이 쓸 수 있도록 CSS로 만든 헤드폰 일러스트입니다.  
직접 찍은 사진이나 사용 권한이 있는 제품 이미지를 쓸 경우 `index.html`의 `.hero-art` 내부를 이미지 태그로 교체해 사용할 수 있습니다.

