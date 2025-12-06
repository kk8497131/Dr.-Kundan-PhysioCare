// Authentication System with Google Login and Excel Export

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupAuthForms();
        this.checkLoginStatus();
        this.setupGoogleLogin();
    }

    setupAuthForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }

        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration(registerForm);
            });
        }
    }

    validateLoginForm(form) {
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value.trim();
        
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        return true;
    }

    validateRegisterForm(form) {
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const phone = form.querySelector('#phone').value.trim();
        const password = form.querySelector('#password').value.trim();
        const confirmPassword = form.querySelector('#confirmPassword').value.trim();
        
        // Basic validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        if (!this.isValidPhone(phone)) {
            this.showError('Please enter a valid phone number');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }
        
        return true;
    }

    async handleLogin(form) {
        if (!this.validateLoginForm(form)) return;
        
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const rememberMe = form.querySelector('#rememberMe')?.checked;
        
        try {
            // Simulate API call
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                this.loginUser(user, rememberMe);
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
            console.error('Login error:', error);
        }
    }

    async handleRegistration(form) {
        if (!this.validateRegisterForm(form)) return;
        
        const userData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value,
            password: form.querySelector('#password').value,
            createdAt: new Date().toISOString(),
            role: 'patient'
        };
        
        try {
            // Save user to localStorage (simulating database)
            const success = await this.registerUser(userData);
            
            if (success) {
                this.showSuccess('Registration successful! You can now login.');
                
                // Clear form
                form.reset();
                
                // Redirect to login after delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showError('Email already registered');
            }
        } catch (error) {
            this.showError('Registration failed. Please try again.');
            console.error('Registration error:', error);
        }
    }

    async authenticateUser(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user
        const user = users.find(u => 
            u.email === email && u.password === password
        );
        
        return user || null;
    }

    async registerUser(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get existing users
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return false;
        }
        
        // Add new user
        users.push(userData);
        
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Save to Excel simulation
        this.saveUserToExcel(userData);
        
        return true;
    }

    saveUserToExcel(userData) {
        // Simulate saving to Excel
        let userRecords = JSON.parse(localStorage.getItem('userRecords')) || [];
        
        const record = {
            timestamp: new Date().toISOString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            status: 'active'
        };
        
        userRecords.push(record);
        localStorage.setItem('userRecords', JSON.stringify(userRecords));
    }

    loginUser(user, rememberMe = false) {
        this.currentUser = user;
        
        // Save to sessionStorage for current session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Save to localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({
                email: user.email,
                rememberMe: true
            }));
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Update UI
        this.updateAuthUI();
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        
        this.updateAuthUI();
        window.location.href = 'index.html';
    }

    checkLoginStatus() {
        // Check session storage first
        const sessionUser = sessionStorage.getItem('currentUser');
        
        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
        } else {
            // Check remembered user
            const remembered = localStorage.getItem('rememberedUser');
            if (remembered) {
                const { email } = JSON.parse(remembered);
                // Auto-login could be implemented here
            }
        }
        
        this.updateAuthUI();
    }

    updateAuthUI() {
        const authButtons = document.querySelectorAll('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.currentUser && userMenu) {
            // Show user menu
            userMenu.style.display = 'block';
            document.querySelector('.user-name').textContent = this.currentUser.name;
            
            // Hide login/register buttons
            authButtons.forEach(btn => btn.style.display = 'none');
        }
    }

    setupGoogleLogin() {
        const googleBtn = document.querySelector('.google-login');
        if (!googleBtn) return;
        
        googleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // In a real application, implement Google OAuth2
                // For demo, we'll simulate it
                
                // Show loading state
                const originalText = googleBtn.innerHTML;
                googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in with Google...';
                googleBtn.disabled = true;
                
                // Simulate Google OAuth process
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Create demo user
                const googleUser = {
                    name: 'Google User',
                    email: 'demo@google.com',
                    role: 'patient',
                    googleAuth: true,
                    createdAt: new Date().toISOString()
                };
                
                // Login the user
                this.loginUser(googleUser);
                this.showSuccess('Google login successful!');
                
                // Redirect
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (error) {
                this.showError('Google login failed');
                console.error('Google login error:', error);
                
                // Reset button
                googleBtn.innerHTML = originalText;
                googleBtn.disabled = false;
            }
        });
    }

    // Utility methods
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{9,12}$/;
        return re.test(phone.replace(/\D/g, ''));
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.auth-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show auth-alert" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Add to form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    // Admin function to export users to Excel
    exportUsersToExcel() {
        const users = JSON.parse(localStorage.getItem('userRecords')) || [];
        
        if (users.length === 0) {
            this.showError('No user records found');
            return;
        }
        
        // Convert to CSV
        const headers = ['Timestamp', 'Name', 'Email', 'Phone', 'Role', 'Status'];
        const csvRows = [
            headers.join(','),
            ...users.map(user => [
                user.timestamp,
                `"${user.name}"`,
                user.email,
                user.phone,
                user.role,
                user.status
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        
        // Create download
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
    const authSystem = new AuthSystem();
    
    // Make available globally
    window.authSystem = authSystem;
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authSystem.logout();
        });
    }
    
    // Admin export buttons (for demo purposes)
    const exportUsersBtn = document.getElementById('exportUsersBtn');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', () => {
            authSystem.exportUsersToExcel();
        });
    }
    
    const exportAppointmentsBtn = document.getElementById('exportAppointmentsBtn');
    if (exportAppointmentsBtn && window.appointmentSystem) {
        exportAppointmentsBtn.addEventListener('click', () => {
            window.appointmentSystem.exportToExcel();
        });
    }
});