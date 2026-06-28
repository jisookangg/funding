
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                 EDIT ONLY THIS CONFIG BLOCK                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * 1) 아래 개인 정보만 바꾸면 기본 페이지는 바로 작동합니다.
 * 2) Google Sheet 연동을 쓰려면 `googleSheetCsvUrl`에 "웹에 게시된 CSV" URL을 넣으세요.
 * 3) Sheet 열 이름: goalAmount, currentAmount, supporterCount
 */
const CONFIG = {
  goalAmount: 294000,
  currentAmount: 0,
  supporterCount: 0,

  bankName: "우리은행",
  accountNumber: "1002-959-495249",
  accountHolder: "강지수",


  // 예: "https://docs.google.com/spreadsheets/d/e/....../pub?output=csv"
  // 비워 두면 위의 숫자를 사용합니다.
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUxkiyfKtsIkxfR7sAQeM02Rzpgpv9HgKN9iBpC8xxdtb2PFRQ-6qysuZMLvGAbCwS1VJRjW92Ynzl/pub?gid=0&single=true&output=csv",

  // 선택: 실제 Bose 제품/구매 페이지 링크를 넣으세요.
  purchaseUrl: "https://www.bose.co.kr/104/?idx=115",
};

const state = { ...CONFIG };

const $ = (selector) => document.querySelector(selector);
const money = (n) => new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.round(Number(n) || 0)));

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}

function countUp(node, end, duration = 1050) {
  const start = 0;
  const begin = performance.now();
  const animate = (now) => {
    const p = Math.min((now - begin) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    node.textContent = money(start + (end - start) * eased);
    if (p < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function render(animate = true) {
  const goal = Number(state.goalAmount) || 1;
  const current = Math.max(0, Number(state.currentAmount) || 0);
  const percent = Math.min(100, Math.round((current / goal) * 100));
  const remaining = Math.max(0, goal - current);

  if (animate) {
    countUp($("#current-amount"), current);
    countUp($("#goal-amount"), goal, 900);
    countUp($("#remaining-amount"), remaining, 900);
    countUp($("#supporter-count"), Number(state.supporterCount) || 0, 800);
  } else {
    setText("#current-amount", money(current));
    setText("#goal-amount", money(goal));
    setText("#remaining-amount", money(remaining));
    setText("#supporter-count", money(state.supporterCount));
  }

  setText("#progress-percent", percent);
  $("#meter-fill").style.width = `${percent}%`;

  setText("#bank-name", state.bankName);
  setText("#account-number", state.accountNumber);
  setText("#account-holder", state.accountHolder);
  setText("#gift-note", state.giftNote);
  setText("#thanks-message", state.thanksMessage);
  setText("#footer-message", state.footerMessage);

  // const accountText = `${state.bankName} ${state.accountNumber} ${state.accountHolder}`;
  // QR 서버를 이용해 휴대폰 카메라로 확인할 수 있는 QR을 만듭니다.
  // $("#qr-image").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=svg&data=${encodeURIComponent(accountText)}`;

  const buy = $("#purchase-link");
  buy.href = state.purchaseUrl || "#";
}

function csvToObject(text) {
  const [headerLine, firstDataLine] = text.trim().split(/\r?\n/);
  if (!headerLine || !firstDataLine) return null;

  // 단순 CSV 값(숫자 중심)을 위해 작성했습니다. 쉼표가 포함된 텍스트는 Sheet에서 따옴표로 저장됩니다.
  const splitCsv = (line) => {
    const result = [];
    let item = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { result.push(item.replace(/^"|"$/g, "").trim()); item = ""; }
      else item += char;
    }
    result.push(item.replace(/^"|"$/g, "").trim());
    return result;
  };

  const headers = splitCsv(headerLine);
  const values = splitCsv(firstDataLine);
  return Object.fromEntries(headers.map((key, i) => [key, values[i] ?? ""]));
}

async function loadGoogleSheet() {
  if (!state.googleSheetCsvUrl) return;

  try {
    const url = `${state.googleSheetCsvUrl}&t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Sheet request failed: ${res.status}`);
    }

    const text = await res.text();
    const row = csvToObject(text);

    if (!row) {
      throw new Error("시트에서 데이터를 읽지 못했습니다.");
    }

    // 첫 번째 열 이름에 붙을 수 있는 UTF-8 BOM 제거
    const cleanRow = {};
    Object.entries(row).forEach(([key, value]) => {
      cleanRow[key.replace(/^\uFEFF/, "").trim()] = value;
    });

    ["goalAmount", "currentAmount", "supporterCount"].forEach((key) => {
      if (cleanRow[key] !== undefined && cleanRow[key] !== "") {
        state[key] = Number(
          String(cleanRow[key]).replace(/[^\d.-]/g, "")
        );
      }
    });

    render(false);
  } catch (error) {
    console.error("Google Sheet 연동 실패:", error);
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyAccount() {
  const account = state.accountNumber;
  try {
    await navigator.clipboard.writeText(account);
    showToast("계좌번호를 복사했어요.");
  } catch {
    const input = document.createElement("textarea");
    input.value = account;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
    showToast("계좌번호를 복사했어요.");
  }
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 3, 2) * 70}ms`;
    observer.observe(el);
  });
}

function replayMotion() {
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  });
  $("#meter-fill").style.width = "0%";
  window.setTimeout(() => render(true), 120);
}

render(true);
setupReveal();
loadGoogleSheet();

$("#copy-account").addEventListener("click", copyAccount);
$("#reset-preview").addEventListener("click", replayMotion);


/* ------------------------------
   랜덤 밈 이미지 (같은 이미지 연속 방지)
--------------------------------*/

const wowImages = [
    "assets/wow1.jpg",
    "assets/wow2.jpg",
    "assets/wow3.jpeg",
    "assets/wow4.jpeg",
    "assets/wow5.png",
    "assets/wow6.jpg",
    "assets/wow7.jpeg",
    "assets/wow8.jpg",
    "assets/wow9.jpeg"
];

const wowImage = document.getElementById("random-wow");

// 이전에 표시했던 이미지 번호
let previousIndex = -1;

function changeWowImage() {

    wowImage.style.opacity = 0;

    setTimeout(() => {

        let randomIndex;

        // 이전 이미지와 같으면 다시 뽑기
        do {
            randomIndex = Math.floor(Math.random() * wowImages.length);
        } while (randomIndex === previousIndex);

        previousIndex = randomIndex;

        wowImage.src = wowImages[randomIndex];

        wowImage.style.opacity = 1;

    }, 600);
}

// 첫 이미지 표시
changeWowImage();

// 5초마다 변경
setInterval(changeWowImage, 5000);

function updateBirthdayCountdown() {
  const target = new Date("2026-07-10T00:00:00+09:00");
  const now = new Date();

  const diff = target - now;
  const countdown = document.getElementById("birthday-countdown");

  if (!countdown) return;

  if (diff <= 0) {
    countdown.textContent = "생일입니다 🎉";
    return;
  }

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes / 60) % 24);
  const minutes = totalMinutes % 60;

  countdown.textContent = `${days}일 ${hours}시간 ${minutes}분`;
}

updateBirthdayCountdown();
setInterval(updateBirthdayCountdown, 60000);