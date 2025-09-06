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
const athleteEmailSpan = document.getElementById('athleteEmailInfo');
const athleteDobSpan = document.getElementById('athleteDobInfo');
const athleteCitySpan = document.getElementById('athleteCityInfo');
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');
const bloodPressureEl = document.getElementById('bloodPressure');
const accelerationEl = document.getElementById('acceleration');

let currentCoach = null;
let unsubscribeSensor; // Biến để lưu hàm hủy đăng ký listener của sensor

// --- Hàm Chính ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentCoach = user;
        initializeDashboard(user);
    } else {
        // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

function initializeDashboard(user) {
    // 1. Cài đặt chức năng Đăng xuất
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'dangnhap.html';
        }).catch((error) => {
            console.error("Lỗi khi đăng xuất:", error);
        });
    });
    
    // 2. Lắng nghe và hiển thị danh sách VĐV
    listenForAthletes(user.uid);
}

// --- Hàm lắng nghe danh sách VĐV ---
function listenForAthletes(coachId) {
    const managedAthletesColRef = collection(db, "users", coachId, "managed_athletes");

    onSnapshot(managedAthletesColRef, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px; color: #6c757d;">Chưa có VĐV nào.</p>';
            return;
        }
        snapshot.forEach(doc => {
            const athlete = doc.data();
            const athleteId = doc.id;
            
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athleteId;
            
            const athleteName = athlete.fullName || 'Chưa có tên';
            const initial = athleteName.charAt(0).toUpperCase() || '?';

            li.innerHTML = `
                <div class="athlete-avatar">${initial}</div>
                <span>${athleteName}</span>
            `;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                displayAthleteDetails(athleteId, athlete);
            });
            
            athleteListUl.appendChild(li);
        });
    });
}

// --- Hàm hiển thị chi tiết VĐV ---
function displayAthleteDetails(athleteId, athleteData) {
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';

    // Điền thông tin cá nhân
    athleteNameH2.textContent = athleteData.fullName || 'Chưa có tên';
    athleteEmailSpan.textContent = athleteData.email || 'Chưa cập nhật';
    athleteDobSpan.textContent = athleteData.dateOfBirth || 'Chưa cập nhật';
    athleteCitySpan.textContent = athleteData.city || 'Chưa cập nhật';

    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    heartRateEl.textContent = '--';
    spo2El.textContent = '--';
    bloodPressureEl.textContent = '--';
    accelerationEl.textContent = '--';

    const sensorDocRef = doc(db, 'sensor_data', athleteId);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
            bloodPressureEl.textContent = data.blood_pressure || '--';
            accelerationEl.textContent = data.acceleration || '--';
        } else {
            console.log(`Không có dữ liệu sensor cho VĐV: ${athleteId}`);
        }
    });

    const sendExerciseBtn = detailsContent.querySelector('.btn-send-exercise');
    if(sendExerciseBtn) {
        sendExerciseBtn.href = `send-exercise.html?athleteId=${athleteId}`;
    }
}
