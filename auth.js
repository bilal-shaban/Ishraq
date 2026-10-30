
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3RQ2jrXcJOUqmhUrGuBQ6R8kZ2sSLOr0",
  authDomain: "alishraq-fe305.firebaseapp.com",
  projectId: "alishraq-fe305",
  storageBucket: "alishraq-fe305.firebasestorage.app",
  messagingSenderId: "816905605188",
  appId: "1:816905605188:web:639252ce9ef899bd622c11",
  measurementId: "G-X6NV8MT549"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LOGIN_PAGE = "./login.html";

// حماية الصفحة
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace(LOGIN_PAGE);
    return;
  }

  document.documentElement.classList.remove("auth-checking");
  document.documentElement.classList.add("auth-ready");

  console.log("Al-Ishraq: المستخدم مسجل دخول");
});

// إضافة زر تسجيل الخروج
function createLogoutButton() {
  if (document.getElementById("logoutButton")) return;

  const navbar = document.querySelector(".navbar-collapse");
  if (!navbar) return;

  const wrapper = document.createElement("div");
  wrapper.className =
    "d-flex align-items-center me-lg-3 mt-2 mt-lg-0";

  const button = document.createElement("button");
  button.id = "logoutButton";
  button.type = "button";
  button.className =
    "btn btn-sm btn-outline-light rounded-pill px-3";

  button.innerHTML =
    '<i class="bi bi-box-arrow-right ms-1"></i> تسجيل الخروج';

  wrapper.appendChild(button);
  navbar.appendChild(wrapper);

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "جارٍ تسجيل الخروج...";

    try {
      await signOut(auth);
      window.location.replace(LOGIN_PAGE);
    } catch (error) {
      console.error("Logout error:", error);
      alert("تعذّر تسجيل الخروج. حاول مرة أخرى.");
      button.disabled = false;
      button.innerHTML =
        '<i class="bi bi-box-arrow-right ms-1"></i> تسجيل الخروج';
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createLogoutButton);
} else {
  createLogoutButton();
}