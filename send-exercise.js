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

// --- Lấy các phần tử HTML ---
const athleteInfoP = document.getElementById('athlete-info');
const exerciseForm = document.getElementById('exerciseForm');
const cancelBtn = document.getElementById('cancel-btn');

let athleteId = null;
let coachId = null;

// --- Hàm Chính ---
document.addEventListener('DOMContentLoaded', () => {
    // Lấy athleteId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    athleteId = urlParams.get('athleteId');

    if (!athleteId) {
        alert('Không tìm thấy ID của Vận động viên. Vui lòng quay lại.');
        window.location.href = 'coach-dashboard.html';
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            coachId = user.uid;
            loadAthleteInfo();
        } else {
            window.location.href = 'dangnhap.html';
        }
    });

    // --- Xử lý sự kiện ---
    exerciseForm.addEventListener('submit', sendExercise);
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'coach-dashboard.html';
    });
});

// --- Tải thông tin VĐV ---
async function loadAthleteInfo() {
    try {
        const athleteDocRef = doc(db, "users", coachId, "managed_athletes", athleteId);
        const docSnap = await getDoc(athleteDocRef);

        if (docSnap.exists()) {
            const athleteData = docSnap.data();
            athleteInfoP.querySelector('strong').textContent = athleteData.fullName || 'Không có tên';
        } else {
            console.error("Không tìm thấy thông tin VĐV");
            athleteInfoP.querySelector('strong').textContent = "Không xác định";
        }
    } catch (error) {
        console.error("Lỗi khi tải thông tin VĐV:", error);
        alert("Đã xảy ra lỗi khi tải thông tin VĐV.");
    }
}

// --- Gửi bài tập ---
async function sendExercise(e) {
    e.preventDefault();
    const submitButton = exerciseForm.querySelector('.btn-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';

    const exerciseData = {
        title: exerciseForm.title.value,
        description: exerciseForm.description.value,
        dueDate: exerciseForm.dueDate.value,
        coachId: coachId,
        athleteId: athleteId,
        status: 'pending', // Trạng thái: pending, completed
        createdAt: serverTimestamp() // Thêm dấu thời gian của máy chủ
    };

    try {
        // Lưu bài tập vào bộ sưu tập con của VĐV
        const exercisesColRef = collection(db, "users", athleteId, "exercises");
        await addDoc(exercisesColRef, exerciseData);
        
        alert('Gửi bài tập thành công!');
        window.location.href = 'coach-dashboard.html';

    } catch (error) {
        console.error("Lỗi khi gửi bài tập:", error);
        alert('Đã xảy ra lỗi khi gửi bài tập. Vui lòng thử lại.');
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi bài tập';
    }
}

