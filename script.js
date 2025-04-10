// Performance detection and optimization
(function() {
    // Create a global performance settings object
    window.perfSettings = {
        isLowEndDevice: false,
        reducedAnimations: false,
        disableParticles: false
    };
    
    // Check device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Set performance flags
    window.perfSettings.isLowEndDevice = isMobile || isLowEnd;
    window.perfSettings.reducedAnimations = prefersReducedMotion;
    window.perfSettings.disableParticles = isMobile || isLowEnd || prefersReducedMotion;
    
    // Add performance monitoring
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let lowFPSCount = 0;
    
    function checkPerformance() {
        const now = performance.now();
        const elapsed = now - lastFrameTime;
        frameCount++;
        
        // Check every second
        if (elapsed >= 1000) {
            const fps = Math.round((frameCount * 1000) / elapsed);
            
            // If FPS is consistently low, reduce animations further
            if (fps < 30) {
                lowFPSCount++;
                if (lowFPSCount >= 3) {
                    window.perfSettings.reducedAnimations = true;
                    window.perfSettings.disableParticles = true;
                    
                    // Remove particles if they exist
                    const particlesContainer = document.getElementById('particles-js');
                    if (particlesContainer) {
                        particlesContainer.style.display = 'none';
                    }
                    
                    // Stop monitoring after adjustments
                    return;
                }
            } else {
                lowFPSCount = 0;
            }
            
            frameCount = 0;
            lastFrameTime = now;
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    // Start performance monitoring
    requestAnimationFrame(checkPerformance);
})();

// Wait for DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    // Remove preloader after page loads
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                // Start typing effect after preloader is gone
                setTimeout(initTypeWriter, 500);
            }, 500);
        }
    });

    // Initialize all components
    initSmoothScrolling();
    initNavbarScroll();
    initMobileMenu();
    initScrollAnimations();
    initThemeToggle();
    initBackToTop();
    initParticles();
    initContactForm();
});

// Smooth scrolling with performance optimization
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                }
                
                // Smooth scroll to target
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar background change on scroll with improved throttling
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTime = 0;
    const scrollThreshold = 50;
    const throttleDelay = 200; // Increased throttle delay
    
    // Initial state check
    if ((window.pageYOffset || document.documentElement.scrollTop) > scrollThreshold) {
        navbar.classList.add('scrolled');
    }

    // Use passive event listener for better performance
    window.addEventListener('scroll', function() {
        const now = Date.now();
        if (now - lastScrollTime > throttleDelay) {
            lastScrollTime = now;
            
            // Use requestAnimationFrame for smoother performance
            requestAnimationFrame(function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > scrollThreshold) {
                    if (!navbar.classList.contains('scrolled')) {
                        navbar.classList.add('scrolled');
                    }
                } else if (navbar.classList.contains('scrolled')) {
                    navbar.classList.remove('scrolled');
                }
            });
        }
    }, { passive: true });
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            this.classList.toggle('active');
            
            // Toggle aria-expanded for accessibility
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
        });
    }
}

// Highly optimized scroll animations with IntersectionObserver
function initScrollAnimations() {
    // Check if we're on a mobile device or low-end hardware
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // For low-end devices or users who prefer reduced motion, skip animations
    if (isMobile || isLowEnd || prefersReducedMotion) {
        document.querySelectorAll(
            '.education-card, .experience-card, .project-card, .skills-category, .timeline-item, .about-content, .skill-item'
        ).forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
        return;
    }
    
    // For other devices, use optimized animations
    const animatedElements = document.querySelectorAll(
        '.education-card, .experience-card, .project-card, .skills-category, .timeline-item, .about-content, .skill-item'
    );
    
    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        // Use a single observer for better performance
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a small delay based on the element's position to create a cascade effect
                    const delay = Array.from(animatedElements).indexOf(entry.target) % 5 * 50;
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, delay);
                    
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// Back to top button with improved throttling
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    let lastScrollTime = 0;
    const scrollThreshold = 300;
    const throttleDelay = 200; // Increased throttle delay
    
    if (backToTopButton) {
        // Initial state check
        if (window.pageYOffset > scrollThreshold) {
            backToTopButton.classList.add('visible');
        }
        
        // Use passive event listener for better performance
        window.addEventListener('scroll', function() {
            const now = Date.now();
            if (now - lastScrollTime > throttleDelay) {
                lastScrollTime = now;
                
                // Use requestAnimationFrame for smoother performance
                requestAnimationFrame(function() {
                    if (window.pageYOffset > scrollThreshold) {
                        if (!backToTopButton.classList.contains('visible')) {
                            backToTopButton.classList.add('visible');
                        }
                    } else if (backToTopButton.classList.contains('visible')) {
                        backToTopButton.classList.remove('visible');
                    }
                });
            }
        }, { passive: true });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize particles.js with ultra-minimal configuration for better performance
function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        // Check if we're on a mobile device or low-end hardware
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        
        // Skip particles on mobile or low-end devices
        if (isMobile || isLowEnd) {
            const particlesContainer = document.getElementById('particles-js');
            if (particlesContainer) {
                particlesContainer.style.display = 'none';
            }
            return;
        }
        
        // Ultra-minimal configuration for desktop
        particlesJS('particles-js', {
            particles: {
                number: { value: 15, density: { enable: true, value_area: 1000 } },
                color: { value: '#3b82f6' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: false },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 150, color: '#3b82f6', opacity: 0.2, width: 1 },
                move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false } } },
            retina_detect: false // Disable for better performance
        });
    }
}

// Typing effect for tagline with highly optimized performance
function initTypeWriter() {
    const tagline = document.querySelector('.tagline');
    if (!tagline) return;
    
    // Check if we're on a mobile device or low-end hardware
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // For low-end devices or users who prefer reduced motion, skip animation
    if (isMobile || isLowEnd || prefersReducedMotion) {
        const text = tagline.getAttribute('data-text') || tagline.textContent;
        tagline.textContent = text;
        tagline.style.visibility = 'visible';
        return;
    }
    
    const text = tagline.getAttribute('data-text') || tagline.textContent;
    tagline.textContent = '';
    tagline.style.visibility = 'visible';
    
    let i = 0;
    const speed = 50; // typing speed in milliseconds
    const chunkSize = 3; // Type multiple characters at once for better performance
    
    function typeWriter() {
        if (i < text.length) {
            // Type multiple characters at once for better performance
            const chunk = text.substring(i, Math.min(i + chunkSize, text.length));
            tagline.textContent += chunk;
            i += chunkSize;
            
            // Use requestAnimationFrame for smoother animation
            if (i < text.length) {
                setTimeout(() => requestAnimationFrame(typeWriter), speed);
            }
        }
    }
    
    // Start the typing effect
    requestAnimationFrame(typeWriter);
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation
            const name = this.querySelector('#name').value.trim();
            const email = this.querySelector('#email').value.trim();
            const message = this.querySelector('#message').value.trim();
            
            if (name && email && message) {
                // Here you would normally send the form data to a server
                // For now, just show a success message
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.disabled = true;
                submitBtn.classList.add('success');
                
                // Reset form after delay
                setTimeout(() => {
                    this.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('success');
                }, 3000);
            }
        });
    }
} 