// Contact System with Map Integration

class ContactSystem {
    constructor() {
        this.map = null;
        this.marker = null;
        this.init();
    }

    init() {
        this.initializeMap();
        this.setupContactForm();
        this.setupQuestionForm();
        this.setupNewsletter();
        this.setupEmergencyButtons();
        this.setupSocialLinks();
        this.setupDepartmentContacts();
    }

    initializeMap() {
        // Check if map container exists
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Initialize map (Medical City, Delhi coordinates)
        this.map = L.map('map').setView([28.6139, 77.2090], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add custom marker icon
        const customIcon = L.divIcon({
            html: '<i class="fas fa-map-marker-alt" style="color: #2a9d8f; font-size: 30px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
            className: 'custom-marker'
        });

        // Add marker for clinic location
        this.marker = L.marker([28.6139, 77.2090], { icon: customIcon })
            .addTo(this.map)
            .bindPopup(`
                <div style="padding: 10px;">
                    <h5 style="margin: 0 0 10px 0; color: #2a9d8f;">Dr. PhysioCare Clinic</h5>
                    <p style="margin: 0 0 5px 0;">123 Health Street, Medical City</p>
                    <p style="margin: 0 0 5px 0;">New Delhi, India 110001</p>
                    <a href="https://maps.google.com/?q=28.6139,77.2090" target="_blank" style="color: #2a9d8f; text-decoration: none;">
                        <i class="fas fa-directions"></i> Get Directions
                    </a>
                </div>
            `)
            .openPopup();

        // Add nearby points of interest
        const poi = [
            {
                name: "Medical City Metro Station",
                coords: [28.6150, 77.2100],
                icon: '<i class="fas fa-subway"></i>'
            },
            {
                name: "Parking Area",
                coords: [28.6145, 77.2085],
                icon: '<i class="fas fa-parking"></i>'
            },
            {
                name: "Main Entrance",
                coords: [28.6138, 77.2092],
                icon: '<i class="fas fa-door-open"></i>'
            }
        ];

        poi.forEach(point => {
            L.marker(point.coords, {
                icon: L.divIcon({
                    html: point.icon,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    className: 'poi-marker'
                })
            })
            .addTo(this.map)
            .bindPopup(`<strong>${point.name}</strong>`);
        });
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateContactForm()) {
                this.submitContactForm();
            }
        });

        // Add real-time validation
        this.setupFormValidation(form);
    }

    setupFormValidation(form) {
        const emailField = form.querySelector('#contactEmail');
        const phoneField = form.querySelector('#contactPhone');

        if (emailField) {
            emailField.addEventListener('blur', () => {
                if (emailField.value && !this.isValidEmail(emailField.value)) {
                    this.markFieldError(emailField, 'Please enter a valid email address');
                } else {
                    this.clearFieldError(emailField);
                }
            });
        }

        if (phoneField) {
            phoneField.addEventListener('blur', () => {
                if (phoneField.value && !this.isValidPhone(phoneField.value)) {
                    this.markFieldError(phoneField, 'Please enter a valid phone number');
                } else {
                    this.clearFieldError(phoneField);
                }
            });
        }
    }

    validateContactForm() {
        const form = document.getElementById('contactForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.markFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }

            // Additional validations
            if (field.type === 'email' && field.value) {
                if (!this.isValidEmail(field.value)) {
                    this.markFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    async submitContactForm() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        const contactData = {
            name: formData.get('contactName'),
            email: formData.get('contactEmail'),
            phone: formData.get('contactPhone') || 'Not provided',
            subject: formData.get('contactSubject'),
            message: formData.get('contactMessage'),
            newsletter: formData.get('newsletterOptIn') === 'on',
            timestamp: new Date().toISOString(),
            status: 'unread'
        };

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Save to localStorage (simulating database)
            await this.saveContactMessage(contactData);

            // Send email using EmailJS (simulated in demo)
            await this.sendContactEmail(contactData);

            // Show success message
            this.showMessage('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');

            // Reset form
            form.reset();

            // Save to Excel
            this.saveToExcel(contactData);

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error submitting contact form:', error);
            this.showMessage('Failed to send message. Please try again.', 'error');
            
            // Reset button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i> Send Message';
            submitBtn.disabled = false;
        }
    }

    async saveContactMessage(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get existing messages
        let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        
        // Add new message
        messages.push({
            ...data,
            id: Date.now()
        });
        
        // Save back to localStorage
        localStorage.setItem('contactMessages', JSON.stringify(messages));

        return true;
    }

    async sendContactEmail(data) {
        // Prepare email template parameters for EmailJS
        const templateParams = {
            to_name: "Dr. PhysioCare Team",
            from_name: data.name,
            from_email: data.email,
            subject: `Website Contact: ${data.subject}`,
            phone: data.phone,
            message: data.message,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        try {
            // Send email using EmailJS
            // Note: In production, you need to set up EmailJS service
            // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            
            console.log('Email would be sent with parameters:', templateParams);
            
            // Simulate email sending for demo
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Contact email sent successfully!');
            return true;

        } catch (error) {
            console.error('Email sending failed:', error);
            // Even if email fails, we still save the message to localStorage
            return true;
        }
    }

    saveToExcel(data) {
        const excelData = {
            timestamp: new Date().toISOString(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message.substring(0, 100) + '...', // Truncate for Excel
            newsletter: data.newsletter ? 'Yes' : 'No',
            status: data.status
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('contactRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('contactRecords', JSON.stringify(excelRecords));

        console.log('Contact message saved to Excel:', excelData);
    }

    setupQuestionForm() {
        const questionForm = document.getElementById('questionForm');
        const submitBtn = document.getElementById('submitQuestion');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.validateQuestionForm()) {
                    this.submitQuestion();
                }
            });
        }

        // Close modal on success
        const modal = document.getElementById('askQuestionModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                if (questionForm) {
                    questionForm.reset();
                }
            });
        }
    }

    validateQuestionForm() {
        const form = document.getElementById('questionForm');
        const emailField = form.querySelector('#questionEmail');
        const questionField = form.querySelector('#questionText');
        let isValid = true;

        // Email validation
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.markFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearFieldError(emailField);
        }

        // Question validation
        if (!questionField.value.trim()) {
            this.markFieldError(questionField, 'Please enter your question');
            isValid = false;
        } else {
            this.clearFieldError(questionField);
        }

        return isValid;
    }

    async submitQuestion() {
        const form = document.getElementById('questionForm');
        const formData = new FormData(form);
        const questionData = {
            name: formData.get('questionName') || 'Anonymous',
            email: formData.get('questionEmail') || 'Not provided',
            category: formData.get('questionCategory') || 'general',
            question: formData.get('questionText'),
            timestamp: new Date().toISOString(),
            status: 'unanswered'
        };

        try {
            // Show loading
            const submitBtn = document.getElementById('submitQuestion');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Save question
            await this.saveQuestion(questionData);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('askQuestionModal'));
            modal.hide();

            // Show success message
            this.showMessage('Question submitted successfully! We\'ll respond via email.', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error submitting question:', error);
            this.showMessage('Failed to submit question. Please try again.', 'error');
            
            // Reset button
            const submitBtn = document.getElementById('submitQuestion');
            submitBtn.innerHTML = 'Submit Question';
            submitBtn.disabled = false;
        }
    }

    async saveQuestion(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get existing questions
        let questions = JSON.parse(localStorage.getItem('patientQuestions')) || [];
        
        // Add new question
        questions.push({
            ...data,
            id: Date.now()
        });
        
        // Save back to localStorage
        localStorage.setItem('patientQuestions', JSON.stringify(questions));

        // Save to Excel
        this.saveQuestionToExcel(data);

        return true;
    }

    saveQuestionToExcel(data) {
        const excelData = {
            timestamp: new Date().toISOString(),
            name: data.name,
            email: data.email,
            category: data.category,
            question: data.question.substring(0, 100) + '...',
            status: data.status
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('questionRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('questionRecords', JSON.stringify(excelData));

        console.log('Question saved to Excel:', excelData);
    }

    setupNewsletter() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!email) {
                this.showMessage('Please enter your email address', 'error');
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showMessage('Please enter a valid email address', 'error');
                return;
            }

            this.subscribeToNewsletter(email);
            emailInput.value = ''; // Clear input
        });
    }

    async subscribeToNewsletter(email) {
        try {
            // Show loading
            const submitBtn = document.querySelector('.newsletter-form button');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            // Save subscription
            await this.saveNewsletterSubscription(email);

            // Show success
            this.showMessage('Successfully subscribed to newsletter!', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            this.showMessage('Failed to subscribe. Please try again.', 'error');
        }
    }

    async saveNewsletterSubscription(email) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get existing subscriptions
        let subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions')) || [];
        
        // Check if already subscribed
        if (subscriptions.includes(email)) {
            throw new Error('Already subscribed');
        }

        // Add new subscription
        subscriptions.push(email);
        
        // Save back to localStorage
        localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));

        // Save to Excel
        this.saveSubscriptionToExcel(email);

        return true;
    }

    saveSubscriptionToExcel(email) {
        const excelData = {
            timestamp: new Date().toISOString(),
            email: email,
            source: 'website_contact_page'
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('subscriptionRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('subscriptionRecords', JSON.stringify(excelRecords));

        console.log('Newsletter subscription saved to Excel:', excelData);
    }

    setupEmergencyButtons() {
        // Emergency call buttons
        document.querySelectorAll('.btn-danger[href^="tel:"]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.trackEmergencyCall('phone');
            });
        });

        // Emergency WhatsApp buttons
        document.querySelectorAll('.btn-success[href*="whatsapp"]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.trackEmergencyCall('whatsapp');
            });
        });
    }

    trackEmergencyCall(method) {
        const emergencyData = {
            timestamp: new Date().toISOString(),
            method: method,
            page: 'contact'
        };

        // Save emergency call tracking
        let emergencyCalls = JSON.parse(localStorage.getItem('emergencyCalls')) || [];
        emergencyCalls.push(emergencyData);
        localStorage.setItem('emergencyCalls', JSON.stringify(emergencyCalls));

        console.log(`Emergency ${method} call tracked:`, emergencyData);
    }

    setupSocialLinks() {
        // Add analytics tracking to social media links
        document.querySelectorAll('.social-icon-large').forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.classList[1]; // facebook, twitter, etc.
                this.trackSocialClick(platform);
            });
        });
    }

    trackSocialClick(platform) {
        const socialData = {
            timestamp: new Date().toISOString(),
            platform: platform,
            page: 'contact'
        };

        // Save social click tracking
        let socialClicks = JSON.parse(localStorage.getItem('socialClicks')) || [];
        socialClicks.push(socialData);
        localStorage.setItem('socialClicks', JSON.stringify(socialClicks));

        console.log(`Social ${platform} click tracked:`, socialData);
    }

    setupDepartmentContacts() {
        // Add click tracking to department contact links
        document.querySelectorAll('.dept-contact').forEach(link => {
            link.addEventListener('click', (e) => {
                const department = link.closest('.department-card').querySelector('h5').textContent;
                this.trackDepartmentCall(department);
            });
        });
    }

    trackDepartmentCall(department) {
        const deptData = {
            timestamp: new Date().toISOString(),
            department: department,
            page: 'contact'
        };

        // Save department call tracking
        let deptCalls = JSON.parse(localStorage.getItem('departmentCalls')) || [];
        deptCalls.push(deptData);
        localStorage.setItem('departmentCalls', JSON.stringify(deptCalls));

        console.log(`Department ${department} call tracked:`, deptData);
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

    markFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        field.classList.add('is-invalid');

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

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.contact-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type} contact-message alert-dismissible fade show`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        const container = document.querySelector('.contact-form-section .container') || document.body;
        container.insertAdjacentElement('afterbegin', messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Export data functions (for admin)
    exportContactMessages() {
        const messages = JSON.parse(localStorage.getItem('contactRecords')) || [];
        
        if (messages.length === 0) {
            this.showMessage('No contact messages found', 'error');
            return;
        }

        this.exportToCSV(messages, 'contact_messages.csv');
    }

    exportQuestions() {
        const questions = JSON.parse(localStorage.getItem('questionRecords')) || [];
        
        if (questions.length === 0) {
            this.showMessage('No questions found', 'error');
            return;
        }

        this.exportToCSV(questions, 'patient_questions.csv');
    }

    exportSubscriptions() {
        const subscriptions = JSON.parse(localStorage.getItem('subscriptionRecords')) || [];
        
        if (subscriptions.length === 0) {
            this.showMessage('No subscriptions found', 'error');
            return;
        }

        this.exportToCSV(subscriptions, 'newsletter_subscriptions.csv');
    }

    exportToCSV(data, filename) {
        if (data.length === 0) return;

        // Extract headers from first object
        const headers = Object.keys(data[0]);
        
        // Convert to CSV rows
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Handle values that might contain commas or quotes
                    const stringValue = String(value || '');
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                }).join(',')
            )
        ];

        const csvString = csvRows.join('\n');
        
        // Create download
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showMessage(`Exported ${data.length} records to ${filename}`, 'success');
    }
}

// Make available globally
window.ContactSystem = ContactSystem;