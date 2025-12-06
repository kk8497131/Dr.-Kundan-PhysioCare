// Registration System with Excel Export

class RegistrationSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupStepNavigation();
        this.setupFormValidation();
        this.setupPasswordStrength();
        this.setupConditionalFields();
        this.setupSocialRegistration();
        this.loadCountries();
    }

    setupStepNavigation() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const nextStep = e.target.closest('.next-step').dataset.next;
                this.goToStep(parseInt(nextStep));
            });
        });

        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const prevStep = e.target.closest('.prev-step').dataset.prev;
                this.goToStep(parseInt(prevStep));
            });
        });

        // Form submission
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRegistration();
            });
        }
    }

    goToStep(step) {
        // Validate current step before proceeding
        if (step > this.currentStep && !this.validateStep(this.currentStep)) {
            this.showError('Please complete all required fields before proceeding');
            return;
        }

        // Update current step
        this.currentStep = step;

        // Update progress indicators
        document.querySelectorAll('.step').forEach(stepEl => {
            const stepNumber = parseInt(stepEl.dataset.step);
            if (stepNumber <= step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });

        // Show/hide step content
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`step${step}`).classList.add('active');

        // Update form data
        this.saveStepData(this.currentStep - 1);

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    validateStep(step) {
        let isValid = true;
        const stepContent = document.getElementById(`step${step}`);

        // Get all required fields in this step
        const requiredFields = stepContent.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.markFieldError(field, 'This field is required');
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                isValid = false;
                this.markFieldError(field, 'Please enter a valid email address');
            } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                isValid = false;
                this.markFieldError(field, 'Please enter a valid phone number');
            } else if (field.id === 'password' && field.value.length < 6) {
                isValid = false;
                this.markFieldError(field, 'Password must be at least 6 characters');
            } else if (field.id === 'confirmPassword' && field.value !== document.getElementById('password').value) {
                isValid = false;
                this.markFieldError(field, 'Passwords do not match');
            } else {
                this.clearFieldError(field);
            }
        });

        // Special validation for step 3 (terms agreement)
        if (step === 3) {
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox.checked) {
                isValid = false;
                this.showError('You must agree to the terms and conditions');
            }
        }

        return isValid;
    }

    markFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Add error class to input
        field.classList.add('is-invalid');

        // Create or update error message
        let errorElement = formGroup.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupFormValidation() {
        // Real-time validation for email
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                if (emailField.value && !this.isValidEmail(emailField.value)) {
                    this.markFieldError(emailField, 'Please enter a valid email address');
                }
            });
        }

        // Real-time validation for phone
        const phoneField = document.getElementById('phone');
        if (phoneField) {
            phoneField.addEventListener('blur', () => {
                if (phoneField.value && !this.isValidPhone(phoneField.value)) {
                    this.markFieldError(phoneField, 'Please enter a valid 10-digit phone number');
                }
            });
        }

        // Password confirmation validation
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        
        if (passwordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('input', () => {
                if (confirmPasswordField.value !== passwordField.value) {
                    document.getElementById('passwordMatch').innerHTML = '<span class="text-danger">Passwords do not match</span>';
                } else {
                    document.getElementById('passwordMatch').innerHTML = '<span class="text-success">Passwords match</span>';
                }
            });
        }

        // DOB validation (minimum age 1, maximum 120)
        const dobField = document.getElementById('dob');
        if (dobField) {
            dobField.addEventListener('change', () => {
                const dob = new Date(dobField.value);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                
                if (age < 1 || age > 120) {
                    this.markFieldError(dobField, 'Please enter a valid date of birth');
                }
            });
        }
    }

    setupPasswordStrength() {
        const passwordField = document.getElementById('password');
        if (!passwordField) return;

        passwordField.addEventListener('input', () => {
            const password = passwordField.value;
            const strengthBar = document.getElementById('passwordStrength');
            const feedback = document.getElementById('passwordFeedback');

            if (!password) {
                strengthBar.style.width = '0%';
                strengthBar.className = 'progress-bar';
                feedback.textContent = 'Password strength';
                return;
            }

            // Calculate password strength
            let strength = 0;
            let feedbackText = '';

            // Length check
            if (password.length >= 8) strength += 25;
            
            // Contains lowercase
            if (/[a-z]/.test(password)) strength += 25;
            
            // Contains uppercase
            if (/[A-Z]/.test(password)) strength += 25;
            
            // Contains numbers or symbols
            if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;

            // Update progress bar
            strengthBar.style.width = `${strength}%`;
            
            // Set color based on strength
            if (strength <= 25) {
                strengthBar.className = 'progress-bar bg-danger';
                feedbackText = 'Weak password';
            } else if (strength <= 50) {
                strengthBar.className = 'progress-bar bg-warning';
                feedbackText = 'Fair password';
            } else if (strength <= 75) {
                strengthBar.className = 'progress-bar bg-info';
                feedbackText = 'Good password';
            } else {
                strengthBar.className = 'progress-bar bg-success';
                feedbackText = 'Strong password';
            }

            feedback.textContent = feedbackText;
        });
    }

    setupConditionalFields() {
        // Medical conditions toggle
        const conditionYes = document.getElementById('conditionsYes');
        const conditionNo = document.getElementById('conditionsNo');
        const conditionsDetails = document.getElementById('conditionsDetails');
        const otherCondition = document.getElementById('otherCondition');
        const otherConditionsText = document.getElementById('otherConditions');

        if (conditionYes && conditionNo) {
            conditionYes.addEventListener('change', () => {
                conditionsDetails.style.display = 'block';
            });

            conditionNo.addEventListener('change', () => {
                conditionsDetails.style.display = 'none';
            });
        }

        if (otherCondition) {
            otherCondition.addEventListener('change', () => {
                if (otherCondition.checked) {
                    otherConditionsText.style.display = 'block';
                } else {
                    otherConditionsText.style.display = 'none';
                }
            });
        }

        // Medications toggle
        const medsYes = document.getElementById('medsYes');
        const medsNo = document.getElementById('medsNo');
        const medicationDetails = document.getElementById('medicationDetails');

        if (medsYes && medsNo) {
            medsYes.addEventListener('change', () => {
                medicationDetails.style.display = 'block';
            });

            medsNo.addEventListener('change', () => {
                medicationDetails.style.display = 'none';
            });
        }

        // Health concerns
        const healthConcerns = document.getElementById('healthConcerns');
        const otherConcerns = document.getElementById('otherConcerns');

        if (healthConcerns) {
            healthConcerns.addEventListener('change', () => {
                if (healthConcerns.value === 'other') {
                    otherConcerns.style.display = 'block';
                } else {
                    otherConcerns.style.display = 'none';
                }
            });
        }

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const passwordField = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordField.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupSocialRegistration() {
        // Google registration
        const googleBtn = document.querySelector('.google-register');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.registerWithGoogle();
            });
        }

        // Facebook registration
        const facebookBtn = document.querySelector('.facebook-register');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => {
                this.registerWithFacebook();
            });
        }

        // WhatsApp registration
        const whatsappBtn = document.querySelector('.whatsapp-register');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                this.registerWithWhatsApp();
            });
        }
    }

    async submitRegistration() {
        // Validate all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            if (!this.validateStep(i)) {
                this.goToStep(i);
                this.showError(`Please complete all required fields in Step ${i}`);
                return;
            }
        }

        // Collect all form data
        this.saveStepData(1);
        this.saveStepData(2);
        this.saveStepData(3);

        // Prepare user data
        const userData = {
            ...this.formData,
            id: this.generateUserId(),
            registrationDate: new Date().toISOString(),
            status: 'active',
            role: 'patient',
            verified: false
        };

        try {
            // Show loading state
            const submitBtn = document.getElementById('submitRegistration');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            // Save user to database (localStorage for demo)
            await this.saveUser(userData);

            // Save to Excel
            this.saveToExcel(userData);

            // Send confirmation email
            await this.sendConfirmationEmail(userData);

            // Show success message
            this.showSuccess('Account created successfully! Redirecting to login...');

            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Registration failed. Please try again.');

            // Reset button
            const submitBtn = document.getElementById('submitRegistration');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    saveStepData(step) {
        const stepContent = document.getElementById(`step${step}`);
        if (!stepContent) return;

        // Collect all input values in this step
        const inputs = stepContent.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const name = input.id || input.name;
            if (name) {
                if (input.type === 'checkbox') {
                    this.formData[name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        this.formData[name] = input.value;
                    }
                } else {
                    this.formData[name] = input.value.trim();
                }
            }
        });
    }

    generateUserId() {
        return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveUser(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get existing users from localStorage
        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
            throw new Error('Email already registered');
        }

        // Add new user
        users.push(userData);

        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Also save to session for immediate login
        sessionStorage.setItem('currentUser', JSON.stringify(userData));

        return true;
    }

    saveToExcel(userData) {
        // Prepare Excel data
        const excelData = {
            timestamp: new Date().toISOString(),
            userId: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phone: userData.phone,
            dob: userData.dob,
            gender: userData.gender,
            address: userData.address || '',
            medicalConditions: this.formData.medicalConditions || 'none',
            medications: this.formData.medications || 'none',
            healthConcern: this.formData.healthConcerns || '',
            registrationDate: userData.registrationDate,
            status: userData.status
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('userRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('userRecords', JSON.stringify(excelRecords));

        console.log('User data saved to Excel simulation:', excelData);
    }

    async sendConfirmationEmail(userData) {
        // Simulate email sending
        const emailContent = `
            Welcome to Dr. PhysioCare!

            Dear ${userData.firstName} ${userData.lastName},

            Thank you for registering with Dr. PhysioCare. Your account has been successfully created.

            Account Details:
            - Name: ${userData.firstName} ${userData.lastName}
            - Email: ${userData.email}
            - Phone: ${userData.phone}
            - User ID: ${userData.id}

            You can now:
            1. Book appointments online
            2. Access your health records
            3. Receive appointment reminders
            4. Get personalized health tips

            To get started, please login to your account:
            http://drphysiocare.com/login.html

            If you have any questions, please contact us at:
            Phone: +91 98765 43210
            Email: info@drphysiocare.com

            Best regards,
            Dr. PhysioCare Team
        `;

        console.log('Confirmation email would be sent:', emailContent);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real application, you would use an email service like:
        // - EmailJS
        // - SendGrid
        // - SMTP server

        return true;
    }

    async registerWithGoogle() {
        try {
            // Show loading
            const originalText = document.querySelector('.google-register').innerHTML;
            document.querySelector('.google-register').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

            // Simulate Google OAuth process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create demo user from Google
            const googleUser = {
                firstName: 'Google',
                lastName: 'User',
                email: 'demo@google.com',
                phone: '9876543210',
                googleAuth: true,
                id: 'GOOGLE_' + Date.now(),
                registrationDate: new Date().toISOString(),
                status: 'active',
                role: 'patient',
                verified: true
            };

            // Save user
            await this.saveUser(googleUser);

            // Show success
            this.showSuccess('Google registration successful!');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Google registration error:', error);
            this.showError('Google registration failed');
        }
    }

    async registerWithFacebook() {
        // Similar to Google registration
        this.showInfo('Facebook registration coming soon!');
    }

    async registerWithWhatsApp() {
        // Send registration link via WhatsApp
        const phone = '919876543210';
        const message = `I would like to register for Dr. PhysioCare. Please assist me with the registration process.`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    }

    loadCountries() {
        // This could load countries from an API
        // For now, using a static list
        const countries = [
            'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
            'Germany', 'France', 'Japan', 'China', 'Singapore'
        ];

        const countrySelect = document.getElementById('country');
        if (countrySelect) {
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.toLowerCase();
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
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

    showInfo(message) {
        this.showAlert(message, 'info');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.registration-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create alert
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show registration-alert" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to form
        const form = document.querySelector('.registration-form');
        if (form) {
            form.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    // Export users to Excel (admin function)
    exportUsersToExcel() {
        const users = JSON.parse(localStorage.getItem('userRecords')) || [];
        
        if (users.length === 0) {
            this.showError('No user records found');
            return;
        }

        // Convert to CSV
        const headers = ['Timestamp', 'User ID', 'Name', 'Email', 'Phone', 'DOB', 'Gender', 'Address', 'Medical Conditions', 'Medications', 'Health Concern', 'Registration Date', 'Status'];
        
        const csvRows = [
            headers.join(','),
            ...users.map(user => [
                user.timestamp,
                user.userId,
                `"${user.name}"`,
                user.email,
                user.phone,
                user.dob,
                user.gender,
                `"${user.address}"`,
                user.medicalConditions,
                user.medications,
                user.healthConcern,
                user.registrationDate,
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

// Make available globally
window.RegistrationSystem = RegistrationSystem;