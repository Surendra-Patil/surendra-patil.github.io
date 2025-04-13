// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize loading screen
    initLoadingScreen();
    
    // Initialize Three.js particle system
    initThreeJS();
    
    // Initialize GSAP animations
    initGSAP();
    
    // Initialize custom cursor
    initCursor();
    
    // Initialize type animation
    initTypeWriter();
    
    // Navigation handling
    initNavigation();
    
    // Form handling
    initContactForm();
    
    // Back to top button
    initBackToTop();
    
    // Scroll indicator
    initScrollIndicator();
});

// Loading screen animation and removal
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const loadingMessages = [
        "Initializing AI Interface...",
        "Loading Blockchain Connections...",
        "Setting Up Neural Networks...",
        "Establishing Secure Environment..."
    ];
    
    // Change loading message every 3 seconds
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        loadingText.textContent = loadingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 3000);
    
    // Handle window load event
    window.addEventListener('load', () => {
        // Give a minimum time for the loader to be visible
        setTimeout(() => {
            clearInterval(messageInterval);
            
            // Fade out loading screen
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 1.2,
                ease: "power2.out",
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    
                    // Animate in the content
                    animateEntrance();
                }
            });
        }, 1500);
    });
    
    // Fallback in case window load event already fired
    setTimeout(() => {
        if (loadingScreen.style.opacity !== '0') {
            clearInterval(messageInterval);
            
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 1.2,
                ease: "power2.out",
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    
                    // Animate in the content
                    animateEntrance();
                }
            });
        }
    }, 4000);
}

// Entrance animations after loading screen
function animateEntrance() {
    // Hero content entrance animation
    const heroContent = document.querySelector('.hero-content');
    const heroElements = heroContent.children;
    
    gsap.from(heroElements, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out"
    });
    
    // Canvas animation
    gsap.from('.canvas-container', {
        opacity: 0,
        duration: 2,
        ease: "power2.inOut"
    });
}

// Three.js particle system for hero background
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particle geometry
    const particlesCount = window.innerWidth < 768 ? 1000 : 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Random positions within a sphere
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 10;
        
        particlesPositions[i] = Math.cos(angle) * radius;
        particlesPositions[i + 1] = (Math.random() - 0.5) * 15;
        particlesPositions[i + 2] = Math.sin(angle) * radius - 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    
    // Create shader material for particles
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x6e57e0,
        size: 0.05,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Position camera
    camera.position.z = 15;
    
    // Animation parameters
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Smooth mouse following
        targetX = mouseX * 0.2;
        targetY = mouseY * 0.2;
        
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        
        // Move particles slightly based on mouse position
        particleSystem.rotation.y += (targetX - particleSystem.rotation.y) * 0.05;
        particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.05;
        
        renderer.render(scene, camera);
    };
    
    animate();
}

// GSAP animations for scrolling effects
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Navbar animation on scroll
    gsap.to('header', {
        scrollTrigger: {
            trigger: 'header',
            start: 'top top',
            toggleClass: {className: 'scrolled', targets: 'header'}
        }
    });
    
    // Animate hero section text
    gsap.from('.hero-content h1', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });
    
    gsap.from('.hero-content h2', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.8
    });
    
    gsap.from('.hero-description', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 1.1
    });
    
    gsap.from('.cta-buttons', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 1.4
    });
    
    // Animate the about section
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%'
        },
        x: -100,
        opacity: 0,
        duration: 1
    });
    
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 80%'
        },
        x: 100,
        opacity: 0,
        duration: 1
    });
    
    // Animate expertise cards
    gsap.from('.expertise-card', {
        scrollTrigger: {
            trigger: '.expertise-section',
            start: 'top 80%'
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });
    
    // Animate project cards
    gsap.from('.project-card', {
        scrollTrigger: {
            trigger: '.projects-section',
            start: 'top 80%'
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });
    
    // Timeline animation
    gsap.from('.timeline-item', {
        scrollTrigger: {
            trigger: '.timeline-section',
            start: 'top 80%'
        },
        opacity: 0,
        x: (i) => i % 2 === 0 ? -100 : 100,
        duration: 0.8,
        stagger: 0.3
    });
    
    // Contact section animation
    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 80%'
        },
        x: -100,
        opacity: 0,
        duration: 0.8
    });
    
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 80%'
        },
        x: 100,
        opacity: 0,
        duration: 0.8
    });
    
    // Tech stack items hover effect
    const techItems = document.querySelectorAll('.tech-item');
    
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                y: -10,
                boxShadow: '0 10px 20px rgba(110, 87, 224, 0.3)',
                duration: 0.3
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                y: 0,
                boxShadow: 'none',
                duration: 0.3
            });
        });
    });
    
    // Image glitch effect on hover
    const imageContainer = document.querySelector('.image-container');
    const glitchEffect = document.querySelector('.image-glitch-effect');
    
    if (imageContainer && glitchEffect) {
        imageContainer.addEventListener('mouseenter', () => {
            const tl = gsap.timeline({repeat: 3, yoyo: true, repeatDelay: 0.3});
            
            tl.to(glitchEffect, {
                opacity: 1,
                x: 5,
                skewX: 10,
                duration: 0.1
            })
            .to(glitchEffect, {
                opacity: 0.8,
                x: -5,
                skewX: -10,
                duration: 0.1
            })
            .to(glitchEffect, {
                opacity: 0,
                x: 0,
                skewX: 0,
                duration: 0.1
            });
        });
    }
}

