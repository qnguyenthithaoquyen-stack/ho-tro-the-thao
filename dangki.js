// js/dangki.js

const auth = firebase.auth();

const signupForm = document.getElementById('signup-form'); // Assuming your form has this ID

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signupForm.email.value;
    const password = signupForm.password.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User account created:', userCredential.user.uid);
            // After successful registration, redirect to the role confirmation page.
            // The user is automatically logged in at this point.
            window.location.href = 'xacnhan-vaitro.html';
        })
        .catch(error => {
            console.error("Registration Error:", error);
            alert(`Registration failed: ${error.message}`);
        });
});
