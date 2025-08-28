// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
  authDomain: "sporthealthdata.firebaseapp.com",
  projectId: "sporthealthdata",
  storageBucket: "sporthealthdata.appspot.com",
  messagingSenderId: "789054240877",
  appId: "1:789054240877:web:04a400c9ea586523a86764",
  measurementId: "G-ZWS9C7P359"
};

// Initialize Firebase using v8 syntax
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Get the login form from the HTML
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the page from reloading

        // Get email and password from the input fields
        const email = e.target.email.value;
        const password = e.target.password.value;
        const submitButton = e.target.querySelector('.submit-btn');

        // Disable the button and show a loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Đang xử lý...';

        try {
            // 1. Use the Firebase SDK to sign in the user
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // 2. If successful, redirect to the role confirmation page
            alert('Đăng nhập thành công!');
            window.location.href = 'xacnhan-vaitro.html'; 

        } catch (error) {
            // Display an error to the user if login fails
            console.error("Lỗi đăng nhập:", error);
            alert('Đăng nhập thất bại: ' + error.message);
            
            // Re-enable the button
            submitButton.disabled = false;
            submitButton.textContent = 'Đăng Nhập';
        }
    });
}
