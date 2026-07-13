/**
 * =========================================================================
 * DIGITALHAUSA CORE ENGINE (app.js)
 * Unified Global State Management for Auth, Routing, and Localization
 * =========================================================================
 */

const AUTH_STORAGE_KEY = "digitalhausa_user_profile";
const LANG_STORAGE_KEY = "digitalhausa_lang_pref";

document.addEventListener("DOMContentLoaded", () => {
    handleGlobalNavigation();
    initPersistentLanguage();
    initUniversalSearch();
    
    const currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'HA';
    applyLanguageDOM(currentLang);
});

/* =========================================================================
 * 1. GLOBAL NAVIGATION, AUTHENTICATION & STATE GUARD
 * ========================================================================= */
function getUserProfile() {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;

    const user = JSON.parse(data);
    
    // Safely structure variables with fallback defaults if missing from storage
    return {
        id: user.id || "FE/23/8813977",
        name: user.name || "Ismail Salisu",
        role: user.role || "student",
        streakDays: parseInt(user.streakDays) || 0,
        completedLessonIds: user.completedLessonIds || [],
        lessonsCompleted: user.completedLessonIds ? user.completedLessonIds.length : 0,
        pathCompletionPct: parseInt(user.pathCompletionPct) || 0,
        xpPerLesson: parseInt(user.xpPerLesson) || 2 // 2 XP point weight per completed lesson
    };
}

function simulateSignIn() {
    // Initializing a true dynamic-ready object layout on baseline sign-in
    const freshStudentProfile = {
        id: "FE/23/8813977",
        name: "Ismail Salisu",
        role: "student",
        streakDays: 5,
        completedLessonIds: [], // Starts empty, tracking real pages read dynamically
        pathCompletionPct: 0,
        xpPerLesson: 2
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshStudentProfile));
    if (window.location.pathname.includes("profile.html")) {
        window.location.reload();
    } else {
        window.location.href = "dashboard.html";
    }
}

function handleGlobalNavigation() {
    const user = getUserProfile(); // Pulls live tracking state
    const bottomNav = document.querySelector('.app-bottom-nav');
    
    const statsCard = document.getElementById('student-stats-card');
    const nameLabel = document.getElementById('profile-display-name');
    const roleLabel = document.getElementById('profile-display-role');
    const authLabel = document.getElementById('auth-action-label');
    const authRow = document.getElementById('auth-action-row');

    const currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'HA';

    if (user && user.role === 'student') {
        if (statsCard) statsCard.style.display = 'block';
        if (nameLabel) nameLabel.innerText = user.name || "Ismail";
        
        if (roleLabel) {
            roleLabel.setAttribute('data-ha', 'Dalibi');
            roleLabel.setAttribute('data-en', 'Student');
            roleLabel.innerText = currentLang === 'EN' ? 'Student' : 'Dalibi';
        }
        if (authLabel) {
            authLabel.setAttribute('data-ha', 'Fita Daga Shafi');
            authLabel.setAttribute('data-en', 'Log Out');
            authLabel.innerText = currentLang === 'EN' ? 'Log Out' : 'Fita Daga Shafi';
        }
        if (authRow) {
            authRow.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem(AUTH_STORAGE_KEY);
                window.location.reload();
            };
        }

        // Dynamically rendering data parameters onto UI elements
        const sl = document.getElementById('stat-lessons');
        const ss = document.getElementById('stat-streak');
        const sx = document.getElementById('stat-xp');
        const sp = document.getElementById('stat-percentage'); 

        // Count actual unique array elements registered by page view events
        if (sl) sl.innerText = user.lessonsCompleted.toString();
        if (ss) ss.innerText = user.streakDays.toString();
        
        // Dynamic formula calculation: Total Real Lessons Covered * 2 XP constraint
        if (sx) {
            const totalXp = user.lessonsCompleted * user.xpPerLesson;
            sx.innerText = totalXp.toString();
        }
        
        // Displays the current coverage percentage inside the layout
        if (sp) sp.innerText = `${user.pathCompletionPct}%`;

        if (bottomNav) {
            const homeTab = bottomNav.querySelector('a[href="index.html"]');
            if (homeTab) homeTab.remove(); 

            if (!bottomNav.querySelector('a[href="dashboard.html"]')) {
                const dashTab = document.createElement('a');
                dashTab.href = "dashboard.html";
                dashTab.className = "nav-tab";
                if (window.location.pathname.includes("dashboard.html")) {
                    dashTab.classList.add("active-tab");
                }
                dashTab.innerHTML = `
                    <span class="tab-icon">📊</span>
                    <span class="tab-text" data-ha="Dashboard" data-en="Dashboard">Dashboard</span>
                `;
                bottomNav.insertBefore(dashTab, bottomNav.firstChild);
            }
        }
    } else {
        if (statsCard) statsCard.style.display = 'none'; 
        if (nameLabel) nameLabel.innerText = "Bako (Guest)";
        
        if (roleLabel) {
            roleLabel.innerText = currentLang === 'EN' ? 'Guest' : 'Bako';
        }
        if (authLabel) {
            authLabel.innerText = currentLang === 'EN' ? 'Log In' : 'Shiga Shafi';
        }
        if (authRow) {
            authRow.onclick = function() {
                simulateSignIn();
            };
        }

        if (bottomNav) {
            const dashTab = bottomNav.querySelector('a[href="dashboard.html"]');
            if (dashTab) dashTab.remove();
        }
        
        if (window.location.pathname.includes("dashboard.html")) {
            window.location.href = "learn.html";
        }

        if (window.location.pathname.includes("learn.html")) {
            const toggleContainer = document.querySelector('.toggle-container');
            if (toggleContainer) {
                toggleContainer.style.setProperty('display', 'none', 'important');
            }
            if (typeof switchLearningView === "function") {
                switchLearningView('tree');
            } else {
                const pathsView = document.getElementById('paths-view');
                const treeView = document.getElementById('tree-view');
                if (pathsView) pathsView.style.setProperty('display', 'none', 'important');
                if (treeView) treeView.style.setProperty('display', 'block', 'important');
            }
        }
    }
}

