const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        _id: data.user._id,
        name: data.user.name,
        role: data.user.role // 'freelancer' or 'client'
      }));

      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || 'Login failed');
    }

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
});
