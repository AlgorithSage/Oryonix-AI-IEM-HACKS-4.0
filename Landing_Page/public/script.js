document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('beta-form');
    const formGroups = document.querySelectorAll('.form-group');
    const clearBtn = document.getElementById('clear-form');
    const container = document.querySelector('.container');
    const STORAGE_KEY = 'oryonix_beta_form_draft';

    // Function to calculate and update real-time progress
    function updateProgress() {
        let answered = 0;
        
        // 1. Full name
        if (form.fullName.value.trim() !== '') answered++;
        // 2. Email
        if (form.email.value.trim() !== '' && form.email.checkValidity()) answered++;
        // 3. OS
        if (form.querySelector('input[name="os"]:checked')) answered++;
        // 4. Browser
        if (form.querySelector('input[name="browser"]:checked')) answered++;
        // 5. LLMs
        if (form.querySelector('input[name="llm"]:checked')) answered++;
        // 6. Hours
        if (form.querySelector('input[name="hours"]:checked')) answered++;
        // 7. Workflows text
        if (form.workflows.value.trim() !== '') answered++;
        // 8. Experience
        if (form.querySelector('input[name="experience"]:checked')) answered++;
        // 9. Time
        if (form.querySelector('input[name="time"]:checked')) answered++;
        // 10. Feature (checkboxes)
        if (form.querySelectorAll('input[name="feature"]:checked').length > 0) answered++;
        // 11. Privacy
        if (form.querySelector('input[name="privacy"]:checked')) answered++;
        // 12. Workflows Type
        if (form.querySelector('input[name="workflow_type"]:checked')) answered++;
        // 13. Screenshots
        if (form.querySelector('input[name="screenshots"]:checked')) answered++;
        // 14. Community
        if (form.querySelector('input[name="community"]:checked')) answered++;
        // 15. Agreement 1
        if (form.agreement1.checked) answered++;
        // 16. Agreement 2
        if (form.agreement2.checked) answered++;

        const totalRequired = 16;
        const percent = Math.round((answered / totalRequired) * 100);
        
        const progressFill = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${answered} of ${totalRequired} required questions answered (${percent}%)`;

        // Enable/disable submit button based on completion
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = (answered < totalRequired);
        }
    }

    // Function to save form draft to localStorage
    function saveDraft() {
        const data = {};
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.name) return;
            
            if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                if (!data[input.name]) {
                    data[input.name] = [];
                }
                if (input.checked) {
                    data[input.name].push(input.value);
                }
            } else {
                data[input.name] = input.value;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateProgress();
    }

    // Function to load form draft from localStorage
    function loadDraft() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            updateProgress();
            return;
        }
        try {
            const data = JSON.parse(saved);
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (!input.name || !(input.name in data)) return;
                
                const value = data[input.name];
                if (input.type === 'radio') {
                    if (input.value === value) {
                        input.checked = true;
                    }
                } else if (input.type === 'checkbox') {
                    input.checked = Array.isArray(value) ? value.includes(input.value) : (input.value === value);
                } else {
                    input.value = value;
                }
            });
        } catch (e) {
            console.error('Error loading form draft:', e);
        }
        updateProgress();
    }

    // Interactive Navigation (Click to Smooth Scroll)
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetId = indicator.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const tracker = document.querySelector('.sticky-tracker');
                const trackerHeight = tracker ? tracker.offsetHeight : 100;
                const targetOffset = targetSection.getBoundingClientRect().top + window.scrollY - trackerHeight - 20;
                
                window.scrollTo({
                    top: targetOffset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ScrollSpy: Highlight active section in navigation as user scrolls
    const sections = document.querySelectorAll('.form-section');
    const observerOptions = {
        root: null,
        rootMargin: '-15% 0px -70% 0px', // targets sections entering the top-middle focus area
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                indicators.forEach(ind => {
                    ind.classList.remove('active');
                    if (ind.getAttribute('data-target') === id) {
                        ind.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Focus / Active state highlighting for questions
    formGroups.forEach(group => {
        const inputs = group.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                formGroups.forEach(g => g.classList.remove('active'));
                group.classList.add('active');
            });
            
            input.addEventListener('change', () => {
                formGroups.forEach(g => g.classList.remove('active'));
                group.classList.add('active');
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            formGroups.forEach(g => g.classList.remove('active'));
        }
    });

    // Auto-save & recalculate progress on edit
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    // Function to trigger custom confirm modal
    function showConfirmModal(onConfirm) {
        const modal = document.getElementById('custom-modal');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        modal.classList.add('show');
        
        const cleanUp = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleOutsideClick);
        };
        
        const handleConfirm = () => {
            onConfirm();
            cleanUp();
        };
        
        const handleCancel = () => {
            cleanUp();
        };

        const handleOutsideClick = (e) => {
            if (e.target === modal) {
                cleanUp();
            }
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleOutsideClick);
    }

    // Clear form reset button handler
    clearBtn.addEventListener('click', () => {
        showConfirmModal(() => {
            form.reset();
            localStorage.removeItem(STORAGE_KEY);
            formGroups.forEach(g => g.classList.remove('active', 'error'));
            updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Handle Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Custom visual checks (add errors if required fields are missing)
        let firstInvalidGroup = null;
        formGroups.forEach(group => {
            const requiredFields = group.querySelectorAll('[required]');
            let isGroupValid = true;
            
            requiredFields.forEach(field => {
                if (field.type === 'radio') {
                    const name = field.name;
                    const checked = group.querySelector(`input[name="${name}"]:checked`);
                    if (!checked) isGroupValid = false;
                } else if (field.type === 'checkbox') {
                    if (!field.checked) isGroupValid = false;
                } else {
                    if (field.value.trim() === '') isGroupValid = false;
                }
            });

            if (!isGroupValid) {
                group.classList.add('error');
                if (!firstInvalidGroup) firstInvalidGroup = group;
            } else {
                group.classList.remove('error');
            }
        });

        if (firstInvalidGroup) {
            const tracker = document.querySelector('.sticky-tracker');
            const trackerHeight = tracker ? tracker.offsetHeight : 100;
            const targetOffset = firstInvalidGroup.getBoundingClientRect().top + window.scrollY - trackerHeight - 20;
            
            window.scrollTo({
                top: targetOffset,
                behavior: 'smooth'
            });
            return;
        }

        // Gather all inputs from the form
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            // If the field has multiple checkboxes/values, store them as arrays
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        // Map form field names to match Google Apps Script expectations
        if (data.llm) {
            data.llms = data.llm;
        }
        if (data.hours) {
            data.testingHours = data.hours;
        }

        // 1. Show a loading/submitting state on the button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting...';

        // 2. Send to Google Apps Script Web App
        fetch('https://script.google.com/macros/s/AKfycbwe7luFFZUg7F6YN27bHF50sKwh5CK7_6BqQKiEjD7MzZnXP5a2no3iTAtm_aClO4Ev/exec', {
            method: 'POST',
            mode: 'no-cors', // Bypasses CORS browser security checks
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(() => {
            // Clear saved draft on successful submission
            localStorage.removeItem(STORAGE_KEY);

            // Show success state
            const formHeader = document.querySelector('.form-header');
            const progressContainer = document.querySelector('.progress-container');
            
            // Create success message element
            const successHtml = `
                <div class="success-message glass-panel" style="display: block; margin-top: 40px; text-align: center;">
                    <h3 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 16px; background: linear-gradient(135deg, #f97316, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: flex; align-items: center; justify-content: center; gap: 8px;">🎉 Application Submitted!</h3>
                    <p style="color: var(--color-text-secondary); font-size: 1.05rem; line-height: 1.6; max-width: 480px; margin: 0 auto 24px auto;">Thank you for requesting early access to the Oryonix AI beta extension. We will review your application and send build details to your email shortly.</p>
                    <div class="success-actions">
                        <button class="success-btn success-btn--glass" onclick="location.reload()">Submit another request</button>
                        <a href="/" class="success-btn success-btn--home">Go to Home</a>
                    </div>
                </div>
            `;
            
            // Replace form with success message
            formHeader.style.display = 'none';
            form.style.display = 'none';
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            container.innerHTML += successHtml;
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Submission failed:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            alert('Something went wrong. Please try again.');
        });
    });

    // Init: Load draft & compute initial progress
    loadDraft();
});
