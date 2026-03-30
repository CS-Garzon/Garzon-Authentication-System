export function signup(username, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        return { success: false, message: "User already exists" };
    }
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
}

export function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: "Invalid credentials" };
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'Login.html';
}