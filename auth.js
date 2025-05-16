const auth = (() => {
  const STORAGE_KEY = 'gadgetstore_auth_user';

  // Current logged in user object {username: string}
  let currentUser = null;

  // Callbacks triggered on auth state change
  const authChangeCallbacks = [];

  // Load user from localStorage
  function loadUser() {
    const userJson = localStorage.getItem(STORAGE_KEY);
    if (userJson) {
      try {
        currentUser = JSON.parse(userJson);
      } catch {
        currentUser = null;
      }
    }
  }

  // Save user to localStorage
  function saveUser() {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Simulate login, real app should validate creds
  function login(username, password) {
    // Simple validation for demo
    if (!username || !password) {
      return false;
    }
    // For demo, accept any username/password!
    currentUser = { username };
    saveUser();
    triggerAuthChange();
    return true;
  }

  // Simulate signup, just logs in user if username valid
  function signup(username, password) {
    if (!username || !password) {
      return false;
    }
    // In real app, signup logic here
    currentUser = { username };
    saveUser();
    triggerAuthChange();
    return true;
  }

  function logout() {
    currentUser = null;
    saveUser();
    triggerAuthChange();
  }

  function isLoggedIn() {
    return currentUser !== null;
  }

  function getUser() {
    return currentUser;
  }

  // Registers callback for auth changes
  function listenAuthChanges(callback) {
    if (typeof callback === 'function') {
      authChangeCallbacks.push(callback);
    }
  }

  function triggerAuthChange() {
    authChangeCallbacks.forEach((fn) => fn());
  }

  // Render Navbar auth buttons dynamically
  function renderNavbar() {
    const container = document.getElementById('auth-buttons');
    if (!container) return;
    container.innerHTML = '';
    if (isLoggedIn()) {
      // Logged in UI: Add Listing, Logout
      const addListingLi = document.createElement('li');
      addListingLi.className = 'nav-item';
      const addListingA = document.createElement('a');
      addListingA.className = 'nav-link btn btn-primary text-white px-3 ms-2';
      addListingA.href = 'add-listing.html';
      addListingA.textContent = 'Add Listing';
      addListingLi.appendChild(addListingA);

      const logoutLi = document.createElement('li');
      logoutLi.className = 'nav-item';
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn btn-outline-danger ms-2';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.href = 'index.html';
      });
      logoutLi.appendChild(logoutBtn);

      container.appendChild(addListingLi);
      container.appendChild(logoutLi);
    } else {
      // Not logged in UI: Login, Signup
      const loginLi = document.createElement('li');
      loginLi.className = 'nav-item';
      const loginA = document.createElement('a');
      loginA.className = 'nav-link';
      loginA.href = 'login.html';
      loginA.textContent = 'Login';
      loginLi.appendChild(loginA);

      const signupLi = document.createElement('li');
      signupLi.className = 'nav-item';
      const signupA = document.createElement('a');
      signupA.className = 'nav-link';
      signupA.href = 'signup.html';
      signupA.textContent = 'Signup';
      signupLi.appendChild(signupA);

      container.appendChild(loginLi);
      container.appendChild(signupLi);
    }
  }

  // Initialize on script load
  loadUser();

  return {
    login,
    signup,
    logout,
    isLoggedIn,
    getUser,
    renderNavbar,
    listenAuthChanges,
  };
})();