/* =========================================================================
 * 2. PERSISTENT LOCALIZATION CONTROLLER
 * ========================================================================= */
function initPersistentLanguage() {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) || 'HA';
    applyLanguageDOM(savedLang);
}

function toggleLanguageState() {
    const currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'HA';
    const nextLang = currentLang === 'HA' ? 'EN' : 'HA';
    
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    applyLanguageDOM(nextLang);
    handleGlobalNavigation();
}

function applyLanguageDOM(lang) {
    const langTextLabel = document.querySelector('.lang-toggle-badge .lang-text') || document.querySelector('.lang-toggle .lang-text');
    if (langTextLabel) langTextLabel.textContent = lang;

    const dataLabels = document.querySelectorAll('[data-ha]');
    dataLabels.forEach(el => {
        el.innerText = lang === 'HA' ? el.getAttribute('data-ha') : el.getAttribute('data-en');
    });

    const universalInput = document.getElementById('universal-search');
    if (universalInput) {
        universalInput.placeholder = lang === 'HA' 
            ? universalInput.getAttribute('data-ha-placeholder') 
            : universalInput.getAttribute('data-en-placeholder');
    }
}

/* =========================================================================
 * 3. UNIVERSAL LANDING PAGE SEARCH CONTROLLER
 * ========================================================================= */
function initUniversalSearch() {
    const searchInput = document.getElementById('universal-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const categoryBlocks = document.querySelectorAll('.category-block');

        if (query === "") {
            categoryBlocks.forEach(block => {
                block.style.display = 'block';
                block.style.opacity = '1';
                const subCards = block.querySelectorAll('.sub-card');
                subCards.forEach(card => card.style.opacity = '1');
            });
            return;
        }

        categoryBlocks.forEach(block => {
            const categoryName = block.querySelector('.category-name').textContent.toLowerCase();
            const tagline = block.querySelector('.category-tagline').textContent.toLowerCase();
            const subCards = block.querySelectorAll('.sub-card');
            
            let blockHasMatches = false;
            let matchInHeader = categoryName.includes(query) || tagline.includes(query);

            subCards.forEach(card => {
                const title = card.querySelector('.sub-card-title').textContent.toLowerCase();
                const meta = card.querySelector('.sub-card-meta').textContent.toLowerCase();
                
                const cardMatches = title.includes(query) || meta.includes(query);

                if (cardMatches || matchInHeader) {
                    card.style.opacity = '1';
                    blockHasMatches = true;
                } else {
                    card.style.opacity = '0.3';
                }
            });

            if (blockHasMatches || matchInHeader) {
                block.style.display = 'block';
                block.style.opacity = '1';
            } else {
                block.style.display = 'none';
            }
        });
    });
}

/* =========================================================================
 * 4. REAL-TIME AUTOMATIC LESSON TRACKING ENGINE
 * Call this function from any lesson page template.
 * ========================================================================= */
