// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const athleteNameH2 = document.getElementById('athleteName');
const athleteInfoDiv = document.getElementById('athleteInfo');
const detailsPlaceholder = document.getElementById('detailsPlaceholder');
const athleteAgeEl = document.getElementById('athleteAge');
const athleteSportEl = document.getElementById('athleteSport');
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');

let unsubscribeSensor; // Biến để lưu hàm hủy lắng nghe sensor

// --- Hàm chính để khởi tạo bảng điều khiển ---
function initializeDashboard(coachUser) {
    // 1. Lắng nghe danh sách VĐV của HLV này trong thời gian thực
    const managedAthletesQuery = query(collection(db, `users/${coachUser.uid}/managed_athletes`));

    onSnapshot(managedAthletesQuery, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ để vẽ lại
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px; text-align: center; color: #888;">Chưa có VĐV nào trong danh sách.</p>';
            return;
        }

        snapshot.forEach(docSnapshot => {
            const athleteData = docSnapshot.data();
            const athleteId = docSnapshot.id;
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athleteId; // Lưu ID để dùng sau
            li.innerHTML = `
                <div class="athlete-avatar">${athleteData.fullName.charAt(0).toUpperCase()}</div>
                <span>${athleteData.fullName}</span>
            `;

            // Thêm sự kiện click để hiển thị chi tiết VĐV
            li.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                displayAthleteDetails(athleteData, athleteId);
            });
            athleteListUl.appendChild(li);
        });
    });

    // 2. Xử lý sự kiện đăng xuất
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch(error => console.error('Lỗi khi đăng xuất:', error));
    });
}

// --- Hàm hiển thị chi tiết VĐV ---
function displayAthleteDetails(athlete, athleteId) {
    // Ẩn placeholder và hiện vùng thông tin chi tiết
    detailsPlaceholder.style.display = 'none';
    athleteInfoDiv.style.display = 'block';

    // Cập nhật thông tin cơ bản
    athleteNameH2.textContent = `Chi tiết của ${athlete.fullName}`;
    athleteAgeEl.textContent = athlete.age || 'N/A';
    athleteSportEl.textContent = athlete.sport || 'Chưa cập nhật';
    
    // Hủy lắng nghe dữ liệu sensor cũ (nếu có) trước khi tạo lắng nghe mới
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Lắng nghe dữ liệu sensor của VĐV được chọn trong thời gian thực
    const sensorDocRef = doc(db, 'sensor_data', athleteId);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
        } else {
            // Đặt lại giá trị nếu VĐV này chưa có dữ liệu sensor
            heartRateEl.textContent = '--';
            spo2El.textContent = '--';
        }
    });
}

// --- "Hàng rào" bảo mật ---
// Kiểm tra trạng thái đăng nhập của người dùng mỗi khi trang được tải
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Người dùng đã đăng nhập. Bây giờ kiểm tra vai trò của họ.
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'coach') {
            // Nếu đúng là HLV, cho phép truy cập và khởi tạo bảng điều khiển
            initializeDashboard(user);
        } else {
            // Nếu không phải HLV, đăng xuất và chuyển về trang đăng nhập
            alert("Bạn không có quyền truy cập trang này.");
            signOut(auth);
        }
    } else {
        // Người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

