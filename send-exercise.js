// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Cấu hình Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
    authDomain: "sporthealthdata.firebaseapp.com",
    projectId: "sporthealthdata",
    storageBucket: "sporthealthdata.appspot.com",
    messagingSenderId: "789054240877",
    appId: "1:789054240877:web:04a400c9ea586523a86764",
};

// --- Khởi tạo Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Hàm Chính - Chạy sau khi trang tải xong ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Lấy các phần tử HTML ---
    const athleteNameEl = document.getElementById('athleteName');
    const exerciseForm = document.getElementById('exerciseForm');
    const messageDiv = document.getElementById('message');
    
    let athleteId = null;

    // --- Giám sát trạng thái đăng nhập của HLV ---
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = './dangnhap.html';
        }
    });

    // --- Lấy thông tin VĐV từ URL và hiển thị ---
    async function loadAthleteInfo() {
        const params = new URLSearchParams(window.location.search);
        athleteId = params.get('athleteId');

        if (!athleteId) {
            athleteNameEl.textContent = "Không tìm thấy VĐV";
            return;
        }

        try {
            const athleteDocRef = doc(db, "users", athleteId);
            const athleteDocSnap = await getDoc(athleteDocRef);

            if (athleteDocSnap.exists()) {
                athleteNameEl.textContent = athleteDocSnap.data().fullName || "VĐV không tên";
            } else {
                athleteNameEl.textContent = "VĐV không tồn tại";
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin VĐV:", error);
            athleteNameEl.textContent = "Lỗi tải dữ liệu";
        }
    }

    // --- Xử lý sự kiện gửi form ---
    exerciseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!athleteId) {
            alert("Không xác định được VĐV để gửi bài tập.");
            return;
        }

        const submitButton = exerciseForm.querySelector('button[type="submit"]');
        const title = exerciseForm.title.value;
        const description = exerciseForm.description.value;
        const dueDate = exerciseForm.dueDate.value;

        submitButton.disabled = true;
        submitButton.textContent = 'Đang gửi...';
        messageDiv.style.display = 'none';

        try {
            const exercisesColRef = collection(db, "users", athleteId, "exercises");
            await addDoc(exercisesColRef, {
                title: title,
                description: description,
                dueDate: dueDate,
                status: 'pending', 
                createdAt: serverTimestamp()
            });

            messageDiv.textContent = "Gửi bài tập thành công!";
            messageDiv.className = "message success";
            messageDiv.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'coach-dashboard.html';
            }, 2000);

        } catch (error) {
            console.error("Lỗi khi gửi bài tập:", error);
            messageDiv.textContent = "Đã xảy ra lỗi khi gửi. Vui lòng thử lại.";
            messageDiv.className = "message error";
            messageDiv.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = 'Gửi bài tập';
        }
    });

    // Chạy hàm tải thông tin VĐV khi trang được mở
    loadAthleteInfo();
});
