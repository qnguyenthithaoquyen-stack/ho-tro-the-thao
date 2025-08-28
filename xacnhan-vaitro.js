import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let selectedRole = null;

document.addEventListener("DOMContentLoaded", () => {
  const roleBtns = document.querySelectorAll(".role-btn");
  roleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRole = btn.dataset.role;
      roleBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("confirmBtn").addEventListener("click", () => {
    if (!selectedRole) {
      alert("Vui lòng chọn vai trò!");
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { role: selectedRole });

        if (selectedRole === "Huấn luyện viên") {
          window.location.href = "coach-dashboard.html";
        } else if (selectedRole === "Vận động viên") {
          window.location.href = "athlete-dashboard.html";
        }
      } else {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "dangnhap.html";
      }
    });
  });
});
