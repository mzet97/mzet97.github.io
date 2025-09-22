/**
 * Modern Portfolio JavaScript - Matheus Zeitune
 * Main functionality for animations, interactions, and dynamic content
 */

// Global variables
let isLoaded = false;
let skillsAnimated = false;
let projectsLoaded = false;

// Configuration
const CONFIG = {
    emailjs: {
        serviceId: 'service_portfolio',
        templateId: 'template_contact',
        publicKey: 'YOUR_PUBLIC_KEY' // Replace with actual EmailJS public key
    },
    github: {
        username: 'mzet97',
        maxRepos: 6
    },
    animations: {
        duration: 1000,
        offset: 100,
        once: true
    }
};

// Utility functions
const utils = {
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Animate number counting
    animateNumber: (element, start, end, duration) => {
        const startTime = (performance && performance.now) ? performance.now() : Date.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + (element.dataset.suffix || '');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },

    // Show notification
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 9999;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-success { background: #27ae60; }
                .notification-error { background: #e74c3c; }
                .notification-info { background: #3498db; }
                .notification.show { transform: translateX(0); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
};

// Navigation functionality
const navigation = {
    init: () => {
        const navbar = document.querySelector('.modern-nav');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Scroll effect on navbar
        window.addEventListener('scroll', utils.throttle(() => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100));
        
        // Active link highlighting
        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', utils.throttle(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100));
        
        // Smooth scrolling
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Progress bar functionality
const progressBar = {
    init: () => {
        const progressBar = document.querySelector('.scroll-progress');
        
        window.addEventListener('scroll', utils.throttle(() => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = `${Math.min(scrolled, 100)}%`;
        }, 16));
    }
};

// Enhanced Skills animation
const skillsAnimation = {
    skillsAnimated: false,
    statsAnimated: false,
    
    init: () => {
        skillsAnimation.setupSkillsObserver();
        skillsAnimation.setupStatsObserver();
        skillsAnimation.setupSkillInteractions();
    },
    
    setupSkillsObserver: () => {
        const skillsSection = document.querySelector('#habilidades');
        const skillItems = document.querySelectorAll('.skill-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsAnimation.animateSkills();
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '-50px'
        });
        
        if (skillsSection) {
            observer.observe(skillsSection);
        }
        
        // Individual skill item observer
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.5 });
        
        skillItems.forEach(item => {
            itemObserver.observe(item);
        });
    },
    
    setupStatsObserver: () => {
        const statsSection = document.querySelector('.skills-stats');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsAnimation.animateStats();
                }
            });
        }, { threshold: 0.5 });
        
        if (statsSection) {
            observer.observe(statsSection);
        }
    },
    
    animateSkills: () => {
        if (skillsAnimation.skillsAnimated) return;
        
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach((bar, index) => {
            const width = bar.dataset.width;
            const skillItem = bar.closest('.skill-item');
            
            setTimeout(() => {
                // Animate progress bar
                bar.style.width = `${width}%`;
                
                // Add visual feedback
                if (skillItem) {
                    skillItem.classList.add('animating');
                    
                    // Remove animating class after animation
                    setTimeout(() => {
                        skillItem.classList.remove('animating');
                    }, 2000);
                }
                
                // Add sound effect (optional)
                skillsAnimation.playSkillSound(width);
                
            }, index * 150);
        });
        
        skillsAnimation.skillsAnimated = true;
    },
    
    animateStats: () => {
        if (skillsAnimation.statsAnimated) return;
        
        const statNumbers = document.querySelectorAll('.skill-stat-number');
        
        statNumbers.forEach((stat, index) => {
            const targetValue = parseInt(stat.dataset.count) || parseInt(stat.textContent);
            const suffix = stat.textContent.replace(/[0-9]/g, '');
            
            setTimeout(() => {
                skillsAnimation.animateNumber(stat, 0, targetValue, 2000, suffix);
            }, index * 200);
        });
        
        skillsAnimation.statsAnimated = true;
    },
    
    animateNumber: (element, start, end, duration, suffix = '') => {
        const startTime = (performance && performance.now) ? performance.now() : Date.now();
        const range = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOutCubic));
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = end + suffix;
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    setupSkillInteractions: () => {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            const progressBar = item.querySelector('.skill-progress');
            const skillName = item.querySelector('.skill-name span:first-child').textContent;
            
            // Hover effects
            item.addEventListener('mouseenter', () => {
                skillsAnimation.highlightSkill(item);
            });
            
            item.addEventListener('mouseleave', () => {
                skillsAnimation.unhighlightSkill(item);
            });
            
            // Click to show details
            item.addEventListener('click', () => {
                skillsAnimation.showSkillDetails(item, skillName);
            });
            
            // Keyboard navigation
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    skillsAnimation.showSkillDetails(item, skillName);
                }
            });
        });
    },
    
    highlightSkill: (skillItem) => {
        // Add highlight class
        skillItem.classList.add('highlighted');
        
        // Pulse animation for progress bar
        const progressBar = skillItem.querySelector('.skill-progress');
        if (progressBar) {
            progressBar.style.animation = 'pulse 1s ease-in-out';
        }
        
        // Show skill level indicator
        const skillLevel = skillItem.querySelector('.skill-level');
        if (skillLevel) {
            skillLevel.style.opacity = '1';
            skillLevel.style.transform = 'translateY(0)';
        }
    },
    
    unhighlightSkill: (skillItem) => {
        // Remove highlight class
        skillItem.classList.remove('highlighted');
        
        // Reset progress bar animation
        const progressBar = skillItem.querySelector('.skill-progress');
        if (progressBar) {
            progressBar.style.animation = '';
        }
        
        // Hide skill level indicator
        const skillLevel = skillItem.querySelector('.skill-level');
        if (skillLevel) {
            skillLevel.style.opacity = '0';
            skillLevel.style.transform = 'translateY(-5px)';
        }
    },
    
    showSkillDetails: (skillItem, skillName) => {
        const tooltip = skillItem.querySelector('.skill-tooltip');
        const percentage = skillItem.querySelector('.skill-name span:last-child').textContent;
        
        if (tooltip) {
            const details = tooltip.textContent;
            utils.showNotification(`${skillName} (${percentage}): ${details}`, 'info');
        } else {
            utils.showNotification(`${skillName}: ${percentage} de proficiência`, 'info');
        }
    },
    
    playSkillSound: (width) => {
        // Optional: Add subtle audio feedback
        if ('AudioContext' in window) {
            try {
                const audioContext = new AudioContext();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Frequency based on skill level
                oscillator.frequency.setValueAtTime(200 + (width * 5), audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (error) {
                // Silently fail if audio context is not available
            }
        }
    },
    
    // Method to reset animations (useful for testing)
    resetAnimations: () => {
        skillsAnimation.skillsAnimated = false;
        skillsAnimation.statsAnimated = false;
        
        // Reset progress bars
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            bar.style.width = '0';
        });
        
        // Reset stat numbers
        const statNumbers = document.querySelectorAll('.skill-stat-number');
        statNumbers.forEach(stat => {
            const suffix = stat.textContent.replace(/[0-9]/g, '');
            stat.textContent = '0' + suffix;
        });
        
        // Remove animation classes
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            item.classList.remove('animate', 'highlighted', 'animating');
        });
    }
};

