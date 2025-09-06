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

// --- Hàm Chính - Chạy sau khi toàn bộ trang đã tải xong ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lấy các phần tử HTML ---
    const logoutButton = document.getElementById('logoutButton');
    const athleteListUl = document.getElementById('athleteList');
    const placeholder = document.getElementById('athlete-details-placeholder');
    const detailsContent = document.getElementById('athlete-details-content');
    const sendExerciseBtn = document.getElementById('send-exercise-btn');
    
    let currentCoach = null;
    let selectedAthleteId = null; // Biến lưu ID của VĐV đang được chọn
    let unsubscribeSensor; // Biến để hủy lắng nghe sensor cũ

    // --- Giám sát trạng thái đăng nhập ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentCoach = user;
            initializeDashboard(user);
        } else {
            // Chuyển hướng nếu chưa đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    function initializeDashboard(user) {
        // Chức năng Đăng xuất
        if(logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
            });
        }
        
        // Bắt đầu lắng nghe danh sách VĐV
        listenForAthletes(user.uid);

        // Chức năng nút "Gửi bài tập"
        if(sendExerciseBtn) {
            sendExerciseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (selectedAthleteId) {
                    // Truyền ID của VĐV qua URL
                    window.location.href = `send-exercise.html?athleteId=${selectedAthleteId}`;
                } else {
                    alert("Vui lòng chọn một vận động viên từ danh sách trước.");
                }
            });
        }
    }

    // --- Hàm lắng nghe và hiển thị danh sách VĐV ---
    function listenForAthletes(coachId) {
        if (!athleteListUl) return;
        const managedAthletesColRef = collection(db, "users", coachId, "managed_athletes");
        const q = query(managedAthletesColRef);

        onSnapshot(q, (snapshot) => {
            athleteListUl.innerHTML = ''; // Xóa danh sách cũ

            if (snapshot.empty) {
                athleteListUl.innerHTML = '<li style="padding: 12px; color: #6c757d; list-style-type: none;">Chưa có VĐV nào.</li>';
                return;
            }

            snapshot.forEach(doc => {
                const athlete = doc.data();
                const athleteId = doc.id;
                
                // Kiểm tra an toàn để tránh lỗi
                if (!athlete || typeof athlete.fullName !== 'string') {
                    console.warn("Phát hiện hồ sơ VĐV không hợp lệ, đang bỏ qua:", athlete);
                    return; 
                }

                const li = document.createElement('li');
                li.className = 'athlete-item';
                li.dataset.athleteId = athleteId;

                const initial = athlete.fullName ? athlete.fullName.charAt(0).toUpperCase() : '?';

                li.innerHTML = `
                    <div class="athlete-avatar">${initial}</div>
                    <span>${athlete.fullName}</span>
                `;

                li.addEventListener('click', () => {
                    document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                    li.classList.add('selected');
                    selectedAthleteId = athleteId;
                    displayAthleteDetails(athleteId, athlete);
                });
                athleteListUl.appendChild(li);
            });
        });
    }

    // --- Hàm hiển thị thông tin chi tiết của VĐV ---
    function displayAthleteDetails(athleteId, athlete) {
        if (!detailsContent || !placeholder) return;
        
        placeholder.style.display = 'none';
        detailsContent.style.display = 'block';

        // Lấy các phần tử hiển thị thông tin
        const nameEl = document.getElementById('athleteName');
        const emailEl = document.getElementById('athleteEmail');
        const dobEl = document.getElementById('athleteDob');
        const cityEl = document.getElementById('athleteCity');
        
        // Điền thông tin cá nhân một cách an toàn
        if (nameEl) nameEl.textContent = athlete.fullName || 'Chưa có tên';
        if (emailEl) emailEl.textContent = athlete.email || 'Chưa cập nhật';
        if (dobEl) dobEl.textContent = athlete.dateOfBirth || 'Chưa cập nhật';
        if (cityEl) cityEl.textContent = athlete.city || 'Chưa cập nhật';

        // Hủy lắng nghe sensor cũ (nếu có)
        if (unsubscribeSensor) {
            unsubscribeSensor();
        }

        // Lắng nghe dữ liệu sensor mới
        listenForSensorData(athleteId);
    }
    
    // --- Hàm lắng nghe dữ liệu sensor ---
    function listenForSensorData(athleteId) {
        const sensorDocRef = doc(db, 'sensor_data', athleteId);
        
        unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
            // Lấy các phần tử hiển thị chỉ số
            const heartRateEl = document.getElementById('heartRate');
            const spo2El = document.getElementById('spo2');
            const bloodPressureEl = document.getElementById('bloodPressure');
            const accelerationEl = document.getElementById('acceleration');

            const elements = [heartRateEl, spo2El, bloodPressureEl, accelerationEl];
            if (elements.some(el => el === null)) return; // Dừng nếu thiếu phần tử

            if (doc.exists()) {
                const data = doc.data();
                heartRateEl.textContent = data.heart_rate || '--';
                spo2El.textContent = data.spo2 || '--';
                bloodPressureEl.textContent = data.blood_pressure || '--';
                accelerationEl.textContent = data.acceleration || '--';
            } else {
                // Reset về giá trị mặc định nếu không có dữ liệu
                heartRateEl.textContent = '--';
                spo2El.textContent = '--';
                bloodPressureEl.textContent = '--';
                accelerationEl.textContent = '--';
            }
        });
    }
});

