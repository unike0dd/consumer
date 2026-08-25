import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAK9lu94kkE6xH9e7qK6RXibFWJqCUvArM",
  authDomain: "gabo-service.firebaseapp.com",
  projectId: "gabo-service",
  storageBucket: "gabo-service.firebasestorage.app",
  messagingSenderId: "397025942439",
  appId: "1:397025942439:web:4cc0abc537ca63e0213482",
};

const allowedDashboards = new Set([
  "freelance",
  "independentHR",
  "hrpro",
  "smb",
  "consumer",
]);

const dashboard = document.body.dataset.dashboard;
const dashboardKey = allowedDashboards.has(dashboard) ? dashboard : "consumer";
const authUrl = new URL(
  "https://unike0dd.github.io/duplicate-hrservices/auth.html",
);
authUrl.searchParams.set("dashboard", dashboardKey);
authUrl.searchParams.set("mode", "signin");

function redirectToSignIn() {
  window.location.replace(authUrl.toString());
}

function whenDocumentReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }
  callback();
}

function installSessionControls(auth) {
  whenDocumentReady(() => {
    if (document.querySelector("#firebase-sign-out")) return;

    const style = document.createElement("style");
    style.textContent = `
      .firebase-session-control {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px 8px 0;
      }
      .firebase-session-control button {
        width: 100%;
        min-height: 42px;
        border: 1px solid rgba(255, 255, 255, .22);
        border-radius: 9px;
        background: rgba(255, 255, 255, .08);
        color: #fff;
        font: 700 12px/1 system-ui, sans-serif;
        cursor: pointer;
      }
      .firebase-session-control button:hover {
        background: rgba(255, 255, 255, .15);
      }
      .firebase-session-control button:focus-visible {
        outline: 3px solid #d6a13c;
        outline-offset: 2px;
      }
      .firebase-session-control button:disabled {
        cursor: wait;
        opacity: .65;
      }
    `;
    document.head.appendChild(style);

    const control = document.createElement("div");
    control.className = "firebase-session-control";
    control.dataset.uiControl = "";
    control.innerHTML =
      '<button id="firebase-sign-out" type="button" aria-label="Sign out of Gabo Services">Sign out</button>';

    const host =
      document.querySelector(".side-bottom") ||
      document.querySelector(".side") ||
      document.querySelector("aside") ||
      document.body;
    host.appendChild(control);

    const button = control.querySelector("#firebase-sign-out");
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Signing out…";
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Firebase sign-out failed.", error);
        button.disabled = false;
        button.textContent = "Sign out";
        return;
      }
      redirectToSignIn();
    });
  });
}

let auth;
try {
  auth = getAuth(initializeApp(firebaseConfig));
} catch (error) {
  console.error("Firebase session initialization failed.", error);
}

if (auth) {
  onAuthStateChanged(
    auth,
    async (user) => {
      if (!user || !user.emailVerified) {
        if (user) {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Invalid Firebase session cleanup failed.", error);
          }
        }
        redirectToSignIn();
        return;
      }

      installSessionControls(auth);
      document.documentElement.classList.remove("auth-pending");
    },
    (error) => {
      console.error("Firebase session verification failed.", error);
      redirectToSignIn();
    },
  );
}
