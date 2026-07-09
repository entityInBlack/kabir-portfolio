// ===================== ADMIN AUTH (SHARED) =====================
// Used by: dashboard.html, posts.html, post-editor.html
// Responsibility: token check, /api/auth/verify call, redirects, logout.
// Does NOT touch the DOM beyond redirecting — each page handles its own
// loading state / content reveal via the onSuccess callback.

function checkAdminAuth(onSuccess) {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    // No token at all — straight to login
    window.location.href = 'login.html';
    return;
  }

  fetch('/api/auth/verify', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data) {
        onSuccess(data);
      } else {
        // Invalid/expired token
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
      }
    })
    .catch(() => {
      // Network/server error — fail safe to login
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
    });
}

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}