// Statistics animation
const statsAnimation = {
    init: () => {
        const statsSection = document.querySelector('.stats-grid');
        const statNumbers = document.querySelectorAll('.stat-number');
        let statsAnimated = false;
        
        const animateStats = () => {
            if (statsAnimated) return;
            
            statNumbers.forEach(stat => {
                const finalValue = parseInt(stat.textContent);
                const suffix = stat.textContent.replace(/[0-9]/g, '');
                stat.dataset.suffix = suffix;
                utils.animateNumber(stat, 0, finalValue, 2000);
            });
            
            statsAnimated = true;
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                }
            });
        }, { threshold: 0.5 });
        
        if (statsSection) {
            observer.observe(statsSection);
        }
    }
};

// Enhanced GitHub API integration
const githubAPI = {
    repos: [],
    filteredRepos: [],
    currentFilter: 'all',
    searchTerm: '',
    
    init: () => {
        githubAPI.setupProjectsSection();
        githubAPI.loadProjects();
    },
    
    setupProjectsSection: () => {
        const projectsSection = document.getElementById('projetos');
        if (!projectsSection) return;
        
        // Add projects-section class for styling
        projectsSection.classList.add('projects-section');
        
        // Create enhanced project controls
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer) return;
        
        // Create search and filters
        const controlsHTML = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="project-search" data-aos="fade-up">
                        <i class="fas fa-search"></i>
                        <input type="text" id="project-search" placeholder="Buscar projetos..." autocomplete="off">
                    </div>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-12">
                    <div class="project-filters" data-aos="fade-up" data-aos-delay="100">
                        <button class="filter-btn active" data-filter="all">
                            <i class="fas fa-th"></i> Todos
                        </button>
                        <button class="filter-btn" data-filter="web">
                            <i class="fas fa-globe"></i> Web
                        </button>
                        <button class="filter-btn" data-filter="api">
                            <i class="fas fa-server"></i> API
                        </button>
                        <button class="filter-btn" data-filter="mobile">
                            <i class="fas fa-mobile-alt"></i> Mobile
                        </button>
                        <button class="filter-btn" data-filter="tool">
                            <i class="fas fa-tools"></i> Ferramentas
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert controls before projects container
        projectsContainer.insertAdjacentHTML('beforebegin', controlsHTML);
        
        // Setup event listeners
        githubAPI.setupEventListeners();
    },
    
    setupEventListeners: () => {
        // Search functionality
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                githubAPI.searchTerm = e.target.value.toLowerCase();
            githubAPI.filterAndDisplayProjects();
            }, 300));
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update filter
                githubAPI.currentFilter = btn.dataset.filter;
            githubAPI.filterAndDisplayProjects();
            });
        });
    },
    
    loadProjects: async () => {
        if (projectsLoaded) return;
        
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer) return;
        
        try {
            // Show loading state
            projectsContainer.innerHTML = githubAPI.getLoadingHTML();
            
            // Fetch repositories with more details
            const response = await fetch(`https://api.github.com/users/${CONFIG.github.username}/repos?sort=updated&per_page=50`);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const repos = await response.json();
            
            // Enhanced filtering and categorization
            githubAPI.repos = repos
                .filter(repo => !repo.fork && repo.description && !repo.private)
                .map(repo => ({
                    ...repo,
                    category: githubAPI.categorizeRepo(repo),
                tech_stack: githubAPI.extractTechStack(repo),
                image_url: githubAPI.generateProjectImage(repo)
                }))
                .sort((a, b) => {
                    // Sort by stars, then by update date
                    if (b.stargazers_count !== a.stargazers_count) {
                        return b.stargazers_count - a.stargazers_count;
                    }
                    return new Date(b.updated_at) - new Date(a.updated_at);
                });
            
            // Load additional details for top repositories
            await githubAPI.loadAdditionalDetails();
            
            // Initial display
            githubAPI.filterAndDisplayProjects();
            
            projectsLoaded = true;
            
        } catch (error) {
            console.error('Error loading GitHub projects:', error);
            projectsContainer.innerHTML = githubAPI.getErrorHTML();
        }
    },
    
    loadAdditionalDetails: async () => {
        // Load languages for top 10 repos
        const topRepos = githubAPI.repos.slice(0, 10);
        
        const languagePromises = topRepos.map(async (repo) => {
            try {
                const response = await fetch(repo.languages_url);
                if (response.ok) {
                    const languages = await response.json();
                    repo.languages = Object.keys(languages);
                }
            } catch (error) {
                console.warn(`Failed to load languages for ${repo.name}:`, error);
            }
        });
        
        await Promise.all(languagePromises);
    },
    
    categorizeRepo: (repo) => {
        const name = repo.name.toLowerCase();
        const description = repo.description.toLowerCase();
        const topics = repo.topics || [];
        
        // Web applications
        if (topics.includes('web') || topics.includes('frontend') || topics.includes('react') || 
            topics.includes('angular') || topics.includes('vue') || name.includes('web') ||
            description.includes('website') || description.includes('frontend')) {
            return 'web';
        }
        
        // APIs and backend
        if (topics.includes('api') || topics.includes('backend') || topics.includes('server') ||
            name.includes('api') || description.includes('api') || description.includes('backend') ||
            description.includes('server')) {
            return 'api';
        }
        
        // Mobile applications
        if (topics.includes('mobile') || topics.includes('android') || topics.includes('ios') ||
            name.includes('mobile') || description.includes('mobile') || description.includes('app')) {
            return 'mobile';
        }
        
        // Tools and utilities
        if (topics.includes('tool') || topics.includes('utility') || topics.includes('cli') ||
            name.includes('tool') || description.includes('tool') || description.includes('utility')) {
            return 'tool';
        }
        
        return 'web'; // Default category
    },
    
    extractTechStack: (repo) => {
        const stack = [];
        
        if (repo.language) {
            stack.push(repo.language);
        }
        
        // Add common frameworks based on topics
        const topics = repo.topics || [];
        const frameworkMap = {
            'react': 'React',
            'angular': 'Angular',
            'vue': 'Vue.js',
            'nodejs': 'Node.js',
            'express': 'Express',
            'dotnet': '.NET',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes'
        };
        
        topics.forEach(topic => {
            if (frameworkMap[topic]) {
                stack.push(frameworkMap[topic]);
            }
        });
        
        return stack.slice(0, 4); // Limit to 4 technologies
    },
    
    generateProjectImage: (repo) => {
        // Use a more sophisticated placeholder service
        const colors = ['2c3e50', '3498db', '9b59b6', '2ecc71', 'e74c3c', 'f39c12'];
        const color = colors[repo.name.length % colors.length];
        // Create a data URL for placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        
        // Fill background with color
        ctx.fillStyle = `#${color}`;
        ctx.fillRect(0, 0, 400, 220);
        
        // Add text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = repo.name.replace(/-/g, ' ');
        const maxWidth = 350;
        const words = text.split(' ');
        let line = '';
        const lines = [];
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        const lineHeight = 30;
        const startY = 110 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line.trim(), 200, startY + index * lineHeight);
        });
        
        return canvas.toDataURL('image/png');
    },
    
    filterAndDisplayProjects: () => {
        // Apply filters
        githubAPI.filteredRepos = githubAPI.repos.filter(repo => {
            // Category filter
            const categoryMatch = githubAPI.currentFilter === 'all' || repo.category === githubAPI.currentFilter;
            
            // Search filter
            const searchMatch = !githubAPI.searchTerm ||
                repo.name.toLowerCase().includes(githubAPI.searchTerm) ||
                repo.description.toLowerCase().includes(githubAPI.searchTerm) ||
                (repo.tech_stack && repo.tech_stack.some(tech => tech.toLowerCase().includes(githubAPI.searchTerm)));
            
            return categoryMatch && searchMatch;
        });
        
        // Display projects
        githubAPI.displayProjects();
    },
    
    displayProjects: () => {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer) return;
        
        // Clear container
        projectsContainer.innerHTML = '';
        
        if (githubAPI.filteredRepos.length === 0) {
            projectsContainer.innerHTML = githubAPI.getEmptyStateHTML();
            return;
        }
        
        // Limit to 6 projects for better performance
        const displayRepos = githubAPI.filteredRepos.slice(0, 6);
        
        // Create project cards
        displayRepos.forEach((repo, index) => {
            const projectCard = githubAPI.createProjectCard(repo, index);
            projectsContainer.appendChild(projectCard);
            
            // Animate card appearance
            setTimeout(() => {
                projectCard.querySelector('.project-card').classList.add('animate');
            }, index * 100);
        });
    },
    
    createProjectCard: (repo, index) => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        
        const techBadges = repo.tech_stack.map(tech => 
            `<span class="tech-badge">${tech}</span>`
        ).join('');
        
        const lastUpdated = new Date(repo.updated_at).toLocaleDateString('pt-BR');
        
        card.innerHTML = `
            <div class="project-card h-100" data-category="${repo.category}">
                <div class="project-image">
                    <img src="${repo.image_url}" alt="${repo.name}" class="img-fluid" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-links">
                            <a href="${repo.html_url}" target="_blank" class="btn btn-outline-light btn-sm" rel="noopener">
                                <i class="fab fa-github"></i> Código
                            </a>
                            ${repo.homepage ? `
                                <a href="${repo.homepage}" target="_blank" class="btn btn-primary btn-sm" rel="noopener">
                                    <i class="fas fa-external-link-alt"></i> Demo
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-category">${githubAPI.getCategoryLabel(repo.category)}</div>
                    <h5 class="project-title">${repo.name.replace(/-/g, ' ')}</h5>
                    <p class="project-description">${repo.description}</p>
                    <div class="project-meta">
                        <div class="project-tech">
                            ${techBadges}
                        </div>
                        <div class="project-stats">
                            <span class="text-muted">
                                <i class="fas fa-star"></i> ${repo.stargazers_count}
                            </span>
                            <span class="text-muted">
                                <i class="fas fa-code-branch"></i> ${repo.forks_count}
                            </span>
                            <span class="text-muted small">
                                Atualizado em ${lastUpdated}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    },
    
    getCategoryLabel: (category) => {
        const labels = {
            'web': 'Web App',
            'api': 'API/Backend',
            'mobile': 'Mobile',
            'tool': 'Ferramenta'
        };
        return labels[category] || 'Projeto';
    },
    
    getLoadingHTML: () => {
        return Array.from({ length: 6 }, (_, i) => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="project-card h-100 loading">
                    <div class="project-image"></div>
                    <div class="project-content">
                        <div class="loading-line" style="height: 20px; margin-bottom: 10px;"></div>
                        <div class="loading-line" style="height: 16px; width: 80%; margin-bottom: 10px;"></div>
                        <div class="loading-line" style="height: 14px; width: 60%;"></div>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    getEmptyStateHTML: () => {
        return `
            <div class="col-12">
                <div class="projects-empty">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Tente ajustar os filtros ou termo de busca.</p>
                    <button class="btn btn-primary" onclick="githubAPI.clearFilters()">
                        <i class="fas fa-refresh"></i> Limpar Filtros
                    </button>
                </div>
            </div>
        `;
    },
    
    getErrorHTML: () => {
        return `
            <div class="col-12">
                <div class="alert alert-warning text-center" role="alert">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h4>Ops! Algo deu errado</h4>
                    <p>Não foi possível carregar os projetos do GitHub no momento.</p>
                    <div class="mt-3">
                        <button class="btn btn-primary me-2" onclick="githubAPI.loadProjects()">
                            <i class="fas fa-refresh"></i> Tentar Novamente
                        </button>
                        <a href="https://github.com/${CONFIG.github.username}" target="_blank" class="btn btn-outline-primary" rel="noopener">
                            <i class="fab fa-github"></i> Ver no GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    clearFilters: () => {
        // Reset filters
        githubAPI.currentFilter = 'all';
        githubAPI.searchTerm = '';
        
        // Update UI
        const searchInput = document.getElementById('project-search');
        if (searchInput) searchInput.value = '';
        
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        // Refresh display
        githubAPI.filterAndDisplayProjects();
    }
};

// Enhanced Contact form functionality
const contactForm = {
    formData: {},
    validationRules: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
            message: 'Nome deve conter apenas letras e espaços (2-50 caracteres)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Por favor, insira um email válido'
        },
        phone: {
            required: false,
            pattern: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
            message: 'Formato: (11) 99999-9999'
        },
        subject: {
            required: true,
            message: 'Por favor, selecione um assunto'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: 'Mensagem deve ter entre 10 e 1000 caracteres'
        },
        privacy: {
            required: true,
            message: 'É necessário concordar com os termos'
        }
    },
    
    init: () => {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        contactForm.setupFormListeners(form);
        contactForm.setupFieldFormatting();
        contactForm.setupCharacterCounter();
        contactForm.setupFormProgress();
    },
    
    setupFormListeners: (form) => {
        // Form submission
        form.addEventListener('submit', contactForm.handleSubmit);
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', contactForm.validateField);
            input.addEventListener('input', contactForm.handleInput);
            input.addEventListener('focus', contactForm.handleFocus);
        });
        
        // Prevent form submission on Enter (except textarea)
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    },
    
    setupFieldFormatting: () => {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', contactForm.formatPhone);
        }
        
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.addEventListener('input', contactForm.formatName);
        }
    },
    
    setupCharacterCounter: () => {
        const messageField = document.getElementById('message');
        const charCount = document.getElementById('char-count');
        
        if (messageField && charCount) {
            messageField.addEventListener('input', () => {
                const count = messageField.value.length;
                charCount.textContent = count;
                
                // Color coding
                if (count > 900) {
                    charCount.style.color = '#dc3545';
                } else if (count > 700) {
                    charCount.style.color = '#ffc107';
                } else {
                    charCount.style.color = 'var(--primary-color)';
                }
            });
        }
    },
    
    setupFormProgress: () => {
        // Visual progress indicator based on filled fields
        const form = document.getElementById('contact-form');
        const requiredFields = form.querySelectorAll('[required]');
        
        const updateProgress = () => {
            let filledFields = 0;
            requiredFields.forEach(field => {
                if (field.type === 'checkbox') {
                    if (field.checked) filledFields++;
                } else if (field.value.trim()) {
                    filledFields++;
                }
            });
            
            const progress = (filledFields / requiredFields.length) * 100;
            contactForm.updateFormProgress(progress);
        };
        
        requiredFields.forEach(field => {
            field.addEventListener('input', updateProgress);
            field.addEventListener('change', updateProgress);
        });
    },
    
    updateFormProgress: (progress) => {
        // Update form header with progress
        const formHeader = document.querySelector('.form-header p');
        if (formHeader && progress > 0) {
            formHeader.innerHTML = `Progresso do formulário: <strong>${Math.round(progress)}%</strong>`;
        }
    },
    
    formatPhone: (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
        }
        
        e.target.value = value;
    },
    
    formatName: (e) => {
        // Capitalize first letter of each word
        const value = e.target.value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        e.target.value = value;
    },
    
    handleFocus: (e) => {
        const field = e.target;
        field.parentNode.classList.add('focused');
    },
    
    handleInput: (e) => {
        const field = e.target;
        
        // Clear previous validation states
        contactForm.clearFieldValidation(field);
        
        // Real-time validation for some fields
        if (field.type === 'email' && field.value.length > 0) {
            contactForm.validateField(e, false);
        }
    },
    
    handleSubmit: async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Validate entire form
        if (!contactForm.validateForm(form)) {
            contactForm.showFormStatus('Por favor, corrija os erros antes de enviar.', 'error');
            return;
        }
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
        
        try {
            // Prepare enhanced form data
            const formData = contactForm.prepareFormData(form);
            
            // Send email using EmailJS (if configured)
            if (CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
                await emailjs.send(
                    CONFIG.emailjs.serviceId,
                    CONFIG.emailjs.templateId,
                    formData,
                    CONFIG.emailjs.publicKey
                );
                
                contactForm.showFormStatus('✅ Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
                contactForm.resetForm(form);
                
                // Track form submission (analytics)
                contactForm.trackFormSubmission(formData);
                
            } else {
                // Fallback: mailto link with enhanced data
                const mailtoLink = contactForm.generateMailtoLink(formData);
                window.open(mailtoLink);
                contactForm.showFormStatus('📧 Abrindo cliente de email...', 'info');
            }
            
        } catch (error) {
            console.error('Error sending email:', error);
            contactForm.showFormStatus('❌ Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.', 'error');
        } finally {
            // Reset button state
            setTimeout(() => {
                btnText.style.display = 'flex';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }, 2000);
        }
    },
    
    prepareFormData: (form) => {
        const data = {
            from_name: form.name.value.trim(),
            from_email: form.email.value.trim(),
            phone: form.phone.value.trim() || 'Não informado',
            company: form.company.value.trim() || 'Não informado',
            subject: form.subject.value,
            budget: form.budget.value || 'Não informado',
            timeline: form.timeline.value || 'Não informado',
            message: form.message.value.trim(),
            to_name: 'Matheus Zeitune',
            sent_at: new Date().toLocaleString('pt-BR'),
            user_agent: navigator.userAgent,
            page_url: window.location.href
        };
        
        return data;
    },
    
    generateMailtoLink: (data) => {
        const subject = encodeURIComponent(`[Portfolio] ${data.subject}`);
        const body = encodeURIComponent(
            `Nome: ${data.from_name}\n` +
            `Email: ${data.from_email}\n` +
            `Telefone: ${data.phone}\n` +
            `Empresa: ${data.company}\n` +
            `Orçamento: ${data.budget}\n` +
            `Prazo: ${data.timeline}\n\n` +
            `Mensagem:\n${data.message}\n\n` +
            `---\nEnviado em: ${data.sent_at}`
        );
        
        return `mailto:matheus.zeitune.developer@outlook.com?subject=${subject}&body=${body}`;
    },
    
    validateForm: (form) => {
        const fields = Object.keys(contactForm.validationRules);
        let isValid = true;
        
        fields.forEach(fieldName => {
            const field = form[fieldName];
            if (field && !contactForm.validateField({ target: field }, true)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    validateField: (e, showErrors = true) => {
        const field = e.target;
        const fieldName = field.name;
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        const rules = contactForm.validationRules[fieldName];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required) {
            if (field.type === 'checkbox' && !value) {
                isValid = false;
                errorMessage = rules.message;
            } else if (field.type !== 'checkbox' && !value) {
                isValid = false;
                errorMessage = rules.message;
            }
        }
        
        // Pattern validation
        if (isValid && value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // Length validation
        if (isValid && value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        if (isValid && value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.message;
        }
        
        // Update field state
        if (showErrors) {
            contactForm.updateFieldValidation(field, isValid, errorMessage);
        }
        
        return isValid;
    },
    
    updateFieldValidation: (field, isValid, errorMessage) => {
        const invalidFeedback = field.parentNode.querySelector('.invalid-feedback');
        const validFeedback = field.parentNode.querySelector('.valid-feedback');
        
        // Clear previous states
        field.classList.remove('is-valid', 'is-invalid');
        
        if (isValid && field.value.trim()) {
            field.classList.add('is-valid');
            if (invalidFeedback) invalidFeedback.textContent = '';
        } else if (!isValid) {
            field.classList.add('is-invalid');
            if (invalidFeedback) invalidFeedback.textContent = errorMessage;
        }
    },
    
    clearFieldValidation: (field) => {
        field.classList.remove('is-valid', 'is-invalid');
        const invalidFeedback = field.parentNode.querySelector('.invalid-feedback');
        if (invalidFeedback) invalidFeedback.textContent = '';
    },
    
    showFormStatus: (message, type) => {
        const statusElement = document.getElementById('form-status');
        if (!statusElement) return;
        
        statusElement.className = `form-status ${type}`;
        statusElement.innerHTML = message;
        statusElement.style.display = 'block';
        
        // Auto-hide success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    },
    
    resetForm: (form) => {
        form.reset();
        
        // Clear all validation states
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            contactForm.clearFieldValidation(field);
        });
        
        // Reset character counter
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = '0';
            charCount.style.color = 'var(--primary-color)';
        }
        
        // Reset progress
        contactForm.updateFormProgress(0);
        
        // Reset form header
        const formHeader = document.querySelector('.form-header p');
        if (formHeader) {
            formHeader.textContent = 'Preencha o formulário abaixo e entrarei em contato em breve';
        }
    },
    
    trackFormSubmission: (data) => {
        // Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: data.subject,
                value: 1
            });
        }
        
        // Console log for debugging
        console.log('Form submitted:', {
            subject: data.subject,
            timestamp: data.sent_at
        });
    }
};

// Animations and effects
const animations = {
    init: () => {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: CONFIG.animations.duration,
                offset: CONFIG.animations.offset,
                once: CONFIG.animations.once,
                easing: 'ease-out-cubic'
            });
        }
        
        // Parallax effect for hero section
        animations.initParallax();
        
        // Typing effect for hero title
        animations.initTypingEffect();
        
        // Floating elements animation
        animations.initFloatingElements();
    },
    
    initParallax: () => {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        window.addEventListener('scroll', utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }, 16));
    },
    
    initTypingEffect: () => {
        const titleElement = document.querySelector('.hero-title .text-gradient');
        if (!titleElement) return;
        
        const text = titleElement.textContent;
        titleElement.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                titleElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after page load
        setTimeout(typeWriter, 1000);
    },
    
    initFloatingElements: () => {
        const floatingElements = document.querySelectorAll('.floating-tech');
        
        floatingElements.forEach((element, index) => {
            // Random animation delay
            element.style.animationDelay = `${index * 0.5}s`;
            
            // Mouse interaction
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.1) translateY(-5px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1) translateY(0)';
            });
        });
    }
};

// Performance optimization
const performanceOptimization = {
    init: () => {
        // Lazy load images
        performanceOptimization.initLazyLoading();
        
        // Preload critical resources
        performanceOptimization.preloadResources();
        
        // Service Worker registration (if available)
        performanceOptimization.registerServiceWorker();
    },
    
    initLazyLoading: () => {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    },
    
    preloadResources: () => {
        const criticalResources = [
            'assets/img/avatars/perfil.jpg'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = resource;
            document.head.appendChild(link);
        });
    },
    
    registerServiceWorker: () => {
        // Service Worker disabled for development
        // if ('serviceWorker' in navigator) {
        //     window.addEventListener('load', () => {
        //         navigator.serviceWorker.register('/sw.js')
        //             .then(registration => {
        //                 console.log('SW registered: ', registration);
        //             })
        //             .catch(registrationError => {
        //                 console.log('SW registration failed: ', registrationError);
        //             });
        //     });
        // }
    }
};

// Theme and accessibility
const accessibility = {
    init: () => {
        // Keyboard navigation
        accessibility.initKeyboardNavigation();
        
        // Focus management
        accessibility.initFocusManagement();
        
        // Reduced motion support
        accessibility.initReducedMotion();
        
        // High contrast support
        accessibility.initHighContrast();
    },
    
    initKeyboardNavigation: () => {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#hero';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 9999;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    },
    
    initFocusManagement: () => {
        // Trap focus in modals (if any)
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(document.querySelectorAll(focusableElements));
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    },
    
    initReducedMotion: () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable animations
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
            
            // Disable AOS animations
            if (typeof AOS !== 'undefined') {
                AOS.init({ disable: true });
            }
        }
    },
    
    initHighContrast: () => {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            document.body.classList.add('high-contrast');
        }
    }
};

// Interactive Timeline functionality
const timeline = {
    items: [],
    currentFilter: 'all',
    
    init: () => {
        timeline.items = document.querySelectorAll('.timeline-item');
        timeline.setupScrollAnimations();
        timeline.setupMarkerInteractions();
        timeline.setupProgressBar();
        timeline.setupNavigation();
        timeline.setupFilters();
        
        console.log('Interactive Timeline initialized');
    },
    
    setupScrollAnimations: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Animate timeline marker
                    const marker = entry.target.querySelector('.timeline-marker');
                    if (marker) {
                        setTimeout(() => {
                            marker.classList.add('active');
                        }, 300);
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-50px'
        });
        
        timeline.items.forEach(item => {
            observer.observe(item);
        });
    },
    
    setupMarkerInteractions: () => {
        const markers = document.querySelectorAll('.timeline-marker');
        
        markers.forEach((marker, index) => {
            marker.addEventListener('click', () => {
                timeline.highlightTimelineItem(index);
                timeline.scrollToItem(index);
            });
            
            marker.addEventListener('mouseenter', () => {
                timeline.showTooltip(marker, index);
            });
            
            marker.addEventListener('mouseleave', () => {
                timeline.hideTooltip();
            });
        });
    },
    
    setupProgressBar: () => {
        const timelineElement = document.querySelector('.timeline');
        if (!timelineElement) return;
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress';
        timelineElement.appendChild(progressBar);
        
        // Update progress on scroll
        window.addEventListener('scroll', utils.throttle(() => {
            timeline.updateProgress();
        }, 16));
    },
    
    updateProgress: () => {
        const progressBar = document.querySelector('.timeline-progress');
        const timelineElement = document.querySelector('.timeline');
        
        if (!progressBar || !timelineElement) return;
        
        const timelineRect = timelineElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress based on scroll position
        let progress = 0;
        if (timelineRect.top < windowHeight && timelineRect.bottom > 0) {
            const visibleHeight = Math.min(windowHeight - Math.max(timelineRect.top, 0), timelineRect.height);
            progress = (visibleHeight / timelineRect.height) * 100;
        }
        
        progressBar.style.height = `${Math.min(progress, 100)}%`;
    },
    
    setupNavigation: () => {
        const experienceSection = document.querySelector('#experiencia');
        if (!experienceSection) return;
        
        // Create navigation
        const nav = document.createElement('div');
        nav.className = 'timeline-nav';
        nav.innerHTML = `
            <div class="timeline-nav-item active" data-filter="all">Todas</div>
            <div class="timeline-nav-item" data-filter="fullstack">Full Stack</div>
            <div class="timeline-nav-item" data-filter="backend">Backend</div>
            <div class="timeline-nav-item" data-filter="frontend">Frontend</div>
        `;
        
        // Insert navigation before timeline
        const timelineElement = experienceSection.querySelector('.timeline');
        timelineElement.parentNode.insertBefore(nav, timelineElement);
        
        // Add click handlers
        const navItems = nav.querySelectorAll('.timeline-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.dataset.filter;
                timeline.filterTimeline(filter);
                
                // Update active state
                navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },
    
    setupFilters: () => {
        // Add data attributes to timeline items for filtering
        const items = document.querySelectorAll('.timeline-item');
        const filterMap = {
            0: 'fullstack', // Flamengo
            1: 'fullstack', // First Decision
            2: 'fullstack', // Meta
            3: 'fullstack', // Brilliant Machine
            4: 'backend'    // MTSLAB
        };
        
        items.forEach((item, index) => {
            const category = filterMap[index] || 'fullstack';
            item.dataset.category = category;
        });
    },
    
    filterTimeline: (filter) => {
        timeline.currentFilter = filter;
        const items = document.querySelectorAll('.timeline-item');
        
        items.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 100);
            } else {
                item.classList.remove('animate');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    },
    
    highlightTimelineItem: (index) => {
        const items = document.querySelectorAll('.timeline-item');
        const markers = document.querySelectorAll('.timeline-marker');
        
        // Remove previous highlights
        items.forEach(item => item.classList.remove('highlighted'));
        markers.forEach(marker => marker.classList.remove('active'));
        
        // Add highlight to selected item
        if (items[index]) {
            items[index].classList.add('highlighted');
            markers[index].classList.add('active');
        }
    },
    
    scrollToItem: (index) => {
        const items = document.querySelectorAll('.timeline-item');
        if (items[index]) {
            const offsetTop = items[index].offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },
    
    showTooltip: (marker, index) => {
        const tooltipData = [
            { company: 'Flamengo', period: '2024 - presente', role: 'Full Stack Pleno' },
            { company: 'First Decision', period: '2023 - 2024', role: 'Full Stack Pleno' },
            { company: 'Meta', period: '2022 - 2023', role: 'Full Stack Pleno' },
            { company: 'Brilliant Machine', period: '2022', role: 'Full Stack Pleno' },
            { company: 'MTSLAB', period: '2019 - 2021', role: 'Desenvolvedor Júnior' }
        ];
        
        const data = tooltipData[index];
        if (!data) return;
        
        // Remove existing tooltip
        timeline.hideTooltip();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'timeline-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>${data.company}</strong><br>
                <span class="tooltip-role">${data.role}</span><br>
                <span class="tooltip-period">${data.period}</span>
            </div>
        `;
        
        // Position tooltip
        const rect = marker.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top - 80}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        // Animate in
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
    },
    
    hideTooltip: () => {
        const existingTooltip = document.querySelector('.timeline-tooltip');
        if (existingTooltip) {
            existingTooltip.style.opacity = '0';
            setTimeout(() => {
                existingTooltip.remove();
            }, 300);
        }
    },
    
    // Add keyboard navigation
    setupKeyboardNavigation: () => {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const items = document.querySelectorAll('.timeline-item:not([style*="display: none"])');
            const currentIndex = Array.from(items).findIndex(item => item.classList.contains('highlighted'));
            
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    const prevIndex = Math.max(0, currentIndex - 1);
                    timeline.highlightTimelineItem(prevIndex);
                    timeline.scrollToItem(prevIndex);
                    break;
                    
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    const nextIndex = Math.min(items.length - 1, currentIndex + 1);
                    timeline.highlightTimelineItem(nextIndex);
                    timeline.scrollToItem(nextIndex);
                    break;
                    
                case 'Enter':
                    if (currentIndex >= 0) {
                        const card = items[currentIndex].querySelector('.timeline-card');
                        if (card) {
                            card.click();
                        }
                    }
                    break;
            }
        });
    }
};

// Main initialization
const app = {
    init: () => {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', app.start);
        } else {
            app.start();
        }
    },
    
    start: () => {
        console.log('🚀 Portfolio initialized');
        
        // Initialize all modules
        navigation.init();
        progressBar.init();
        skillsAnimation.init();
        statsAnimation.init();
        githubAPI.init();
        contactForm.init();
        animations.init();
        performanceOptimization.init();
        accessibility.init();
        timeline.init();
        
        // Mark as loaded
        isLoaded = true;
        document.body.classList.add('loaded');
        
        // Initialize EmailJS if available
        if (typeof emailjs !== 'undefined' && CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
            emailjs.init(CONFIG.emailjs.publicKey);
        }
        
        // Performance monitoring
        if ('performance' in window && window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                if (timing.loadEventEnd && timing.navigationStart) {
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log(`⚡ Page loaded in ${loadTime}ms`);
                }
            });
        }
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // You could send this to an error tracking service
});

// Initialize the application
app.init();

// Export for potential external use
window.Portfolio = {
    utils,
    navigation,
    skillsAnimation,
    githubAPI,
    contactForm,
    animations,
    performanceOptimization,
    accessibility,
    timeline
};