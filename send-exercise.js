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
    const athleteNameSpan = document.getElementById('athlete-name');
    const exerciseForm = document.getElementById('exercise-form');
    const messageDiv = document.getElementById('message');
    const cancelBtn = document.getElementById('cancel-btn');

    let athleteId = null;

    // --- Giám sát trạng thái đăng nhập của HLV ---
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Nếu HLV chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // --- Lấy thông tin VĐV từ URL và hiển thị ---
    async function loadAthleteInfo() {
        const params = new URLSearchParams(window.location.search);
        athleteId = params.get('athleteId');

        if (!athleteId) {
            if(athleteNameSpan) athleteNameSpan.textContent = "Không tìm thấy VĐV";
            return;
        }

        try {
            const athleteDocRef = doc(db, "users", athleteId);
            const athleteDocSnap = await getDoc(athleteDocRef);

            if (athleteDocSnap.exists()) {
                const athleteData = athleteDocSnap.data();
                if(athleteNameSpan) athleteNameSpan.textContent = athleteData.fullName || "VĐV không tên";
            } else {
                if(athleteNameSpan) athleteNameSpan.textContent = "VĐV không tồn tại";
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin VĐV:", error);
            if(athleteNameSpan) athleteNameSpan.textContent = "Lỗi tải dữ liệu";
        }
    }

    // --- Xử lý sự kiện gửi form ---
    if(exerciseForm) {
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
            if (messageDiv) messageDiv.style.display = 'none';

            try {
                // Sửa đường dẫn: users -> {athleteId} -> exercises
                const exercisesColRef = collection(db, "users", athleteId, "exercises");

                await addDoc(exercisesColRef, {
                    title: title,
                    description: description,
                    dueDate: dueDate,
                    status: 'pending', // Trạng thái ban đầu
                    createdAt: serverTimestamp()
                });

                alert("Gửi bài tập thành công!");
                window.location.href = 'coach-dashboard.html';

            } catch (error) {
                console.error("Lỗi khi gửi bài tập:", error);
                if (messageDiv) {
                    messageDiv.textContent = "Đã xảy ra lỗi khi gửi. Vui lòng thử lại.";
                    messageDiv.style.display = 'block';
                }
                submitButton.disabled = false;
                submitButton.textContent = 'Gửi bài tập';
            }
        });
    }
    
    // --- Xử lý nút Hủy ---
    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'coach-dashboard.html';
        });
    }

    // Chạy hàm tải thông tin VĐV khi trang được mở
    loadAthleteInfo();
});

