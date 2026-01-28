document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    const elements = document.querySelectorAll('[data-i18n]');

    // Check localStorage or default to PL
    let currentLang = localStorage.getItem('vladcuts_lang') || 'pl';

    function updateContent(lang) {
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // Use innerHTML to support paragraphs in translation
                el.innerHTML = translations[lang][key];
            }
        });

        // Update placeholders
        const inputs = document.querySelectorAll('[data-i18n-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                input.placeholder = translations[lang][key];
            }
        });

        // Update buttons state
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.documentElement.lang = lang;
        localStorage.setItem('vladcuts_lang', lang);
    }

    // Initialize
    updateContent(currentLang);

    // Event Listeners for Language
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            updateContent(lang);
        });
    });

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                topic: document.getElementById('topic').value,
                message: document.getElementById('message').value
            };

            try {
                // Attempt to send to local backend
                const response = await fetch('http://localhost:5000/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Success: ' + result.message);
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send');
                }
            } catch (error) {
                console.error('Error:', error);
                // Fallback to mailto if backend fails or is not running
                if (confirm('Backend server not reachable. Open email client instead?')) {
                    window.location.href = `mailto:vladd.cuts@gmail.com?subject=${encodeURIComponent(formData.topic)}&body=${encodeURIComponent("Name: " + formData.name + "\n\n" + formData.message)}`;
                }
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
