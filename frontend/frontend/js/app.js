// Toggle Signup form
document.getElementById('signupLink')?.addEventListener('click', () => {
  document.getElementById('signupDiv').style.display = 'block';
});

// Signup
document.getElementById('signupForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      db.ref('users/' + user.uid).set({ name, email });
      alert('Signup successful!');
      window.location.href = 'events.html';
    })
    .catch(error => { alert(error.message); });
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      alert('Login successful!');
      window.location.href = 'events.html';
    })
    .catch(error => { alert(error.message); });
});
