import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
    authDomain: "sporthealthdata.firebaseapp.com",
    projectId: "sporthealthdata",
    storageBucket: "sporthealthdata.appspot.com",
    messagingSenderId: "789054240877",
    appId: "1:789054240877:web:04a400c9ea586523a86764",
    measurementId: "G-ZWS9C7P359"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const navigateTo = (page) => {
    const newURL = window.location.href.replace(/[^/]*$/, page);
    window.location.href = newURL;
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Người dùng đã đăng nhập, kiểm tra vai trò
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userRole = userDoc.data().role; // Lấy vai trò từ Firestore
            if (userRole === 'coach') {
                // Nếu là HLV, chuyển đến trang coach-dashboard.html
                navigateTo('coach-dashboard.html');
            } else {
                // Mặc định hoặc là VĐV, chuyển đến trang athlete-dashboard.html
                navigateTo('athlete-dashboard.html');
            }
        } else {
            // Không tìm thấy thông tin người dùng, mặc định chuyển về trang VĐV
            console.log("Không tìm thấy dữ liệu người dùng, chuyển hướng mặc định.");
            navigateTo('athlete-dashboard.html');
        }
    } else {
        // Người dùng chưa đăng nhập, chuyển về trang đăng nhập
        navigateTo('dangnhap.html');
    }
});
