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

// Get the signup form from the HTML
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting normally

        // Get user data from the form
        const email = event.target.email.value;
        const password = event.target.password.value;
        const userRole = event.target.role.value;
        const submitButton = event.target.querySelector('.submit-btn');

        // Disable the button
        submitButton.disabled = true;
        submitButton.textContent = 'Đang tạo tài khoản...';

        try {
            // 1. Use Firebase to create a new user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('Tạo tài khoản thành công:', userCredential.user);

            // TODO: You can add code here to save additional user info 
            // (like full name, role, etc.) to a Firestore database.

            // 2. Save the chosen role to the browser's local storage
            localStorage.setItem('userRole', userRole);

            // 3. Redirect the user to the role confirmation page
            alert('Đăng ký thành công!');
            window.location.href = 'xacnhan-vaitro.html';

        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            alert('Đăng ký thất bại: ' + error.message);

            // Re-enable the button
            submitButton.disabled = false;
            submitButton.textContent = 'Đăng Ký';
        }
    });
}