function completeLessonPage(lessonId) {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return; // Only track if user is logged in
    
    let user = JSON.parse(data);
    
    if (!user.completedLessonIds) {
        user.completedLessonIds = [];
    }
    
    // Check if they already read this unique lesson identifier to prevent tracking exploit
    if (!user.completedLessonIds.includes(lessonId)) {
        user.completedLessonIds.push(lessonId);
        
        // Update totals based on historical length
        user.lessonsCompleted = user.completedLessonIds.length;
        
        // Calculate Path Completion Percentage dynamically
        // Let's establish a base path track maximum of 12 target lessons
        const MAX_TRACK_LESSONS = 12;
        let dynamicPct = Math.round((user.lessonsCompleted / MAX_TRACK_LESSONS) * 100);
        user.pathCompletionPct = Math.min(dynamicPct, 100); 
        
        // Write instantly back into persistent localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        // Reflect changes to UI elements instantly
        handleGlobalNavigation();
    }
}

/* =========================================================================
 * 5. LESSON PAGE INTERACTIVITY (merged from lesson.js)
 * ========================================================================= */

/**
 * DIGITALHAUSA LESSON MODULE (lesson.js)
 * Dedicated interactivity for interactive lesson layouts
 */

function toggleContentsSidebar() {
    const sidebar = document.getElementById('contents-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('visible');
}

function checkAnswer(button, isCorrect) {
    if (!button || !button.parentElement) return;
    const siblings = button.parentElement.querySelectorAll('.option-btn');
    siblings.forEach(el => el.className = 'option-btn');
    
    if (isCorrect) {
        button.classList.add('correct');
    } else {
        button.classList.add('wrong');
    }
}

/* =========================================================================
 * 7. DICTIONARY MODULE (merged from dictionary.js)
 * ========================================================================= */





/**
 * DIGITALHAUSA DICTIONARY LOOKUP ENGINE (dictionary.js)
 * Dedicated search, category filtering, and accordion handlers
 */

document.addEventListener("DOMContentLoaded", () => {
    initDictionaryEngine();
});

function initDictionaryEngine() {
    const searchField = document.getElementById('dict-search-field');
    const filterChips = document.querySelectorAll('.filter-chips-carousel .chip');

    // 1. Hook search field typing actions
    if (searchField) {
        searchField.addEventListener('input', () => {
            filterTerms();
        });
    }

    // 2. Hook filter category button tap actions
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove selection state from siblings and activate this one
            filterChips.forEach(c => c.classList.remove('active-chip'));
            this.classList.add('active-chip');
            
            // Run standard filtering pass
            filterTerms();
        });
    });

    // Run initial counts on startup
    updateResultsCounter();
}

/**
 * Main Logic: Combines active search strings and selected category targets
 */
function filterTerms() {
    const searchField = document.getElementById('dict-search-field');
    const searchValue = searchField ? searchField.value.toLowerCase().trim() : "";
    
    const activeChip = document.querySelector('.filter-chips-carousel .chip.active-chip');
    const selectedCategory = activeChip ? activeChip.getAttribute('data-category') : 'all';

    const cards = document.querySelectorAll('.dict-accordion-stack .dict-card');

    cards.forEach(card => {
        // Grab values directly from interior text markup nodes
        const englishText = card.querySelector('.term-english').textContent.toLowerCase();
        const hausaText = card.querySelector('.term-hausa-translation').textContent.toLowerCase();
        const definitionText = card.querySelector('.definition-text') ? card.querySelector('.definition-text').textContent.toLowerCase() : "";
        const tagText = card.querySelector('.term-tag').textContent.trim();

        // Check if query match criteria exist
        const matchesSearch = englishText.includes(searchValue) || 
                              hausaText.includes(searchValue) || 
                              definitionText.includes(searchValue);

        // Check if category rules match
        const matchesCategory = (selectedCategory === 'all' || tagText === selectedCategory);

        // Render visibility state based on logic match results
        if (matchesSearch && matchesCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
            // Collapse items out of sight to preserve layout clean lines
            card.classList.remove('expanded-card');
            const arrow = card.querySelector('.accordion-arrow');
            if (arrow) arrow.innerText = '▼';
        }
    });

    updateResultsCounter();
}

/**
 * Dynamically updates UI element counters
 */
function updateResultsCounter() {
    const visibleCards = document.querySelectorAll('.dict-accordion-stack .dict-card[style="display: block;"]').length;
    const totalCards = document.querySelectorAll('.dict-accordion-stack .dict-card').length;
    
    // Fallback if elements aren't overridden with inline hidden states yet
    const hiddenCards = document.querySelectorAll('.dict-accordion-stack .dict-card[style="display: none;"]').length;
    const directCount = totalCards - hiddenCards;

    const counterNum = document.querySelector('.results-counter .count-num');
    if (counterNum) {
        counterNum.textContent = directCount;
    }
}

/**
 * Global Accordion UI Toggle View Routing
 */
