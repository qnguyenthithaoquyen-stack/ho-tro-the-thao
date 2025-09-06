// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const logoutButton = document.getElementById('logoutButton');
const athleteListUl = document.getElementById('athleteList');
const detailsPlaceholder = document.getElementById('athlete-details-placeholder');
const detailsContent = document.getElementById('athlete-details-content');
const athleteNameH2 = document.getElementById('athleteName');
const athleteEmailSpan = document.getElementById('athleteEmail');
const athleteDobSpan = document.getElementById('athleteDob');
const athleteCitySpan = document.getElementById('athleteCity');

// Các ô chỉ số
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');
const bloodPressureEl = document.getElementById('bloodPressure');
const accelerationEl = document.getElementById('acceleration');

// Nút gửi bài tập
const sendExerciseBtn = document.querySelector('.btn-send-exercise');

let currentCoachId = null;
let unsubscribeSensor; // Biến để hủy lắng nghe sensor của VĐV cũ

// --- Hàm Chính ---
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentCoachId = user.uid;
            initializeDashboard(user);
        } else {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });
});

// --- Khởi tạo Bảng điều khiển ---
function initializeDashboard(user) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
    });

    listenForManagedAthletes(user.uid);
}

// --- Lắng nghe danh sách VĐV mà HLV quản lý ---
function listenForManagedAthletes(coachId) {
    const managedAthletesColRef = collection(db, "users", coachId, "managed_athletes");

    onSnapshot(managedAthletesColRef, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ để tải lại
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px; color: #6c757d;">Chưa có VĐV nào.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const athleteData = doc.data();
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = doc.id; // ID của VĐV
            
            // Xử lý an toàn trường hợp VĐV chưa có tên
            const athleteName = athleteData.fullName || "Chưa có tên";
            const initial = athleteName.charAt(0).toUpperCase();

            li.innerHTML = `
                <div class="athlete-avatar">${initial}</div>
                <span>${athleteName}</span>
            `;

            li.addEventListener('click', () => {
                // Đánh dấu mục được chọn
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                // Hiển thị chi tiết
                displayAthleteDetails(doc.id, athleteData);
            });

            athleteListUl.appendChild(li);
        });
    });
}

// --- Hiển thị chi tiết VĐV được chọn ---
function displayAthleteDetails(athleteId, athleteData) {
    // Ẩn placeholder và hiện nội dung chi tiết
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';

    // Điền thông tin cá nhân
    athleteNameH2.textContent = athleteData.fullName || 'Chưa có tên';
    athleteEmailSpan.textContent = athleteData.email || 'Chưa cập nhật';
    athleteDobSpan.textContent = athleteData.dateOfBirth || 'Chưa cập nhật';
    athleteCitySpan.textContent = athleteData.city || 'Chưa cập nhật';
    
    // Gán link cho nút "Gửi bài tập" với ID của VĐV được chọn
    sendExerciseBtn.href = `send-exercise.html?athleteId=${athleteId}`;

    // Hủy lắng nghe sensor của VĐV cũ để tránh rò rỉ bộ nhớ
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Bắt đầu lắng nghe dữ liệu sensor thời gian thực cho VĐV mới
    const sensorDocRef = doc(db, 'sensor_data', athleteId);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
            bloodPressureEl.textContent = data.blood_pressure || '--';
            accelerationEl.textContent = data.acceleration || '--';
        } else {
            // Nếu không có dữ liệu, hiển thị giá trị mặc định
            heartRateEl.textContent = '--';
            spo2El.textContent = '--';
            bloodPressureEl.textContent = '--';
            accelerationEl.textContent = '--';
        }
    });
}

