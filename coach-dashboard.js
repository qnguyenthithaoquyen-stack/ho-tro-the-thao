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
const athleteDobEl = document.getElementById('athleteDob');
const athleteSportEl = document.getElementById('athleteSport');
const heartRateEl = document.getElementById('heartRate');
const spo2El = document.getElementById('spo2');

let unsubscribeSensor;

// --- Hàm chính để khởi tạo bảng điều khiển ---
function initializeDashboard(coachUser) {
    // Truy vấn đến bộ sưu tập con chứa các VĐV do HLV này quản lý
    const managedAthletesQuery = query(collection(db, `users/${coachUser.uid}/managed_athletes`));

    // Lắng nghe sự thay đổi trong danh sách VĐV theo thời gian thực
    onSnapshot(managedAthletesQuery, (snapshot) => {
        athleteListUl.innerHTML = ''; // Xóa danh sách cũ
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px; text-align: center; color: #888;">Chưa có VĐV nào trong danh sách.</p>';
            return;
        }

        // Tạo lại danh sách VĐV từ dữ liệu mới
        snapshot.forEach(docSnapshot => {
            const athleteData = docSnapshot.data();
            const athleteId = docSnapshot.id;
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athleteId;
            li.innerHTML = `
                <div class="athlete-avatar">${athleteData.fullName.charAt(0).toUpperCase()}</div>
                <span>${athleteData.fullName}</span>
            `;

            // Gắn sự kiện click cho mỗi VĐV trong danh sách
            li.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                displayAthleteDetails(athleteData, athleteId);
            });
            athleteListUl.appendChild(li);
        });
    });

    // Gắn sự kiện cho nút đăng xuất
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch(error => console.error('Lỗi khi đăng xuất:', error));
    });
}

// --- Hàm hiển thị chi tiết VĐV ---
function displayAthleteDetails(athlete, athleteId) {
    detailsPlaceholder.style.display = 'none'; // Ẩn thông báo chờ
    athleteInfoDiv.style.display = 'block'; // Hiện khu vực chi tiết

    // Cập nhật tên và các thông tin cơ bản
    athleteNameH2.textContent = `Chi tiết của ${athlete.fullName}`;
    athleteDobEl.textContent = athlete.dateOfBirth || 'N/A';
    athleteSportEl.textContent = athlete.sport || 'Chưa cập nhật';
    
    // Hủy lắng nghe cũ (nếu có) trước khi tạo lắng nghe mới để tránh rò rỉ bộ nhớ
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Lắng nghe dữ liệu cảm biến của VĐV này theo thời gian thực
    const sensorDocRef = doc(db, 'sensor_data', athleteId);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
        } else {
            // Reset giá trị nếu không có dữ liệu cảm biến
            heartRateEl.textContent = '--';
            spo2El.textContent = '--';
        }
    });
}

// --- "Hàng rào" bảo mật: Kiểm tra trạng thái đăng nhập ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Nếu có người dùng đăng nhập, kiểm tra vai trò của họ
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'coach') {
            // Nếu đúng là HLV, khởi tạo trang
            initializeDashboard(user);
        } else {
            // Nếu không phải HLV, báo lỗi và đăng xuất
            alert("Bạn không có quyền truy cập trang này.");
            signOut(auth);
        }
    } else {
        // Nếu không có ai đăng nhập, chuyển về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});
