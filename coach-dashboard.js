// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// Chi tiết VĐV
const athleteNameH2 = document.getElementById('athleteName');
const athleteEmailSpan = document.getElementById('athleteEmail');
const athleteDobSpan = document.getElementById('athleteDob');
const athleteCitySpan = document.getElementById('athleteCity');

// Chỉ số cảm biến
const heartRateP = document.getElementById('heartRate');
const spo2P = document.getElementById('spo2');
const bloodPressureP = document.getElementById('bloodPressure');
const accelerationP = document.getElementById('acceleration');

// Nút chức năng
const sendExerciseBtn = document.querySelector('.btn-send-exercise');

let currentCoach = null;
let unsubscribeSensor;

// --- Hàm chính ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'coach') {
            currentCoach = user;
            initializeDashboard(user);
        } else {
            // Nếu người dùng không phải HLV, đăng xuất và chuyển về trang đăng nhập
            signOut(auth);
            window.location.href = 'dangnhap.html';
        }
    } else {
        // Nếu chưa đăng nhập, chuyển về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

function initializeDashboard(coach) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
    });

    listenForManagedAthletes(coach.uid);
}

function listenForManagedAthletes(coachId) {
    const managedAthletesColRef = collection(db, "users", coachId, "managed_athletes");
    
    onSnapshot(managedAthletesColRef, (snapshot) => {
        athleteListUl.innerHTML = '';
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px; color: var(--text-light-color);">Chưa có VĐV nào.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const athleteData = doc.data();
            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athleteData.uid;

            const athleteName = athleteData.fullName || 'Chưa có tên';
            const avatarChar = athleteName.charAt(0).toUpperCase();

            li.innerHTML = `
                <div class="athlete-avatar">${avatarChar}</div>
                <span>${athleteName}</span>
            `;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                displayAthleteDetails(athleteData);
            });
            athleteListUl.appendChild(li);
        });
    });
}

function displayAthleteDetails(athleteData) {
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';

    // Hiển thị thông tin cá nhân
    athleteNameH2.textContent = athleteData.fullName || 'Chưa có tên';
    athleteEmailSpan.textContent = athleteData.email || 'Chưa cập nhật';
    athleteDobSpan.textContent = athleteData.dateOfBirth || 'Chưa cập nhật';
    athleteCitySpan.textContent = athleteData.city || 'Chưa cập nhật';
    
    // Kích hoạt nút "Gửi bài tập" và gán link
    sendExerciseBtn.href = `send-exercise.html?athleteId=${athleteData.uid}`;
    
    // Hủy lắng nghe cũ (nếu có) trước khi tạo lắng nghe mới
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    // Reset giá trị chỉ số
    heartRateP.textContent = '--';
    spo2P.textContent = '--';
    bloodPressureP.textContent = '--';
    accelerationP.textContent = '--';

    // Lắng nghe dữ liệu cảm biến thời gian thực
    const sensorDocRef = doc(db, 'sensor_data', athleteData.uid);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateP.textContent = data.heart_rate !== undefined ? data.heart_rate : '--';
            spo2P.textContent = data.spo2 !== undefined ? data.spo2 : '--';
            bloodPressureP.textContent = data.blood_pressure !== undefined ? data.blood_pressure : '--';
            accelerationP.textContent = data.acceleration !== undefined ? data.acceleration : '--';
        }
    });
}

