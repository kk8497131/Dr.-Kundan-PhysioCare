// Appointment Booking System with Email Notification

class AppointmentSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupAppointmentForm();
        this.setupFormValidation();
        this.loadExistingAppointments();
    }

    setupAppointmentForm() {
        const form = document.getElementById('appointmentForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm(form)) {
                this.submitAppointment(form);
            }
        });

        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showError(field, 'This field is required');
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                isValid = false;
                this.showError(field, 'Please enter a valid email address');
            } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                isValid = false;
                this.showError(field, 'Please enter a valid phone number');
            } else {
                this.clearError(field);
            }
        });

        return isValid;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{9,12}$/;
        return re.test(phone.replace(/\D/g, ''));
    }

    showError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message text-danger mt-1';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.classList.add('is-invalid');
    }

    clearError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        field.classList.remove('is-invalid');
    }

    async submitAppointment(form) {
        const formData = new FormData(form);
        const appointmentData = Object.fromEntries(formData.entries());
        
        // Add timestamp and status
        appointmentData.id = Date.now();
        appointmentData.status = 'pending';
        appointmentData.createdAt = new Date().toISOString();

        try {
            // Save to localStorage (simulating database)
            this.saveAppointment(appointmentData);
            
            // Send email notification (simulated)
            await this.sendEmailNotification(appointmentData);
            
            // Show success message
            this.showSuccessMessage(appointmentData);
            
            // Reset form
            form.reset();
            
            // Send WhatsApp message (optional)
            this.sendWhatsAppMessage(appointmentData);
            
        } catch (error) {
            this.showErrorMessage('Failed to book appointment. Please try again.');
            console.error('Appointment booking error:', error);
        }
    }

    saveAppointment(data) {
        // Get existing appointments from localStorage
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Add new appointment
        appointments.push(data);
        
        // Save back to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Also save to Excel simulation
        this.saveToExcel(data);
    }

    saveToExcel(data) {
        // This is a simulation of saving to Excel
        // In a real application, this would be a server-side API call
        
        console.log('Saving to Excel simulation:', data);
        
        // You can implement actual Excel export using libraries like SheetJS
        // For now, we'll just log it
        const excelData = {
            timestamp: new Date().toISOString(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            service: data.service,
            date: data.date,
            time: data.time,
            message: data.message || ''
        };
        
        // Store in localStorage for demonstration
        let excelRecords = JSON.parse(localStorage.getItem('excelRecords')) || [];
        excelRecords.push(excelData);
        localStorage.setItem('excelRecords', JSON.stringify(excelRecords));
    }

    async sendEmailNotification(data) {
        // Simulate email sending
        // In a real application, use a service like EmailJS, SendGrid, or SMTP
        
        const emailContent = `
            New Appointment Request:
            
            Name: ${data.name}
            Email: ${data.email}
            Phone: ${data.phone}
            Service: ${data.service}
            Date: ${data.date}
            Time: ${data.time}
            Message: ${data.message || 'No additional message'}
            
            Appointment ID: ${data.id}
            Status: ${data.status}
        `;

        console.log('Email notification would be sent:', emailContent);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    }

    sendWhatsAppMessage(data) {
        const phoneNumber = '919876543210'; // Doctor's WhatsApp number
        const message = `New appointment request from ${data.name} for ${data.service} on ${data.date} at ${data.time}. Please check your email for details.`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Open in new tab (for demo)
        // window.open(whatsappUrl, '_blank');
        
        console.log('WhatsApp message would be sent:', message);
    }

    showSuccessMessage(data) {
        // Create success modal
        const modalHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <h5 class="modal-title text-success">Appointment Booked Successfully!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <i class="fas fa-check-circle fa-4x text-success"></i>
                            </div>
                            <h6 class="text-center mb-3">Appointment Details</h6>
                            <div class="appointment-details">
                                <p><strong>Appointment ID:</strong> ${data.id}</p>
                                <p><strong>Name:</strong> ${data.name}</p>
                                <p><strong>Date:</strong> ${data.date}</p>
                                <p><strong>Time:</strong> ${data.time}</p>
                                <p><strong>Service:</strong> ${data.service}</p>
                            </div>
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle"></i>
                                You will receive confirmation via email and WhatsApp shortly.
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        // Remove modal from DOM after hiding
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            modalContainer.remove();
        });
    }

    showErrorMessage(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add alert to form
        const form = document.getElementById('appointmentForm');
        if (form) {
            form.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    loadExistingAppointments() {
        // Load and display existing appointments (for admin view)
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        console.log('Existing appointments:', appointments);
        return appointments;
    }

    // Admin function to export appointments to Excel
    exportToExcel() {
        const appointments = this.loadExistingAppointments();
        
        // Convert to CSV format
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Created At'];
        const csvRows = [
            headers.join(','),
            ...appointments.map(app => [
                app.id,
                `"${app.name}"`,
                app.email,
                app.phone,
                app.service,
                app.date,
                app.time,
                app.status,
                app.createdAt
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize appointment system
document.addEventListener('DOMContentLoaded', function() {
    const appointmentSystem = new AppointmentSystem();
    
    // Make it available globally for admin functions
    window.appointmentSystem = appointmentSystem;
});