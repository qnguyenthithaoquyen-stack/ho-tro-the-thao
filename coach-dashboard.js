// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

    // Kiểm tra để đảm bảo tất cả các phần tử đều tồn tại
    if (!logoutButton || !athleteListUl || !detailsPlaceholder || !detailsContent || !athleteNameEl) {
        console.error("Lỗi nghiêm trọng: Một hoặc nhiều phần tử HTML cần thiết không được tìm thấy. Vui lòng kiểm tra lại ID trong tệp HTML.");
        return; // Dừng thực thi nếu giao diện bị lỗi
    }

    let unsubscribeSensor; // Biến để lưu hàm hủy đăng ký listener của sensor

    // --- Giám sát trạng thái đăng nhập ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            initializeDashboard(user);
        } else {
            // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // --- Khởi tạo các chức năng cho trang ---
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
        const q = query(managedAthletesColRef);

        onSnapshot(q, (snapshot) => {
            athleteListUl.innerHTML = ''; // Xóa danh sách cũ
            if (snapshot.empty) {
                athleteListUl.innerHTML = '<p style="padding: 12px; color: #6c757d;">Chưa có VĐV nào.</p>';
                return;
            }
            snapshot.forEach(doc => {
                try { // Bọc trong try...catch để tránh lỗi làm sập toàn bộ trang
                    const athlete = doc.data();
                    const athleteId = doc.id;

                    // Xử lý an toàn hơn nếu VĐV không có dữ liệu
                    if (!athlete) {
                        console.warn(`Tài liệu VĐV với ID ${athleteId} không có dữ liệu.`);
                        return; // Bỏ qua và xử lý VĐV tiếp theo
                    }
                    
                    const li = document.createElement('li');
                    li.className = 'athlete-item';
                    li.dataset.athleteId = athleteId;
                    
                    const athleteName = athlete.fullName || 'Chưa có tên';
                    // Chuyển đổi an toàn sang chuỗi trước khi lấy ký tự đầu
                    const initial = String(athleteName).charAt(0).toUpperCase();

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
                } catch (error) {
                    console.error(`Đã xảy ra lỗi khi xử lý VĐV với ID: ${doc.id}`, error);
                }
            });
        });
    }

    // --- Hàm hiển thị chi tiết VĐV ---
    function displayAthleteDetails(athleteId, athleteData) {
        if (!detailsContent || !detailsPlaceholder || !athleteNameEl) return;

        detailsPlaceholder.style.display = 'none';
        detailsContent.style.display = 'block';

        // Điền thông tin cá nhân
        athleteNameEl.textContent = athleteData.fullName || 'Chưa có tên';
        athleteEmailEl.textContent = athleteData.email || 'Chưa cập nhật';
        athleteDobEl.textContent = athleteData.dateOfBirth || 'Chưa cập nhật';
        athleteCityEl.textContent = athleteData.city || 'Chưa cập nhật';

        // Hủy listener cũ (nếu có) trước khi tạo listener mới
        if (unsubscribeSensor) {
            unsubscribeSensor();
        }

        // Reset giá trị chỉ số về mặc định
        heartRateEl.textContent = '--';
        spo2El.textContent = '--';
        bloodPressureEl.textContent = '--';
        accelerationEl.textContent = '--';

        // Tạo listener mới cho dữ liệu sensor của VĐV này
        // Kiểm tra xem athleteId có tồn tại không trước khi tạo tham chiếu
        if (athleteId) {
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
        } else {
            console.error("Không thể lắng nghe dữ liệu sensor vì thiếu ID của VĐV.");
        }


        // Cập nhật chức năng cho các nút hành động
        const sendExerciseBtn = detailsContent.querySelector('.btn-send-exercise');
        if(sendExerciseBtn && athleteId) {
            sendExerciseBtn.href = `send-exercise.html?athleteId=${athleteId}`;
        }
    }
});

