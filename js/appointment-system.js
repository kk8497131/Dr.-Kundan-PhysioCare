// Advanced Appointment Booking System

class AppointmentSystem {
    constructor() {
        this.selectedService = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.appointmentData = {};
        this.availableSlots = [];
        this.init();
    }

    init() {
        this.setupStepNavigation();
        this.setupServiceSelection();
        this.setupCalendar();
        this.setupFormValidation();
        this.setupTimeSlots();
        this.setupPaymentOptions();
        this.loadMyAppointments();
        this.setupEmergencyModal();
    }

    setupStepNavigation() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const nextStep = parseInt(e.target.closest('.next-step').dataset.next);
                this.goToStep(nextStep);
            });
        });

        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const prevStep = parseInt(e.target.closest('.prev-step').dataset.prev);
                this.goToStep(prevStep);
            });
        });

        // Confirm booking button
        const confirmBtn = document.getElementById('confirmBooking');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmBooking();
            });
        }
    }

    goToStep(step) {
        // Validate current step before proceeding
        const currentStep = this.getCurrentStep();
        
        if (step > currentStep && !this.validateStep(currentStep)) {
            this.showError('Please complete all required fields before proceeding');
            return;
        }

        // Update step indicators
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
        document.getElementById(`step${step}-content`).classList.add('active');

        // Update sidebar summary
        this.updateSidebarSummary();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getCurrentStep() {
        const activeStep = document.querySelector('.step-content.active');
        if (!activeStep) return 1;
        
        const stepId = activeStep.id.replace('step', '').replace('-content', '');
        return parseInt(stepId);
    }

    validateStep(step) {
        let isValid = true;

        switch(step) {
            case 1:
                // Service selection validation
                if (!this.selectedService) {
                    this.showError('Please select a service');
                    isValid = false;
                }
                break;

            case 2:
                // Date and time validation
                if (!this.selectedDate || !this.selectedTime) {
                    this.showError('Please select a date and time');
                    isValid = false;
                }
                break;

            case 3:
                // Patient details validation
                isValid = this.validatePatientForm();
                break;

            case 4:
                // Terms and conditions validation
                const termsAgreed = document.getElementById('terms')?.checked;
                if (!termsAgreed) {
                    this.showError('Please agree to the terms and conditions');
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    validatePatientForm() {
        let isValid = true;
        const requiredFields = [
            'patientName', 'patientAge', 'patientPhone', 
            'patientEmail', 'patientGender', 'visitType'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.markFieldError(field, 'This field is required');
                isValid = false;
            } else if (field) {
                this.clearFieldError(field);
            }

            // Additional validations
            if (fieldId === 'patientEmail' && field && field.value) {
                if (!this.isValidEmail(field.value)) {
                    this.markFieldError(field, 'Please enter a valid email');
                    isValid = false;
                }
            }

            if (fieldId === 'patientPhone' && field && field.value) {
                if (!this.isValidPhone(field.value)) {
                    this.markFieldError(field, 'Please enter a valid 10-digit phone number');
                    isValid = false;
                }
            }

            if (fieldId === 'patientAge' && field && field.value) {
                const age = parseInt(field.value);
                if (age < 1 || age > 120) {
                    this.markFieldError(field, 'Please enter a valid age (1-120)');
                    isValid = false;
                }
            }
        });

        // Health concern validation
        const healthConcern = document.getElementById('healthConcern');
        if (healthConcern && !healthConcern.value.trim()) {
            this.markFieldError(healthConcern, 'Please describe your health concern');
            isValid = false;
        } else if (healthConcern) {
            this.clearFieldError(healthConcern);
        }

        return isValid;
    }

    setupServiceSelection() {
        document.querySelectorAll('.service-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove selection from all options
                document.querySelectorAll('.service-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add selection to clicked option
                option.classList.add('selected');

                // Store selected service
                this.selectedService = option.dataset.service;
                
                // Update service info
                const serviceName = option.querySelector('h5').textContent;
                const servicePrice = option.querySelector('.service-price').textContent;
                
                this.appointmentData.service = this.selectedService;
                this.appointmentData.serviceName = serviceName;
                this.appointmentData.price = servicePrice;

                // Update summary
                this.updateSidebarSummary();
            });
        });
    }

    setupCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        // Initialize calendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: this.generateAvailableDates(),
            dateClick: (info) => {
                this.handleDateClick(info.date);
            },
            validRange: {
                start: new Date(),
                end: new Date(new Date().setMonth(new Date().getMonth() + 3))
            },
            weekends: true,
            businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
                startTime: '09:00',
                endTime: '20:00'
            }
        });

        calendar.render();
        this.calendar = calendar;
    }

    generateAvailableDates() {
        const today = new Date();
        const events = [];
        
        // Generate available dates for next 3 months
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Skip Sundays (0) and only show Monday-Saturday
            if (date.getDay() !== 0) {
                events.push({
                    title: 'Available',
                    start: date,
                    color: '#2a9d8f',
                    display: 'background'
                });
            }
        }

        return events;
    }

    handleDateClick(date) {
        const selectedDate = date.toISOString().split('T')[0];
        this.selectedDate = selectedDate;
        this.appointmentData.date = selectedDate;

        // Format date for display
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update displays
        document.getElementById('selectedDateDisplay').textContent = formattedDate;
        
        // Generate time slots for selected date
        this.generateTimeSlots(date);

        // Update summary
        this.updateSidebarSummary();
    }

    generateTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer) return;

        // Clear existing slots
        timeSlotsContainer.innerHTML = '';

        // Generate time slots (9 AM to 8 PM, 1-hour slots)
        const slots = [];
        const startHour = 9;
        const endHour = 20;

        // Check if date is today - only show future slots
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        for (let hour = startHour; hour < endHour; hour++) {
            // Skip lunch break (1 PM - 2 PM)
            if (hour === 13) continue;

            const slotTime = new Date(date);
            slotTime.setHours(hour, 0, 0, 0);

            // Skip if slot is in the past (for today)
            if (isToday && slotTime < now) continue;

            // Format time for display
            const startTime = hour.toString().padStart(2, '0') + ':00';
            const endTime = (hour + 1).toString().padStart(2, '0') + ':00';
            const displayTime = `${startTime} - ${endTime}`;

            // Create slot element
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = displayTime;
            slotElement.dataset.time = `${startTime}-${endTime}`;

            // Add click event
            slotElement.addEventListener('click', () => {
                this.selectTimeSlot(slotElement, displayTime, `${startTime}-${endTime}`);
            });

            timeSlotsContainer.appendChild(slotElement);
            slots.push(slotElement);
        }

        this.availableSlots = slots;
    }

    selectTimeSlot(slotElement, displayTime, timeValue) {
        // Remove selection from all slots
        this.availableSlots.forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked slot
        slotElement.classList.add('selected');

        // Store selected time
        this.selectedTime = timeValue;
        this.appointmentData.time = displayTime;
        this.appointmentData.timeValue = timeValue;

        // Update summary
        this.updateSidebarSummary();
    }

    setupTimeSlots() {
        // This will be handled by generateTimeSlots
    }

    setupFormValidation() {
        // Real-time validation for patient form
        const patientForm = document.getElementById('step3-content');
        if (patientForm) {
            const inputs = patientForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (input.value.trim()) {
                        this.clearFieldError(input);
                    }
                });
            });
        }
    }

    setupPaymentOptions() {
        const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
        const onlineOptions = document.getElementById('onlinePaymentOptions');

        paymentOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (option.value === 'online' && option.checked) {
                    onlineOptions.style.display = 'block';
                } else {
                    onlineOptions.style.display = 'none';
                }
            });
        });

        // Payment button handlers
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.processOnlinePayment(btn.textContent.trim());
            });
        });
    }

    updateSidebarSummary() {
        // Update service
        const sidebarService = document.getElementById('sidebarService');
        if (sidebarService && this.appointmentData.serviceName) {
            sidebarService.textContent = this.appointmentData.serviceName;
        }

        // Update date
        const sidebarDate = document.getElementById('sidebarDate');
        if (sidebarDate && this.appointmentData.date) {
            const date = new Date(this.appointmentData.date);
            sidebarDate.textContent = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        // Update time
        const sidebarTime = document.getElementById('sidebarTime');
        if (sidebarTime && this.appointmentData.time) {
            sidebarTime.textContent = this.appointmentData.time;
        }

        // Update amount
        const sidebarAmount = document.getElementById('sidebarAmount');
        if (sidebarAmount && this.appointmentData.price) {
            sidebarAmount.textContent = this.appointmentData.price;
        }

        // Update confirmation summary
        this.updateConfirmationSummary();
    }

    updateConfirmationSummary() {
        // Service
        const summaryService = document.getElementById('summaryService');
        if (summaryService && this.appointmentData.serviceName) {
            summaryService.textContent = this.appointmentData.serviceName;
        }

        // Date
        const summaryDate = document.getElementById('summaryDate');
        if (summaryDate && this.appointmentData.date) {
            const date = new Date(this.appointmentData.date);
            summaryDate.textContent = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Time
        const summaryTime = document.getElementById('summaryTime');
        if (summaryTime && this.appointmentData.time) {
            summaryTime.textContent = this.appointmentData.time;
        }

        // Patient name
        const patientName = document.getElementById('patientName')?.value;
        const summaryPatient = document.getElementById('summaryPatient');
        if (summaryPatient && patientName) {
            summaryPatient.textContent = patientName;
        }

        // Contact
        const patientPhone = document.getElementById('patientPhone')?.value;
        const summaryContact = document.getElementById('summaryContact');
        if (summaryContact && patientPhone) {
            summaryContact.textContent = patientPhone;
        }

        // Visit type
        const visitType = document.getElementById('visitType')?.value;
        const summaryVisitType = document.getElementById('summaryVisitType');
        if (summaryVisitType && visitType) {
            summaryVisitType.textContent = visitType.charAt(0).toUpperCase() + visitType.slice(1);
        }

        // Amount
        const summaryAmount = document.getElementById('summaryAmount');
        if (summaryAmount && this.appointmentData.price) {
            summaryAmount.textContent = this.appointmentData.price;
        }
    }

    async confirmBooking() {
        // Validate all steps
        for (let i = 1; i <= 4; i++) {
            if (!this.validateStep(i)) {
                this.goToStep(i);
                return;
            }
        }

        // Collect all appointment data
        this.collectAppointmentData();

        try {
            // Show loading
            const confirmBtn = document.getElementById('confirmBooking');
            const originalText = confirmBtn.innerHTML;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            confirmBtn.disabled = true;

            // Save appointment
            const bookingId = await this.saveAppointment();

            // Send notifications
            await this.sendNotifications();

            // Show success
            this.showBookingSuccess(bookingId);

        } catch (error) {
            console.error('Booking error:', error);
            this.showError('Booking failed. Please try again.');
            
            // Reset button
            const confirmBtn = document.getElementById('confirmBooking');
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        }
    }

    collectAppointmentData() {
        // Collect patient details
        const patientForm = document.getElementById('step3-content');
        const inputs = patientForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.id || input.name;
            if (name) {
                if (input.type === 'checkbox') {
                    this.appointmentData[name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        this.appointmentData[name] = input.value;
                    }
                } else {
                    this.appointmentData[name] = input.value.trim();
                }
            }
        });

        // Add metadata
        this.appointmentData.bookingId = this.generateBookingId();
        this.appointmentData.bookingDate = new Date().toISOString();
        this.appointmentData.status = 'confirmed';
        this.appointmentData.paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'clinic';
    }

    generateBookingId() {
        return 'APT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    async saveAppointment() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get existing appointments
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        // Add new appointment
        appointments.push(this.appointmentData);

        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Save to Excel
        this.saveAppointmentToExcel();

        return this.appointmentData.bookingId;
    }

    saveAppointmentToExcel() {
        const excelData = {
            timestamp: new Date().toISOString(),
            bookingId: this.appointmentData.bookingId,
            patientName: this.appointmentData.patientName,
            patientPhone: this.appointmentData.patientPhone,
            patientEmail: this.appointmentData.patientEmail,
            service: this.appointmentData.serviceName,
            date: this.appointmentData.date,
            time: this.appointmentData.time,
            visitType: this.appointmentData.visitType,
            amount: this.appointmentData.price,
            paymentMethod: this.appointmentData.paymentMethod,
            status: this.appointmentData.status,
            bookingDate: this.appointmentData.bookingDate
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('appointmentRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('appointmentRecords', JSON.stringify(excelRecords));

        console.log('Appointment saved to Excel:', excelData);
    }

    async sendNotifications() {
        // Send email notification
        await this.sendEmailNotification();

        // Send WhatsApp notification
        this.sendWhatsAppNotification();

        // Send SMS notification (simulated)
        this.sendSMSNotification();
    }

    async sendEmailNotification() {
        const emailContent = `
            Appointment Confirmation - Dr. PhysioCare

            Dear ${this.appointmentData.patientName},

            Your appointment has been successfully booked.

            Appointment Details:
            - Booking ID: ${this.appointmentData.bookingId}
            - Service: ${this.appointmentData.serviceName}
            - Date: ${this.appointmentData.date}
            - Time: ${this.appointmentData.time}
            - Visit Type: ${this.appointmentData.visitType}
            - Amount: ${this.appointmentData.price}
            - Doctor: Dr. Rahul Sharma

            Important Notes:
            1. Please arrive 10 minutes before your appointment
            2. Bring any previous medical reports
            3. Wear comfortable clothing
            4. Cancellation policy: Free upto 24 hours before

            Contact Information:
            Clinic Address: 123 Health Street, Medical City
            Phone: +91 98765 43210
            Email: info@drphysiocare.com

            We look forward to serving you!

            Best regards,
            Dr. PhysioCare Team
        `;

        console.log('Email notification would be sent:', emailContent);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    sendWhatsAppNotification() {
        const phone = '919876543210';
        const message = `New appointment booked! 
Booking ID: ${this.appointmentData.bookingId}
Patient: ${this.appointmentData.patientName}
Service: ${this.appointmentData.serviceName}
Date: ${this.appointmentData.date}
Time: ${this.appointmentData.time}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        
        // Open in new tab for demo
        // window.open(whatsappUrl, '_blank');
        
        console.log('WhatsApp notification would be sent:', message);
    }

    sendSMSNotification() {
        // Simulate SMS sending
        console.log('SMS notification would be sent to:', this.appointmentData.patientPhone);
    }

    showBookingSuccess(bookingId) {
        // Hide booking form
        document.querySelectorAll('.step-content').forEach(content => {
            content.style.display = 'none';
        });

        // Show success message
        const statusDiv = document.getElementById('appointmentStatus');
        statusDiv.style.display = 'block';

        // Update booking ID
        document.getElementById('bookingId').textContent = bookingId;

        // Generate and show receipt
        this.generateReceipt(bookingId);

        // Scroll to success message
        statusDiv.scrollIntoView({ behavior: 'smooth' });
    }

    generateReceipt(bookingId) {
        const receipt = {
            bookingId: bookingId,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            patientName: this.appointmentData.patientName,
            service: this.appointmentData.serviceName,
            amount: this.appointmentData.price,
            status: 'Paid'
        };

        // Store receipt for download
        sessionStorage.setItem('lastReceipt', JSON.stringify(receipt));

        // Update download button
        const downloadBtn = document.querySelector('[href="#"]');
        if (downloadBtn) {
            downloadBtn.href = 'javascript:void(0)';
            downloadBtn.onclick = () => this.downloadReceipt(receipt);
        }
    }

    downloadReceipt(receipt) {
        const receiptContent = `
            DR. PHYSIOCARE
            =====================
            RECEIPT
            =====================
            Booking ID: ${receipt.bookingId}
            Date: ${receipt.date}
            Time: ${receipt.time}
            ---------------------
            Patient: ${receipt.patientName}
            Service: ${receipt.serviceName}
            Amount: ${receipt.amount}
            Status: ${receipt.status}
            =====================
            Thank you for choosing Dr. PhysioCare
            Contact: +91 98765 43210
            Email: info@drphysiocare.com
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receipt.bookingId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    loadMyAppointments() {
        // This would load appointments from localStorage/API
        // For demo, we'll show sample appointments
        const appointmentsList = document.getElementById('appointmentsList');
        if (!appointmentsList) return;

        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        if (appointments.length === 0) {
            return; // Show default "no appointments" message
        }

        // Filter appointments for current user (in real app, filter by user ID)
        const userAppointments = appointments.slice(0, 5); // Show first 5 for demo

        let appointmentsHTML = '';
        
        userAppointments.forEach(apt => {
            appointmentsHTML += `
                <div class="appointment-item">
                    <div class="appointment-header">
                        <div>
                            <h6>${apt.serviceName || 'Consultation'}</h6>
                            <small class="text-muted">Booking ID: ${apt.bookingId}</small>
                        </div>
                        <span class="badge bg-success">Confirmed</span>
                    </div>
                    <div class="appointment-details">
                        <div class="detail">
                            <i class="fas fa-calendar"></i>
                            <span>${apt.date}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <span>${apt.time}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-user"></i>
                            <span>${apt.patientName}</span>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-sm btn-outline-primary">Reschedule</button>
                        <button class="btn btn-sm btn-outline-danger">Cancel</button>
                        <button class="btn btn-sm btn-outline-secondary">Download</button>
                    </div>
                </div>
            `;
        });

        appointmentsList.innerHTML = appointmentsHTML;
    }

    setupEmergencyModal() {
        // Already handled by Bootstrap
    }

    // Utility methods
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

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.appointment-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create alert
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show appointment-alert" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to appointment card
        const appointmentCard = document.querySelector('.appointment-main-card');
        if (appointmentCard) {
            appointmentCard.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{9,12}$/;
        return re.test(phone.replace(/\D/g, ''));
    }

    processOnlinePayment(method) {
        alert(`Processing ${method} payment...\n\nIn a real application, this would integrate with:\n- Razorpay\n- Stripe\n- PayPal\n- Other payment gateways`);
    }

    // Export appointments to Excel (admin function)
    exportAppointmentsToExcel() {
        const appointments = JSON.parse(localStorage.getItem('appointmentRecords')) || [];
        
        if (appointments.length === 0) {
            this.showError('No appointment records found');
            return;
        }

        // Convert to CSV
        const headers = ['Timestamp', 'Booking ID', 'Patient Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Visit Type', 'Amount', 'Payment Method', 'Status', 'Booking Date'];
        
        const csvRows = [
            headers.join(','),
            ...appointments.map(apt => [
                apt.timestamp,
                apt.bookingId,
                `"${apt.patientName}"`,
                apt.patientPhone,
                apt.patientEmail,
                apt.service,
                apt.date,
                apt.time,
                apt.visitType,
                apt.amount,
                apt.paymentMethod,
                apt.status,
                apt.bookingDate
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        
        // Create download
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

// Make available globally
window.AppointmentSystem = AppointmentSystem;