function toggleAccordion(headerElement) {
    const card = headerElement.parentElement;
    const arrow = headerElement.querySelector('.accordion-arrow');
    
    if (!card || !arrow) return;

    card.classList.toggle('expanded-card');
    if (card.classList.contains('expanded-card')) {
        arrow.innerText = '▲';
    } else {
        arrow.innerText = '▼';
    }
}

/* =========================================================================
 * 6. LEARNING HUB MODULE (merged from learn.js)
 * ========================================================================= */

function switchLearningView(viewMode) {
    const pathsView = document.getElementById('paths-view');
    const treeView = document.getElementById('tree-view');
    const btnPaths = document.getElementById('btn-paths-view');
    const btnTree = document.getElementById('btn-tree-view');

    if (!pathsView || !treeView) return;

    if (viewMode === 'tree') {
        pathsView.style.setProperty('display', 'none', 'important');
        pathsView.classList.add('hidden');

        treeView.style.setProperty('display', 'block', 'important');
        treeView.classList.remove('hidden');

        if (btnTree) {
            btnTree.classList.add('active');
            btnTree.setAttribute('aria-pressed', 'true');
        }
        if (btnPaths) {
            btnPaths.classList.remove('active');
            btnPaths.setAttribute('aria-pressed', 'false');
        }
    } else {
        pathsView.style.setProperty('display', 'block', 'important');
        pathsView.classList.remove('hidden');

        treeView.style.setProperty('display', 'none', 'important');
        treeView.classList.add('hidden');

        if (btnPaths) {
            btnPaths.classList.add('active');
            btnPaths.setAttribute('aria-pressed', 'true');
        }
        if (btnTree) {
            btnTree.classList.remove('active');
            btnTree.setAttribute('aria-pressed', 'false');
        }
    }
}

function toggleBranch(triggerElement) {
    if (!triggerElement) return;

    const contentBlock = triggerElement.nextElementSibling;
    const chevron = triggerElement.querySelector('.branch-chevron');

    if (contentBlock && contentBlock.classList.contains('branch-content')) {
        contentBlock.classList.toggle('nested-hidden');

        if (chevron) {
            chevron.style.transform = contentBlock.classList.contains('nested-hidden') 
                ? 'rotate(0deg)' 
                : 'rotate(90deg)';
        }
    }
}

function toggleSubBranch(triggerElement) {
    if (!triggerElement) return;

    const targetGrid = triggerElement.nextElementSibling;
    const chevron = triggerElement.querySelector('.sub-chevron');

    if (targetGrid && targetGrid.classList.contains('languages-grid')) {
        targetGrid.classList.toggle('nested-hidden');

        if (chevron) {
            chevron.style.transform = targetGrid.classList.contains('nested-hidden') 
                ? 'rotate(0deg)' 
                : 'rotate(90deg)';
        }
    }
}


/* =========================================================================
 * 8. CLICK RIPPLE & INTERACTION EFFECTS
 * ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initRippleEffect();
    initScrollReveal();
});

function initRippleEffect() {
    // Add ripple effect to all clickable elements
    const clickables = document.querySelectorAll(
        '.btn-primary, .btn-secondary, .resume-btn, .control-btn, ' +
        '.option-btn, .chip, .review-chip, .nav-tab, .settings-row-item, ' +
        '.dict-card-header, .branch-trigger, .sub-branch-trigger, .track-card'
    );

    clickables.forEach(el => {
        el.addEventListener('click', function(e) {
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.4);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: rippleExpand 0.6s ease-out forwards;
                z-index: 1;
            `;

            el.style.position = 'relative';
            el.style.overflow = 'hidden';
            el.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple keyframes to document
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes rippleExpand {
                0% { transform: scale(0); opacity: 0.5; }
                100% { transform: scale(4); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});

function initScrollReveal() {
    // Reveal elements as they scroll into view
    const revealElements = document.querySelectorAll(
        '.category-block, .journey-step, .why-card, .discovery-section'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}


/* =========================================================================
 * 9. SMOOTH ACCORDION ARROW ROTATION
 * ========================================================================= */

function animateAccordionArrow(card, isExpanded) {
    const arrow = card.querySelector('.accordion-arrow');
    if (arrow) {
        arrow.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        arrow.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

// Override existing toggleAccordion to include animation
const originalToggleAccordion = toggleAccordion;
toggleAccordion = function(headerElement) {
    const card = headerElement.parentElement;
    const wasExpanded = card.classList.contains('expanded-card');

    originalToggleAccordion(headerElement);

    const isExpanded = !wasExpanded;
    animateAccordionArrow(card, isExpanded);
};
