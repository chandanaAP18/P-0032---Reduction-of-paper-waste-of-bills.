function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  // simple login (no backend yet)
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("user", email);

  alert("Login successful");

  window.location.href = "index.html";
}