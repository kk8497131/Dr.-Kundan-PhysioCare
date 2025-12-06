// Testimonials Management System

class TestimonialSystem {
    constructor() {
        this.testimonials = [];
        this.currentFilters = {
            service: 'all',
            rating: 'all',
            recovery: 'all'
        };
        this.helpfulCounts = {};
        this.init();
    }

    init() {
        this.loadTestimonials();
        this.setupEventListeners();
        this.setupFilters();
        this.setupRatingInput();
        this.setupVideoModal();
        this.setupBeforeAfterSlider();
        this.setupTestimonialForm();
        this.initializeHelpfulButtons();
    }

    loadTestimonials() {
        // Sample testimonials data
        this.testimonials = [
            {
                id: 1,
                name: "Priya Sharma",
                age: 32,
                occupation: "Software Engineer",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                rating: 5,
                treatment: "pain",
                recovery: "full",
                title: "Chronic Back Pain Relief",
                content: "Chronic back pain from sitting for long hours had made my life miserable. Dr. PhysioCare's ergonomic assessment and targeted exercises completely eliminated my pain. I can now work 10+ hours without any discomfort!",
                date: "January 2023",
                location: "Bangalore",
                helpful: 24,
                video: false
            },
            {
                id: 2,
                name: "Amit Patel",
                age: 45,
                occupation: "Business Owner",
                image: "https://randomuser.me/api/portraits/men/65.jpg",
                rating: 4.5,
                treatment: "home-visit",
                recovery: "significant",
                title: "Home Visit for Elderly Father",
                content: "The home visit service was a blessing for my 80-year-old father after his hip replacement. The therapist was punctual, professional, and extremely caring. My father regained mobility much faster than expected.",
                date: "December 2022",
                location: "Mumbai",
                helpful: 18,
                video: false
            },
            {
                id: 3,
                name: "Neha Verma",
                age: 28,
                occupation: "Teacher",
                image: "https://randomuser.me/api/portraits/women/28.jpg",
                rating: 5,
                treatment: "pain",
                recovery: "significant",
                title: "Neck Pain Completely Gone",
                content: "Suffered from severe neck pain for years. Tried multiple treatments with no relief. Within 4 weeks of starting physiotherapy at Dr. PhysioCare, my pain reduced by 90%. The dry needling treatment was particularly effective.",
                date: "February 2023",
                location: "Delhi",
                helpful: 32,
                video: false
            },
            {
                id: 4,
                name: "Rahul Singh",
                age: 35,
                occupation: "Marathon Runner",
                image: "https://randomuser.me/api/portraits/men/45.jpg",
                rating: 5,
                treatment: "sports",
                recovery: "full",
                title: "Back to Running After Injury",
                content: "Plantar fasciitis was preventing me from running. Dr. PhysioCare's shockwave therapy combined with custom orthotics completely resolved the issue. I successfully completed my first marathon 3 months after treatment!",
                date: "November 2022",
                location: "Pune",
                helpful: 15,
                video: true
            },
            {
                id: 5,
                name: "Sunita Reddy",
                age: 65,
                occupation: "Homemaker",
                image: "https://randomuser.me/api/portraits/women/65.jpg",
                rating: 5,
                treatment: "neurological",
                recovery: "significant",
                title: "Stroke Recovery Journey",
                content: "After a stroke, I lost movement in my right side. The neurological rehabilitation program helped me regain most of my functions. The therapists were incredibly patient and motivating throughout the journey.",
                date: "October 2022",
                location: "Hyderabad",
                helpful: 28,
                video: false
            },
            {
                id: 6,
                name: "Vikram Malhotra",
                age: 52,
                occupation: "Bank Manager",
                image: "https://randomuser.me/api/portraits/men/55.jpg",
                rating: 4.5,
                treatment: "pain",
                recovery: "full",
                title: "Frozen Shoulder Cured",
                content: "Frozen shoulder made daily activities impossible. The combination of manual therapy and specific exercises provided remarkable relief. Now I can move my arm freely without pain.",
                date: "September 2022",
                location: "Chennai",
                helpful: 21,
                video: false
            }
        ];

        // Load helpful counts from localStorage
        this.loadHelpfulCounts();
    }