// Custom cursor implementation
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (!cursor || !follower) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    
    gsap.set(cursor, {xPercent: -50, yPercent: -50});
    gsap.set(follower, {xPercent: -50, yPercent: -50});
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show cursor elements when mouse moves
        if (cursor.style.opacity !== '1') {
            gsap.to(cursor, {opacity: 1, duration: 0.3});
            gsap.to(follower, {opacity: 0.5, duration: 0.3});
        }
    });
    
    // Hide cursor when mouse leaves window
    window.addEventListener('mouseout', () => {
        gsap.to(cursor, {opacity: 0, duration: 0.3});
        gsap.to(follower, {opacity: 0, duration: 0.3});
    });
    
    // Handle cursor hover states for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .tech-item, .project-card, .expertise-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {scale: 1.5, duration: 0.3});
            gsap.to(follower, {scale: 1.5, duration: 0.3});
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {scale: 1, duration: 0.3});
            gsap.to(follower, {scale: 1, duration: 0.3});
        });
    });
    
    // Animation loop for smooth cursor movement
    gsap.ticker.add(() => {
        // Calculate smooth follow with easing
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        // Apply positions
        gsap.set(cursor, {x: mouseX, y: mouseY});
        gsap.set(follower, {x: followerX, y: followerY});
    });
}

// Typed.js for text animation
function initTypeWriter() {
    const typeWriter = document.querySelector('.typewriter');
    
    if (!typeWriter) return;
    
    // Add a non-breaking space to maintain consistent height
    typeWriter.innerHTML = '&nbsp;';
    
    const typed = new Typed(typeWriter, {
        strings: [
            'AI-Web3 Integration Architect',
            'Solana Developer',
            'Cosmos Blockchain Developer',
            'DeFi Protocol Builder',
            'DevOps Expert',
            'Multi-Chain Infrastructure Specialist'
        ],
        typeSpeed: 50,
        backSpeed: 40,
        backDelay: 2000,
        loop: true,
        smartBackspace: true,
        preStringTyped: () => {
            // Fix height before typing to prevent layout shifts
            typeWriter.style.minHeight = '1.8rem';
        }
    });
}

// Navigation functionality
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when nav link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Add smooth scrolling to nav links
    navItems.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle contact form submission
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you'd typically send the form data to a backend
        // For now, we'll just simulate a success message
        
        const formData = new FormData(this);
        const formValues = {};
        
        formData.forEach((value, key) => {
            formValues[key] = value;
        });
        
        // Simulate sending form data
        setTimeout(() => {
            // Reset form
            contactForm.reset();
            
            // Show success message (in a real implementation you'd create a notification)
            alert('Thank you for your message! I will get back to you soon.');
        }, 1000);
    });
}

// Back to top button functionality
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (!backToTop) return;
    
    // Show button when scrolled down
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Scroll back to top when clicked
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll indicator
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (!scrollIndicator) return;
    
    // Hide scroll indicator when user starts scrolling
    let scrolled = false;
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100 && !scrolled) {
            scrolled = true;
            gsap.to(scrollIndicator, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                onComplete: () => {
                    scrollIndicator.style.display = 'none';
                }
            });
        }
    });
} 