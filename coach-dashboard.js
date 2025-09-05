// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// --- DOM Elements ---
const logoutButton = document.getElementById('logoutButton');
const athleteListUl = document.getElementById('athleteList');
const detailsPlaceholder = document.getElementById('athlete-details-placeholder');
const detailsContent = document.getElementById('athlete-details-content');
const athleteNameEl = document.getElementById('athleteName');
const athleteEmailEl = document.getElementById('athleteEmail');
const athleteDobEl = document.getElementById('athleteDob');
const athleteCityEl = document.getElementById('athleteCity');
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');
const bloodPressureEl = document.getElementById('bloodPressure');
const accelerationEl = document.getElementById('acceleration');

// Biến toàn cục để giữ listener của sensor
let unsubscribeSensor;

// --- Hàm chính để khởi chạy trang ---
function initializeDashboard() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Lắng nghe danh sách VĐV được quản lý
            listenForManagedAthletes(user.uid);
        } else {
            window.location.href = 'dangnhap.html';
        }
    });

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'dangnhap.html';
        });
    });
}

// --- Lắng nghe và hiển thị danh sách VĐV ---
function listenForManagedAthletes(coachId) {
    // Truy vấn vào subcollection "managed_athletes"
    const managedAthletesCol = collection(db, "users", coachId, "managed_athletes");
    const q = query(managedAthletesCol);

    onSnapshot(q, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px;">Chưa có VĐV nào trong danh sách.</p>';
            // Ẩn khu vực chi tiết nếu không có VĐV nào
            detailsPlaceholder.style.display = 'flex';
            detailsContent.style.display = 'none';
            return;
        }
        
        snapshot.forEach(doc => {
            const athlete = doc.data();
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athlete.uid; // Sử dụng uid của VĐV
            
            li.innerHTML = `
                <div class="athlete-avatar">${athlete.fullName.charAt(0).toUpperCase()}</div>
                <span>${athlete.fullName}</span>
            `;

            li.addEventListener('click', () => {
                // Làm nổi bật VĐV được chọn
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                // Hiển thị chi tiết
                displayAthleteDetails(athlete);
            });

            athleteListUl.appendChild(li);
        });
    });
}

// --- Hiển thị thông tin chi tiết của VĐV ---
function displayAthleteDetails(athlete) {
    // Hiển thị khu vực chi tiết và ẩn placeholder
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';

    // Hiển thị thông tin cơ bản
    athleteNameEl.textContent = athlete.fullName;
    athleteEmailEl.textContent = athlete.email;
    athleteDobEl.textContent = athlete.dateOfBirth || 'Chưa cập nhật';
    athleteCityEl.textContent = athlete.city || 'Chưa cập nhật';

    // Hủy listener cũ để tránh rò rỉ bộ nhớ
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Reset giá trị cảm biến về mặc định
    heartRateEl.textContent = '--';
    spo2El.textContent = '--';
    bloodPressureEl.textContent = '--';
    accelerationEl.textContent = '--';

    // Lắng nghe dữ liệu cảm biến thời gian thực cho VĐV được chọn
    // Chú ý: Cần có một collection 'sensor_data' và document có ID là UID của VĐV
    const sensorDocRef = doc(db, "sensor_data", athlete.uid);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
            bloodPressureEl.textContent = data.blood_pressure || '--';
            accelerationEl.textContent = data.acceleration || '--';
        } else {
            // Hiển thị 'N/A' nếu không có dữ liệu cảm biến
            heartRateEl.textContent = 'N/A';
            spo2El.textContent = 'N/A';
            bloodPressureEl.textContent = 'N/A';
            accelerationEl.textContent = 'N/A';
        }
    });
}

// --- Chạy hàm khởi tạo khi trang đã tải xong ---
document.addEventListener('DOMContentLoaded', initializeDashboard);