    setupEventListeners() {
        // Filter buttons
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Load more button
        document.getElementById('loadMoreTestimonials').addEventListener('click', () => {
            this.loadMoreTestimonials();
        });

        // Add testimonial button
        document.getElementById('addTestimonial').addEventListener('click', () => {
            // Already handled by Bootstrap modal
        });

        // Video play buttons
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.playVideo(e.target.closest('.video-card'));
            });
        });
    }

    setupFilters() {
        // Service filter
        document.getElementById('filterService').addEventListener('change', (e) => {
            this.currentFilters.service = e.target.value;
        });

        // Rating filter
        document.getElementById('filterRating').addEventListener('change', (e) => {
            this.currentFilters.rating = e.target.value;
        });

        // Recovery filter
        document.getElementById('filterRecovery').addEventListener('change', (e) => {
            this.currentFilters.recovery = e.target.value;
        });
    }

    applyFilters() {
        const filteredTestimonials = this.testimonials.filter(testimonial => {
            // Service filter
            if (this.currentFilters.service !== 'all' && 
                testimonial.treatment !== this.currentFilters.service) {
                return false;
            }

            // Rating filter
            if (this.currentFilters.rating !== 'all') {
                const minRating = parseFloat(this.currentFilters.rating);
                if (testimonial.rating < minRating) {
                    return false;
                }
            }

            // Recovery filter
            if (this.currentFilters.recovery !== 'all' && 
                testimonial.recovery !== this.currentFilters.recovery) {
                return false;
            }

            return true;
        });

        this.displayFilteredTestimonials(filteredTestimonials);
    }

    resetFilters() {
        // Reset filter values
        document.getElementById('filterService').value = 'all';
        document.getElementById('filterRating').value = 'all';
        document.getElementById('filterRecovery').value = 'all';

        // Reset current filters
        this.currentFilters = {
            service: 'all',
            rating: 'all',
            recovery: 'all'
        };

        // Display all testimonials
        this.displayFilteredTestimonials(this.testimonials);
    }

    displayFilteredTestimonials(testimonials) {
        // For demo purposes, we'll just show a message
        // In a real app, you would update the testimonials grid
        const count = testimonials.length;
        alert(`Found ${count} testimonials matching your filters`);
    }

    loadMoreTestimonials() {
        // Simulate loading more testimonials
        const button = document.getElementById('loadMoreTestimonials');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;

        setTimeout(() => {
            // In a real app, you would load more testimonials from an API
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Update count
            const countElement = button.nextElementSibling;
            countElement.textContent = 'Showing 14 of 500+ testimonials';
            
            // Show success message
            this.showMessage('More testimonials loaded successfully!', 'success');
        }, 1500);
    }

    setupRatingInput() {
        const stars = document.querySelectorAll('.rating-input .stars i');
        const ratingValue = document.getElementById('ratingValue');

        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                this.highlightStars(rating);
            });

            star.addEventListener('mouseleave', () => {
                const currentRating = parseInt(ratingValue.value) || 0;
                this.highlightStars(currentRating);
            });

            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                ratingValue.value = rating;
                this.highlightStars(rating);
            });
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.rating-input .stars i');
        
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            
            star.classList.remove('active', 'hovered');
            
            if (starRating <= rating) {
                star.classList.add('active');
            }
        });
    }

    setupVideoModal() {
        const videoModal = document.getElementById('videoModal');
        const videoIframe = document.getElementById('testimonialVideo');
        
        // Set video sources (in a real app, these would be real video URLs)
        const videoSources = {
            1: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example video
            2: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            3: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        };

        videoModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const videoId = button.dataset.videoId || 1;
            videoIframe.src = videoSources[videoId] + "?autoplay=1";
        });

        videoModal.addEventListener('hidden.bs.modal', () => {
            videoIframe.src = "";
        });
    }

    setupBeforeAfterSlider() {
        // Initialize Slick carousel for before/after slider
        $('.before-after-slider').slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            adaptiveHeight: true,
            autoplay: true,
            autoplaySpeed: 5000,
            prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>'
        });
    }

    setupTestimonialForm() {
        const form = document.getElementById('testimonialForm');
        const submitBtn = document.getElementById('submitTestimonial');

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.validateTestimonialForm()) {
                    this.submitTestimonial();
                }
            });
        }
    }

    validateTestimonialForm() {
        const form = document.getElementById('testimonialForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.markFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }

            // Email validation
            if (field.type === 'email' && field.value) {
                if (!this.isValidEmail(field.value)) {
                    this.markFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }

            // Rating validation
            if (field.id === 'ratingValue' && field.value === '0') {
                this.showMessage('Please select a rating', 'error');
                isValid = false;
            }
        });

        return isValid;
    }

    async submitTestimonial() {
        const formData = new FormData(document.getElementById('testimonialForm'));
        const testimonialData = {
            name: formData.get('yourName'),
            email: formData.get('yourEmail'),
            age: formData.get('yourAge'),
            phone: formData.get('yourPhone'),
            treatment: formData.get('treatmentType'),
            recovery: formData.get('recoveryStatus'),
            title: formData.get('testimonialTitle'),
            content: formData.get('testimonialText'),
            rating: parseInt(formData.get('ratingValue')),
            consentPhoto: formData.get('consentPhoto') === '1',
            contactMe: formData.get('contactMe') === '1',
            date: new Date().toISOString(),
            status: 'pending' // Admin approval needed
        };

        try {
            // Show loading
            const submitBtn = document.getElementById('submitTestimonial');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Save to localStorage (simulating API call)
            await this.saveTestimonial(testimonialData);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTestimonialModal'));
            modal.hide();

            // Reset form
            document.getElementById('testimonialForm').reset();
            document.getElementById('ratingValue').value = '0';
            this.highlightStars(0);

            // Show success message
            this.showMessage('Thank you for sharing your experience! Your testimonial will be reviewed and published soon.', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error submitting testimonial:', error);
            this.showMessage('Failed to submit testimonial. Please try again.', 'error');
            
            // Reset button
            const submitBtn = document.getElementById('submitTestimonial');
            submitBtn.innerHTML = 'Submit Testimonial';
            submitBtn.disabled = false;
        }
    }

    async saveTestimonial(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get existing testimonials
        let testimonials = JSON.parse(localStorage.getItem('patientTestimonials')) || [];
        
        // Add new testimonial
        testimonials.push({
            ...data,
            id: Date.now(),
            helpful: 0
        });
        
        // Save back to localStorage
        localStorage.setItem('patientTestimonials', JSON.stringify(testimonials));

        // Save to Excel (simulated)
        this.saveToExcel(data);

        console.log('Testimonial saved:', data);
    }

    saveToExcel(data) {
        // Prepare Excel data
        const excelData = {
            timestamp: new Date().toISOString(),
            name: data.name,
            email: data.email,
            age: data.age || 'Not specified',
            phone: data.phone || 'Not specified',
            treatment: data.treatment,
            recovery: data.recovery,
            rating: data.rating,
            title: data.title,
            content: data.content.substring(0, 100) + '...', // Truncate for Excel
            consentPhoto: data.consentPhoto ? 'Yes' : 'No',
            contactMe: data.contactMe ? 'Yes' : 'No',
            status: data.status
        };

        // Get existing records
        let excelRecords = JSON.parse(localStorage.getItem('testimonialRecords')) || [];
        
        // Add new record
        excelRecords.push(excelData);
        
        // Save back
        localStorage.setItem('testimonialRecords', JSON.stringify(excelRecords));

        console.log('Testimonial saved to Excel simulation:', excelData);
    }

    initializeHelpfulButtons() {
        document.querySelectorAll('.btn-helpful').forEach(button => {
            const testimonialId = button.dataset.testimonial;
            
            // Check if user has already marked this helpful
            const hasMarked = localStorage.getItem(`helpful_${testimonialId}`);
            
            if (hasMarked) {
                button.classList.add('active');
                button.innerHTML = '<i class="fas fa-thumbs-up"></i> Helpful';
            }

            button.addEventListener('click', () => {
                this.markHelpful(testimonialId, button);
            });
        });
    }

    markHelpful(testimonialId, button) {
        // Check if already marked
        const hasMarked = localStorage.getItem(`helpful_${testimonialId}`);
        
        if (hasMarked) {
            // Already marked, do nothing or show message
            this.showMessage('You have already marked this testimonial as helpful!', 'info');
            return;
        }

        // Mark as helpful
        localStorage.setItem(`helpful_${testimonialId}`, 'true');
        
        // Update button
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-thumbs-up"></i> Helpful';
        
        // Update count
        let count = parseInt(button.parentElement.querySelector('.testimonial-footer small:last-child').textContent.match(/\d+/)[0]);
        count += 1;
        button.parentElement.querySelector('.testimonial-footer small:last-child').innerHTML = `<i class="fas fa-thumbs-up me-1"></i> ${count} people found this helpful`;
        
        // Save to database (simulated)
        this.saveHelpfulCount(testimonialId, count);
        
        this.showMessage('Thank you for your feedback!', 'success');
    }

    saveHelpfulCount(testimonialId, count) {
        // In a real app, this would update the database
        console.log(`Testimonial ${testimonialId} helpful count updated to ${count}`);
    }

    loadHelpfulCounts() {
        // Load helpful counts from localStorage
        this.testimonials.forEach(testimonial => {
            const storedCount = localStorage.getItem(`helpful_count_${testimonial.id}`);
            if (storedCount) {
                testimonial.helpful = parseInt(storedCount);
            }
        });
    }

    // Utility methods
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
        const existingMessages = document.querySelectorAll('.testimonial-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type} testimonial-message`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        const container = document.querySelector('.testimonials-grid .container') || document.body;
        container.insertAdjacentElement('afterbegin', messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    playVideo(videoCard) {
        const videoTitle = videoCard.querySelector('h5').textContent;
        alert(`Playing video: ${videoTitle}\n\nIn a real application, this would open a modal with the actual video.`);
    }

    // Export testimonials to Excel (admin function)
    exportTestimonialsToExcel() {
        const testimonials = JSON.parse(localStorage.getItem('testimonialRecords')) || [];
        
        if (testimonials.length === 0) {
            this.showMessage('No testimonial records found', 'error');
            return;
        }

        // Convert to CSV
        const headers = ['Timestamp', 'Name', 'Email', 'Age', 'Phone', 'Treatment', 'Recovery', 'Rating', 'Title', 'Content', 'Consent Photo', 'Contact Me', 'Status'];
        
        const csvRows = [
            headers.join(','),
            ...testimonials.map(testimonial => [
                testimonial.timestamp,
                `"${testimonial.name}"`,
                testimonial.email,
                testimonial.age,
                testimonial.phone,
                testimonial.treatment,
                testimonial.recovery,
                testimonial.rating,
                `"${testimonial.title}"`,
                `"${testimonial.content}"`,
                testimonial.consentPhoto,
                testimonial.contactMe,
                testimonial.status
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        
        // Create download
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `testimonials_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Make available globally
window.TestimonialSystem = TestimonialSystem;