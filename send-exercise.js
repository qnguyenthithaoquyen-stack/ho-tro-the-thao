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
const athleteNameTarget = document.getElementById('athleteNameTarget');
const exerciseForm = document.getElementById('exerciseForm');
const exerciseTitleInput = document.getElementById('exerciseTitle');
const exerciseDescriptionInput = document.getElementById('exerciseDescription');
const exerciseDateInput = document.getElementById('exerciseDate');
const submitButton = document.querySelector('.submit-btn');

let targetAthleteId = null;
let currentCoachId = null;

// --- Hàm chính ---
document.addEventListener('DOMContentLoaded', () => {
    // Lấy ID của VĐV từ URL
    const urlParams = new URLSearchParams(window.location.search);
    targetAthleteId = urlParams.get('athleteId');

    if (!targetAthleteId) {
        alert("Không tìm thấy ID của vận động viên. Đang quay lại bảng điều khiển.");
        window.location.href = 'coach-dashboard.html';
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Người dùng đã đăng nhập
            currentCoachId = user.uid;
            loadAthleteInfo();
        } else {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    exerciseForm.addEventListener('submit', handleFormSubmit);
});


// --- Hàm tải thông tin VĐV ---
async function loadAthleteInfo() {
    try {
        const athleteDocRef = doc(db, "users", targetAthleteId);
        const athleteDocSnap = await getDoc(athleteDocRef);

        if (athleteDocSnap.exists()) {
            const athleteData = athleteDocSnap.data();
            athleteNameTarget.textContent = athleteData.fullName || 'Không có tên';
        } else {
            athleteNameTarget.textContent = 'Không tìm thấy VĐV';
            submitButton.disabled = true; // Vô hiệu hóa nút gửi nếu không có VĐV
        }
    } catch (error) {
        console.error("Lỗi khi tải thông tin VĐV:", error);
        athleteNameTarget.textContent = 'Lỗi tải dữ liệu';
        submitButton.disabled = true;
    }
}


// --- Hàm xử lý gửi bài tập ---
async function handleFormSubmit(e) {
    e.preventDefault();

    const title = exerciseTitleInput.value;
    const description = exerciseDescriptionInput.value;
    const date = exerciseDateInput.value;

    if (!title || !description || !date) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';

    try {
        // Tạo một bộ sưu tập con 'exercises' bên trong tài liệu của VĐV
        const exercisesColRef = collection(db, "users", targetAthleteId, "exercises");

        await addDoc(exercisesColRef, {
            title: title,
            description: description,
            date: date,
            assignedBy: currentCoachId, // Lưu ID của HLV đã giao bài
            createdAt: serverTimestamp(), // Lưu thời gian tạo
            status: 'pending' // Trạng thái ban đầu
        });

        alert("Gửi bài tập thành công!");
        window.location.href = 'coach-dashboard.html'; // Quay lại bảng điều khiển sau khi gửi

    } catch (error) {
        console.error("Lỗi khi gửi bài tập:", error);
        alert("Đã xảy ra lỗi khi gửi bài tập. Vui lòng thử lại.");
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi bài tập';
    }
}

