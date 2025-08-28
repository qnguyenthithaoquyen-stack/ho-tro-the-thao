import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const age = document.getElementById("age").value.trim();
    const province = document.getElementById("province").value;

    if (!fullname || !username || !email || !password || !age || !province) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        fullname,
        username,
        email,
        age,
        province,
        role: "" // chưa xác nhận
      });

      alert("Đăng ký thành công! Vui lòng xác nhận vai trò.");
      window.location.href = "xacnhan-vaitro.html";
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  });
});
