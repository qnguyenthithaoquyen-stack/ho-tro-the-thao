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

let unsubscribeSensor;

function initializeDashboard() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
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

function listenForManagedAthletes(coachId) {
    const managedAthletesCol = collection(db, "users", coachId, "managed_athletes");
    const q = query(managedAthletesCol);

    onSnapshot(q, (snapshot) => {
        athleteListUl.innerHTML = '';
        if (snapshot.empty) {
            athleteListUl.innerHTML = '<p style="padding: 12px;">Chưa có VĐV nào trong danh sách.</p>';
            detailsPlaceholder.style.display = 'flex';
            detailsContent.style.display = 'none';
            return;
        }
        
        snapshot.forEach(doc => {
            const athlete = doc.data();
            const fullName = athlete.fullName || 'Chưa có tên';
            const initial = fullName.charAt(0).toUpperCase();

            const li = document.createElement('li');
            li.className = 'athlete-item';
            li.dataset.athleteId = athlete.uid;
            
            li.innerHTML = `
                <div class="athlete-avatar">${initial}</div>
                <span>${fullName}</span>
            `;

            li.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                displayAthleteDetails(athlete);
            });

            athleteListUl.appendChild(li);
        });
    }, (error) => {
        console.error("ĐÃ XẢY RA LỖI KHI LẮNG NGHE DỮ LIỆU:", error);
    });
}

function displayAthleteDetails(athlete) {
    detailsPlaceholder.style.display = 'none';
    detailsContent.style.display = 'block';
    
    athleteNameEl.textContent = athlete.fullName || 'Chưa có tên';
    athleteEmailEl.textContent = athlete.email || 'Chưa cập nhật';
    athleteDobEl.textContent = athlete.dateOfBirth || 'Chưa cập nhật';
    athleteCityEl.textContent = athlete.city || 'Chưa cập nhật';

    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    heartRateEl.textContent = '--';
    spo2El.textContent = '--';
    bloodPressureEl.textContent = '--';
    accelerationEl.textContent = '--';

    // Giả sử có collection 'sensor_data' với document ID là UID của VĐV
    const sensorDocRef = doc(db, "sensor_data", athlete.uid);
    unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            heartRateEl.textContent = data.heart_rate || '--';
            spo2El.textContent = data.spo2 || '--';
            bloodPressureEl.textContent = data.blood_pressure || '--';
            accelerationEl.textContent = data.acceleration || '--';
        } else {
            heartRateEl.textContent = 'N/A';
            spo2El.textContent = 'N/A';
            bloodPressureEl.textContent = 'N/A';
            accelerationEl.textContent = 'N/A';
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeDashboard);

