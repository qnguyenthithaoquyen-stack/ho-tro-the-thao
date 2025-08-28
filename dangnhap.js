import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === "Huấn luyện viên") {
          window.location.href = "coach-dashboard.html";
        } else if (data.role === "Vận động viên") {
          window.location.href = "athlete-dashboard.html";
        } else {
          window.location.href = "xacnhan-vaitro.html";
        }
      } else {
        window.location.href = "xacnhan-vaitro.html";
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  });
});
