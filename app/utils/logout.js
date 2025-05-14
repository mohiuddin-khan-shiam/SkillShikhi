// app/utils/logout.js
export function logout() {
    localStorage.removeItem('token');   // Remove the JWT token
    window.location.href = '/login';    // Redirect to login page
  }
  