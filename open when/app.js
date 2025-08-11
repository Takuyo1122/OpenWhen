import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import {
  getFirestore, collection, addDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgI7NtGUQoqGZFHDVflAothskduTH_DW4",
  authDomain: "open-when-98b12.firebaseapp.com",
  projectId: "open-when-98b12",
  storageBucket: "open-when-98b12.appspot.com",
  messagingSenderId: "205547968832",
  appId: "1:205547968832:web:d98a24e24a143e262dc2a5",
  measurementId: "G-KBB7SDTWRR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const lettersCollection = collection(db, "letters");

const form = document.getElementById("form");
const unlockDateInput = document.getElementById("unlockDate");
const unlockPassInput = document.getElementById("unlockPass");
const unlockTypeRadios = document.getElementsByName("unlockType");
const urlDisplay = document.getElementById("url-display");
const createSection = document.getElementById("create-section");
const viewSection = document.getElementById("view-section");
const letterDisplay = document.getElementById("letter-display");
const btnOpen = document.getElementById("btn-open");

function updateUnlockInputs() {
  const type = [...unlockTypeRadios].find(r => r.checked).value;
  if (type === "date") {
    unlockDateInput.classList.remove("hidden");
    unlockPassInput.classList.add("hidden");
  } else {
    unlockDateInput.classList.add("hidden");
    unlockPassInput.classList.remove("hidden");
  }
}
unlockTypeRadios.forEach(radio => radio.addEventListener("change", updateUnlockInputs));
updateUnlockInputs();

const params = new URLSearchParams(window.location.search);
const letterId = params.get("letterId");

if (letterId) {
  createSection.classList.add("hidden");
  viewSection.classList.remove("hidden");

  (async () => {
    const docRef = doc(db, "letters", letterId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const letter = docSnap.data();
      letterDisplay.textContent = `${letter.title}\n\n※開けるまでは内容は見れません`;

      btnOpen.onclick = () => {
        if (letter.type === "date") {
          if (new Date() >= new Date(letter.unlock)) {
            alert(letter.message);
          } else {
            alert("まだ開けられません。");
          }
        } else {
          const pass = prompt("パスワードを入力してください");
          if (pass === letter.unlock) {
            alert(letter.message);
          } else {
            alert("パスワードが違います。");
          }
        }
      };
    } else {
      letterDisplay.textContent = "手紙が見つかりません。";
      btnOpen.disabled = true;
    }
  })();
} else {
  createSection.classList.remove("hidden");
  viewSection.classList.add("hidden");

  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const message = form.message.value.trim();
    const type = [...unlockTypeRadios].find(r => r.checked).value;
    const unlock = type === "date" ? unlockDateInput.value : unlockPassInput.value.trim();

    if (!title || !message || !unlock) {
      alert("すべての項目を正しく入力してください");
      return;
    }

    const docRef = await addDoc(lettersCollection, { title, message, type, unlock });
    const url = `${location.origin}${location.pathname}?letterId=${docRef.id}`;
    urlDisplay.textContent = url;
    urlDisplay.classList.remove("hidden");

    // URLをクリップボードにコピー
    try {
      await navigator.clipboard.writeText(url);
      alert("URLをコピーしました！");
    } catch (err) {
      console.error("コピーに失敗しました", err);
      alert("URLのコピーに失敗しました。手動でコピーしてください。");
    }

    // URL表示のテキスト選択（任意）
    const range = document.createRange();
    range.selectNodeContents(urlDisplay);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    form.reset();
    updateUnlockInputs();
  };
}