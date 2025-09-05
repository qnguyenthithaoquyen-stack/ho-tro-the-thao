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
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');
const bloodPressureEl = document.getElementById('bloodPressure');
const accelerationEl = document.getElementById('acceleration');

// Biến toàn cục để giữ listener của sensor, giúp hủy đăng ký khi không cần
let unsubscribeSensor;

// --- Hàm chính để khởi chạy trang ---
function initializeDashboard() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Người dùng đã đăng nhập, lắng nghe danh sách VĐV của họ
            listenForManagedAthletes(user.uid);
        } else {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // Gán sự kiện cho nút đăng xuất
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'dangnhap.html';
        });
    });
}

// --- Lắng nghe và hiển thị danh sách VĐV được quản lý ---
function listenForManagedAthletes(coachId) {
    const managedAthletesCol = collection(db, "users", coachId, "managed_athletes");
    const q = query(managedAthletesCol);

    onSnapshot(q, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px;">Chưa có VĐV nào trong danh sách.</p>';
            // Ẩn chi tiết và hiện placeholder nếu danh sách trống
            detailsPlaceholder.style.display = 'flex';
            detailsContent.style.display = 'none';
            return;
        }
        
        snapshot.forEach(doc => {
            const athlete = doc.data();
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athlete.uid;
            
            li.innerHTML = `
                <div class="athlete-avatar">${athlete.fullName.charAt(0).toUpperCase()}</div>
                <span>${athlete.fullName}</span>
            `;

            li.addEventListener('click', () => {
                // Đánh dấu mục đã chọn trên giao diện
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                
                // Hiển thị thông tin chi tiết của VĐV được chọn
                displayAthleteDetails(athlete);
            });

            athleteListUl.appendChild(li);
        });
    });
}

// --- Hiển thị thông tin chi tiết và lắng nghe chỉ số của VĐV ---
function displayAthleteDetails(athlete) {
    // Ẩn placeholder và hiện khu vực chi tiết
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';

    // Hiển thị thông tin cơ bản
    athleteNameEl.textContent = athlete.fullName;
    athleteEmailEl.textContent = athlete.email;
    athleteDobEl.textContent = athlete.dateOfBirth || 'Chưa cập nhật';

    // Hủy listener cũ trước khi tạo listener mới để tránh rò rỉ bộ nhớ
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Reset giá trị về mặc định trong khi chờ dữ liệu mới
    heartRateEl.textContent = '--';
    spo2El.textContent = '--';
    bloodPressureEl.textContent = '--';
    accelerationEl.textContent = '--';

    // Tạo tham chiếu đến tài liệu cảm biến của VĐV
    const sensorDocRef = doc(db, "sensor_data", athlete.uid);

    // Bắt đầu lắng nghe dữ liệu cảm biến thời gian thực
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
            bloodPressureEl.textContent = data.blood_pressure || '--';
            accelerationEl.textContent = data.acceleration || '--';
        } else {
            // Trường hợp VĐV chưa có dữ liệu cảm biến
            heartRateEl.textContent = 'N/A';
            spo2El.textContent = 'N/A';
            bloodPressureEl.textContent = 'N/A';
            accelerationEl.textContent = 'N/A';
        }
    });
}

// --- Chạy hàm khởi tạo sau khi toàn bộ trang đã tải xong ---
document.addEventListener('DOMContentLoaded', initializeDashboard);
