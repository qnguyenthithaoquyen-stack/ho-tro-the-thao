// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// --- Hàm chính - Chạy sau khi toàn bộ trang đã tải xong ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lấy các phần tử HTML ---
    const logoutButton = document.getElementById('logoutButton');
    const athleteListUl = document.getElementById('athleteList');
    const detailsPlaceholder = document.getElementById('athlete-details-placeholder');
    const detailsContent = document.getElementById('athlete-details-content');
    
    // Thông tin chi tiết VĐV
    const athleteNameEl = document.getElementById('athleteName');
    const athleteEmailEl = document.getElementById('athleteEmail');
    const athleteDobEl = document.getElementById('athleteDob');
    const athleteCityEl = document.getElementById('athleteCity');

    // Chỉ số VĐV
    const heartRateEl = document.getElementById('heartRate');
    const spo2El = document.getElementById('spo2');
    const bloodPressureEl = document.getElementById('bloodPressure');
    const accelerationEl = document.getElementById('acceleration');
    
    // Nút chức năng
    const sendExerciseBtn = document.getElementById('send-exercise-btn');

    let currentCoach = null;
    let unsubscribeSensorListener = null; // Biến để lưu trữ hàm hủy lắng nghe

    // --- Giám sát trạng thái đăng nhập ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Người dùng đã đăng nhập
            currentCoach = user;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            // Kiểm tra vai trò
            if (userDocSnap.exists() && userDocSnap.data().role === 'coach') {
                initializeDashboard(user.uid);
            } else {
                alert("Bạn không có quyền truy cập trang này.");
                window.location.href = 'dangnhap.html';
            }
        } else {
            // Người dùng chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // --- Khởi chạy các chức năng của trang ---
    function initializeDashboard(coachId) {
        // Gán sự kiện cho nút đăng xuất
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
        });

        // Bắt đầu lắng nghe danh sách VĐV
        listenForManagedAthletes(coachId);
    }

    // --- Lắng nghe danh sách VĐV của HLV ---
    function listenForManagedAthletes(coachId) {
        const managedAthletesColRef = collection(db, "users", coachId, "managed_athletes");

        onSnapshot(managedAthletesColRef, (snapshot) => {
            athleteListUl.innerHTML = ''; // Xóa danh sách cũ
            if (snapshot.empty) {
                athleteListUl.innerHTML = '<p style="padding: 12px; color: var(--text-light-color);">Chưa có VĐV nào.</p>';
                return;
            }

            snapshot.forEach((athleteDoc) => {
                const athleteData = athleteDoc.data();
                const athleteId = athleteDoc.id;
                
                const li = document.createElement('li');
                li.className = 'athlete-item';
                li.dataset.athleteId = athleteId;

                const name = athleteData.fullName || "Chưa có tên";
                const avatarChar = name.charAt(0).toUpperCase();

                li.innerHTML = `
                    <div class="athlete-avatar">${avatarChar}</div>
                    <span>${name}</span>
                `;
                
                // Gán sự kiện click cho mỗi VĐV trong danh sách
                li.addEventListener('click', () => {
                    // Đánh dấu VĐV đang được chọn
                    document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                    li.classList.add('selected');
                    
                    // Hiển thị thông tin chi tiết
                    displayAthleteDetails(athleteId);
                });

                athleteListUl.appendChild(li);
            });
        });
    }

    // --- Hiển thị thông tin chi tiết của VĐV được chọn ---
    async function displayAthleteDetails(athleteId) {
        // Hủy lắng nghe cũ (nếu có) để tránh rò rỉ bộ nhớ
        if (unsubscribeSensorListener) {
            unsubscribeSensorListener();
        }

        try {
            const athleteDocRef = doc(db, "users", athleteId);
            const athleteDocSnap = await getDoc(athleteDocRef);

            if (athleteDocSnap.exists()) {
                const data = athleteDocSnap.data();
                
                // Điền thông tin cá nhân
                athleteNameEl.textContent = data.fullName || 'Chưa có tên';
                athleteEmailEl.textContent = data.email || 'Chưa có email';
                athleteDobEl.textContent = data.dateOfBirth || 'Chưa cập nhật';
                athleteCityEl.textContent = data.city || 'Chưa cập nhật';
                
                // Kích hoạt nút gửi bài tập và gán đúng link
                sendExerciseBtn.href = `send-exercise.html?athleteId=${athleteId}`;
                
                // Bắt đầu lắng nghe chỉ số của VĐV này
                listenForSensorData(athleteId);

                // Hiển thị khu vực chi tiết
                detailsPlaceholder.style.display = 'none';
                detailsContent.style.display = 'block';

            } else {
                console.error("Không tìm thấy thông tin của VĐV với ID:", athleteId);
            }
        } catch(error) {
            console.error("Lỗi khi lấy thông tin chi tiết VĐV:", error);
        }
    }

    // --- Lắng nghe dữ liệu cảm biến của VĐV ---
    function listenForSensorData(athleteId) {
        const sensorDocRef = doc(db, "sensor_data", athleteId);
        
        // Gán hàm hủy mới cho listener này
        unsubscribeSensorListener = onSnapshot(sensorDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
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

}); // Kết thúc DOMContentLoaded

