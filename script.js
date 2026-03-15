// --- SESSION KEY ---
const SESSION_KEY = 'current_user';
const VIEW_MODE_KEY = 'portfolio_view_mode';

// --- DOM ELEMENTS ---
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const portfolioView = document.getElementById('portfolio-view');
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const authFormLogin = document.getElementById('auth-form-login');
const authFormRegister = document.getElementById('auth-form-register');
const portfolioForm = document.getElementById('portfolio-form');
const authLink = document.getElementById('auth-link');
const authLinkLogin = document.getElementById('auth-link-login');
const authText = document.getElementById('auth-text');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const filePreview = document.getElementById('file-preview');
const skillsInput = document.getElementById('skills-input');
const skillsPreview = document.getElementById('skills-preview');

// --- STATE ---
let isRegistering = false;
let currentUser = null;
let tempCertifications = [];

// ---------------- PROFILE PICTURE UPLOAD ----------------
function initProfileUpload() {
    const fileBox = document.getElementById("file-preview");
    const fileInput = document.getElementById("profile-pic");

    if (!fileBox || !fileInput) return;

    fileBox.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        handleProfileImage({ target: { files: fileInput.files } });
    });

    fileBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileBox.style.borderColor = "#6366f1";
        fileBox.classList.add("dragging");
    });

    fileBox.addEventListener("dragleave", () => {
        fileBox.style.borderColor = "";
        fileBox.classList.remove("dragging");
    });

    fileBox.addEventListener("drop", (e) => {
        e.preventDefault();
        fileBox.style.borderColor = "";
        fileBox.classList.remove("dragging");

        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            handleProfileImage({ target: { files: [file] } });
        }
    });
}

function handleProfileImage(event) {
    const file = event.target.files[0];
    const fileBox = document.getElementById("file-preview");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file.", "error");
        return;
    }

    // Compress image before displaying
    compressImage(file, (compressedDataUrl) => {
        fileBox.innerHTML = `
            <img src="${compressedDataUrl}" 
                 style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
        `;
        fileBox.dataset.image = compressedDataUrl;
    });
}

// ---------------- PROJECT IMAGE UPLOAD ----------------
function initProjectUpload() {
    const projectBox = document.getElementById("project-preview");
    const projectInput = document.getElementById("project-file");

    if (!projectBox || !projectInput) return;

    projectBox.addEventListener("click", () => {
        projectInput.click();
    });

    projectInput.addEventListener("change", () => {
        handleProjectImage({ target: { files: projectInput.files } });
    });

    projectBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        projectBox.style.borderColor = "#6366f1";
        projectBox.classList.add("dragging");
    });

    projectBox.addEventListener("dragleave", () => {
        projectBox.style.borderColor = "";
        projectBox.classList.remove("dragging");
    });

    projectBox.addEventListener("drop", (e) => {
        e.preventDefault();
        projectBox.style.borderColor = "";
        projectBox.classList.remove("dragging");

        const file = e.dataTransfer.files[0];
        if (file) {
            projectInput.files = e.dataTransfer.files;
            handleProjectImage({ target: { files: [file] } });
        }
    });
}

function handleProjectImage(event) {
    const file = event.target.files[0];
    const projectBox = document.getElementById("project-preview");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file.", "error");
        return;
    }

    // Compress image before displaying
    compressImage(file, (compressedDataUrl) => {
        projectBox.innerHTML = `
            <img src="${compressedDataUrl}" 
                 style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
        `;
        projectBox.dataset.image = compressedDataUrl;
    });
}

// ---------------- IMAGE COMPRESSION ----------------
function compressImage(file, callback, maxWidth = 800, quality = 0.7) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Resize if larger than maxWidth
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(compressedDataUrl);
        };
    };
}

// ---------------- THEME SYSTEM ----------------
function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    updateThemeIcon();
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.body.getAttribute("data-theme") === "dark";

    themeToggle.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}

// ---------------- TOAST ----------------
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.style.borderLeftColor = type === 'success' ? '#10b981' : '#ef4444';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ---------------- AUTH ----------------
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);

    authLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerCard.classList.remove('hidden-card');
        loginCard.classList.add('to-left');
        registerCard.classList.add('from-right');
        
        setTimeout(() => {
            loginCard.classList.add('hidden-card');
            loginCard.classList.remove('to-left');
            registerCard.classList.remove('from-right');
            isRegistering = true;
        }, 500);
    });

    authLinkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('hidden-card');
        registerCard.classList.add('to-right');
        loginCard.classList.add('from-left');
        
        setTimeout(() => {
            registerCard.classList.add('hidden-card');
            registerCard.classList.remove('to-right');
            loginCard.classList.remove('from-left');
            isRegistering = false;
        }, 500);
    });

    authFormLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username-login').value.trim();
        const password = document.getElementById('password-login').value;

        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        loginUser(username, password);
    });

    authFormRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username-register').value.trim();
        const password = document.getElementById('password-register').value;

        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        registerUser(username, password);
    });

    logoutBtn.addEventListener('click', logout);

    document.getElementById('save-btn').addEventListener('click', async () => {
        await savePortfolio(false);
    });

    document.getElementById('view-btn').addEventListener('click', async () => {
        await savePortfolio(true);
    });

    document.getElementById('add-project-btn').addEventListener('click', addCertification);
    
    document.getElementById('add-skills-btn').addEventListener('click', addSkill);
}

// ---------------- REGISTER ----------------
async function registerUser(username, password) {
    try {
        const res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showToast("Registered successfully! Please login.");

        document.getElementById('username-register').value = '';
        document.getElementById('password-register').value = '';

        loginCard.classList.remove('hidden-card');
        registerCard.classList.add('to-right');
        loginCard.classList.add('from-left');
        
        setTimeout(() => {
            registerCard.classList.add('hidden-card');
            registerCard.classList.remove('to-right');
            loginCard.classList.remove('from-left');
            isRegistering = false;
        }, 500);

    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------- LOGIN ----------------
async function loginUser(username, password) {
    try {
        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        currentUser = {
            userId: data.userId,
            username: username
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));

        // Clear form before loading new user data
        clearPortfolioForm();
        
        // Clear old draft for new login
        clearDraftPortfolio();

        // Update username display in sidebar
        updateSidebarUsername();

        await loadPortfolio();
        showDashboard();
        showToast("Login successful!");

    } catch (err) {
        showToast(err.message, "error");
    }
}

// ---------------- LOGOUT ----------------
function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
    currentUser = null;
    
    // Clear draft
    clearDraftPortfolio();
    
    // Clear login form
    document.getElementById('username-login').value = '';
    document.getElementById('password-login').value = '';
    
    // Clear register form
    document.getElementById('username-register').value = '';
    document.getElementById('password-register').value = '';
    
    showAuth();
    showToast('Logged out successfully');
}

// ---------------- SESSION ----------------
async function checkSession() {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        const viewMode = localStorage.getItem(VIEW_MODE_KEY);
        
        console.log("SESSION_KEY:", session);
        
        if (session) {
            currentUser = JSON.parse(session);
            
            // Check if user was in portfolio view mode
            if (viewMode === 'view') {
                await loadPortfolio();
                showPortfolio();
            } else {
                showDashboard();
            }
        } else {
            showAuth();
        }
    } catch (e) {
        console.error("Session check error:", e);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(VIEW_MODE_KEY);
        showAuth();
    }
}

// ---------------- VIEW CONTROL ----------------
function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    portfolioView.classList.add('hidden');
    logoutBtn.style.display = 'none';
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    portfolioView.classList.add('hidden');
    logoutBtn.style.display = 'inline-block';
    loadPortfolioToForm();
}

function showPortfolio() {
    authSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    portfolioView.classList.remove('hidden');
    localStorage.setItem(VIEW_MODE_KEY, 'view');
    resetTabNavigation();
    updateSidebarUsername();
    logoutBtn.style.display = 'inline-block';
}

// ---------------- CLEAR PORTFOLIO FORM ----------------
function clearPortfolioForm() {
    // Clear input fields
    document.getElementById('full-name').value = '';
    document.getElementById('job-title').value = '';
    document.getElementById('intro-text').value = '';
    document.getElementById('skills-input').value = '';
    
    // Clear social inputs
    document.getElementById('social-ig').value = '';
    document.getElementById('social-fb').value = '';
    document.getElementById('social-x').value = '';
    document.getElementById('social-linkedin').value = '';
    document.getElementById('social-github').value = '';
    
    // Clear profile picture preview
    const filePreview = document.getElementById('file-preview');
    if (filePreview) {
        filePreview.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click or drag to upload</span>
        `;
        delete filePreview.dataset.image;
    }
    
    // Clear project picture preview
    const projectPreview = document.getElementById('project-preview');
    if (projectPreview) {
        projectPreview.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click or drag to upload</span>
        `;
        delete projectPreview.dataset.image;
    }
    
    // Clear project fields
    document.getElementById('project-title').value = '';
    document.getElementById('project-desc').value = '';
    document.getElementById('project-link').value = '';
    document.getElementById('project-file').value = '';
    
    // Clear certifications array and render
    tempCertifications = [];
    renderCertificationList();
    
    // Clear skills preview
    const skillsPreview = document.getElementById('skills-preview');
    if (skillsPreview) {
        skillsPreview.innerHTML = '';
    }
}

// ---------------- LOAD PORTFOLIO TO FORM ----------------
async function loadPortfolioToForm() {
    if (!currentUser || !currentUser.userId) return;

    try {
        const res = await fetch(`http://localhost:5000/get-portfolio/${currentUser.userId}`);
        const data = await res.json();

        if (!data) return;

        document.getElementById('full-name').value = data.fullName || '';
        document.getElementById('job-title').value = data.jobTitle || '';
        document.getElementById('intro-text').value = data.intro || '';
        tempSkills = data.skills || [];
        renderSkillTags();
        
        document.getElementById('social-ig').value = data.socials?.instagram || '';
        document.getElementById('social-fb').value = data.socials?.facebook || '';
        document.getElementById('social-x').value = data.socials?.twitter || '';
        
        const linkedinInput = document.getElementById('social-linkedin');
        const githubInput = document.getElementById('social-github');
        if (linkedinInput) linkedinInput.value = data.socials?.linkedin || '';
        if (githubInput) githubInput.value = data.socials?.github || '';

        const filePreview = document.getElementById("file-preview");
        if (data.profilePic) {
            filePreview.innerHTML = `
                <img src="${data.profilePic}" 
                     style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
            `;
            filePreview.dataset.image = data.profilePic;
        }

        tempCertifications = data.certifications || [];
        renderCertificationList();

    } catch (err) {
        console.log("Error loading portfolio to form:", err);
    }
}

// ---------------- CERTIFICATIONS ----------------
function addCertification() {
    const title = document.getElementById('project-title').value.trim();
    const desc = document.getElementById('project-desc').value.trim();
    const link = document.getElementById('project-link').value.trim();

    if (!title || !desc) {
        showToast('Enter title and description', 'error');
        return;
    }

    const projectBox = document.getElementById("project-preview");
    const certImage = projectBox ? projectBox.dataset.image || null : null;
    
    tempCertifications.push({ title, desc, link, image: certImage });
    renderCertificationList();

    if (projectBox) {
        projectBox.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click or drag to upload</span>
        `;
        delete projectBox.dataset.image;
    }
    
    document.getElementById('project-title').value = '';
    document.getElementById('project-desc').value = '';
    document.getElementById('project-link').value = '';
    document.getElementById('project-file').value = '';

    showToast('Certification added!');
}

function renderCertificationList() {
    const list = document.getElementById('project-list');
    list.innerHTML = '';

    tempCertifications.forEach((cert, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${cert.title}</span>
            <button onclick="removeCertification(${index})">X</button>
        `;
        list.appendChild(li);
    });
}

window.removeCertification = function(index) {
    tempCertifications.splice(index, 1);
    renderCertificationList();
};

// ---------------- SAVE PORTFOLIO ----------------
async function savePortfolio(showAfterSave = false) {

    if (!currentUser || !currentUser.userId) {
        showToast('Please login first', 'error');
        return;
    }

    const userData = {
        profilePic: document.getElementById("file-preview").dataset.image || null,
        fullName: document.getElementById('full-name').value,
        jobTitle: document.getElementById('job-title').value,
        intro: document.getElementById('intro-text').value,
        skills: getSkillsForSave(),
        certifications: tempCertifications,
        pictures: tempCertifications.map(c => c.image).filter(img => img),
        socials: {
            instagram: document.getElementById("social-ig")?.value || '',
            facebook: document.getElementById("social-fb")?.value || '',
            twitter: document.getElementById("social-x")?.value || ''
        }
    };

    console.log("Saving portfolio for user:", currentUser.userId);

    try {
        const res = await fetch("http://localhost:5000/save-portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId,
                portfolio: userData
            })
        });

        console.log("Response status:", res.status);
        
        const text = await res.text();
        console.log("Response text:", text.substring(0, 200));
        
        if (!res.ok) {
            try {
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Failed to save portfolio');
            } catch (parseErr) {
                if (parseErr instanceof SyntaxError) {
                    throw new Error(res.statusText || 'Failed to save portfolio');
                }
                throw parseErr;
            }
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Could not parse response as JSON:", text);
            showToast("Viewed successfully!");
            if (showAfterSave) {
                await loadPortfolio();
                showPortfolio();
            }
            return;
        }

        showToast(data.message || "Viewed successfully!");
        
        // Clear draft after saving
        clearDraftPortfolio();
        
        if (showAfterSave) {
            await loadPortfolio();
            showPortfolio();
        }

    } catch (err) {
        console.error("Save error:", err);
        showToast(err.message || "Failed to save portfolio. Please try again.", "error");
    }
}

// ---------------- LOAD PORTFOLIO ----------------
async function loadPortfolio() {

    try {
        const res = await fetch(`http://localhost:5000/get-portfolio/${currentUser.userId}`);
        const data = await res.json();

        if (!data) return;

        // Update profile picture using innerHTML to ensure it renders
        const profilePicWrapper = document.querySelector('.profile-pic-wrapper');
        if (profilePicWrapper && data.profilePic && data.profilePic.startsWith('data:')) {
            profilePicWrapper.innerHTML = `
                <img id="view-pic" src="${data.profilePic}" alt="Profile Picture" style="display:block;visibility:visible;">
                <div class="pic-overlay">
                    <p class="pf-handle" id="overviewUsername"></p>
                </div>
            `;
            console.log("Image rendered via innerHTML");
        } else if (profilePicWrapper) {
            profilePicWrapper.innerHTML = `
                <img id="view-pic" src="default pfp.jpg" alt="No Profile Picture" style="display:none;">
                <div class="pic-overlay">
                    <p class="pf-handle" id="overviewUsername"></p>
                </div>
            `;
        }

        // Also update the name and title
        document.getElementById("view-name").textContent = data.fullName || "";
        document.getElementById("view-title").textContent = data.jobTitle || "";
        document.getElementById("view-intro").textContent = data.intro || "";

        const skillsContainer = document.getElementById("view-skills");
        skillsContainer.innerHTML = "";
        data.skills.forEach(skill => {
            const span = document.createElement("span");
            span.textContent = skill;
            skillsContainer.appendChild(span);
        });

        const socialsContainer = document.getElementById("view-socials");
        socialsContainer.innerHTML = "";

        // Populate social links card
        const socialsCardContainer = document.getElementById("view-socials-cards");
        socialsCardContainer.innerHTML = "";
        socialsCardContainer.className = "social-links-container";

        const socialLinks = [
            { key: 'instagram', icon: 'fab fa-instagram', name: 'Instagram', url: data.socials?.instagram },
            { key: 'facebook', icon: 'fab fa-facebook', name: 'Facebook', url: data.socials?.facebook },
            { key: 'twitter', icon: 'fab fa-twitter', name: 'Twitter (X)', url: data.socials?.twitter }
        ];

        let hasSocials = false;
        socialLinks.forEach(social => {
            if (social.url) {
                hasSocials = true;
                const linkDiv = document.createElement("div");
                linkDiv.className = "social-link-card";
                linkDiv.innerHTML = `
                    <a href="${social.url}" target="_blank" class="social-link-item">
                        <i class="${social.icon}"></i>
                        <span>${social.name}</span>
                    </a>
                `;
                socialsCardContainer.appendChild(linkDiv);
            }
        });

        if (!hasSocials) {
            socialsCardContainer.innerHTML = '<p style="color: var(--text-light);">No social links added yet.</p>';
        }

        // Also update profile sidebar social icons
        if (data.socials.instagram) {
            socialsContainer.innerHTML += `
                <a href="${data.socials.instagram}" target="_blank">
                    <i class="fab fa-instagram"></i>
                </a>`;
        }

        if (data.socials.facebook) {
            socialsContainer.innerHTML += `
                <a href="${data.socials.facebook}" target="_blank">
                    <i class="fab fa-facebook"></i>
                </a>`;
        }

        if (data.socials.twitter) {
            socialsContainer.innerHTML += `
                <a href="${data.socials.twitter}" target="_blank">
                    <i class="fab fa-twitter"></i>
                </a>`;
        }
        
        

        const projectsContainer = document.getElementById("view-projects");
        projectsContainer.innerHTML = "";

        data.certifications.forEach((cert, index) => {
            const div = document.createElement("div");
            div.classList.add("project-item");
 
            div.innerHTML = `
    ${cert.image ? `<img src="${cert.image}" alt="${cert.title}">` : ""}
    <h4>${cert.title}</h4>
    <p>${cert.desc}</p>
    <button class="view-cert-btn" data-cert-index="${index}">View Details</button>
`;

            projectsContainer.appendChild(div);
        });
        
        window.certificationsData = data.certifications;
        
        document.querySelectorAll('.view-cert-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-cert-index'));
                window.showCertModal(index);
            });
        });

    } catch (err) {
        console.log(err);
    }
}

// ---------------- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupEventListeners();
    loadTheme();
    initProfileUpload();
    initProjectUpload();
    initSkillsPreview();
    initTabNavigation();
    initSidebarActions();
    loadDraftPortfolio();
    initAutoSave();
});

// ---------------- AUTO SAVE DRAFT ----------------
const DRAFT_KEY = 'portfolio_draft';

function saveDraftPortfolio() {
    if (!currentUser || !currentUser.userId) return;
    
    const draftData = {
        profilePic: document.getElementById("file-preview")?.dataset.image || null,
        fullName: document.getElementById('full-name').value,
        jobTitle: document.getElementById('job-title').value,
        intro: document.getElementById('intro-text').value,
        tempSkills: tempSkills,
        socials: {
            instagram: document.getElementById("social-ig")?.value || '',
            facebook: document.getElementById("social-fb")?.value || '',
            twitter: document.getElementById("social-x")?.value || ''
        },
        tempCertifications: tempCertifications
    };
    
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
}

function loadDraftPortfolio() {
    if (!currentUser || !currentUser.userId) return;
    
    const draftData = localStorage.getItem(DRAFT_KEY);
    if (!draftData) return;
    
    try {
        const data = JSON.parse(draftData);
        
        document.getElementById('full-name').value = data.fullName || '';
        document.getElementById('job-title').value = data.jobTitle || '';
        document.getElementById('intro-text').value = data.intro || '';
        tempSkills = data.tempSkills || [];
        renderSkillTags();
        
        document.getElementById('social-ig').value = data.socials?.instagram || '';
        document.getElementById('social-fb').value = data.socials?.facebook || '';
        document.getElementById('social-x').value = data.socials?.twitter || '';
        
        const linkedinInput = document.getElementById('social-linkedin');
        const githubInput = document.getElementById('social-github');
        if (linkedinInput) linkedinInput.value = data.socials?.linkedin || '';
        if (githubInput) githubInput.value = data.socials?.github || '';
        
        // Load profile picture
        if (data.profilePic) {
            const filePreview = document.getElementById("file-preview");
            if (filePreview) {
                filePreview.innerHTML = `
                    <img src="${data.profilePic}" 
                         style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
                `;
                filePreview.dataset.image = data.profilePic;
            }
        }
        
        // Load certifications
        tempCertifications = data.tempCertifications || [];
        renderCertificationList();
        renderSkillTags();
        
    } catch (err) {
        console.log("Error loading draft:", err);
    }
}

function clearDraftPortfolio() {
    localStorage.removeItem(DRAFT_KEY);
}

function initAutoSave() {
    const formInputs = document.querySelectorAll('#portfolio-form input, #portfolio-form textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            saveDraftPortfolio();
        });
    });
}

// ---------------- SIDEBAR ACTIONS ----------------
function updateSidebarUsername() {
    const overviewUsername = document.getElementById('overviewUsername');
    if (currentUser && overviewUsername) {
        overviewUsername.textContent = '@' + currentUser.username;
    }
}

function initSidebarActions() {
    const sidebarEditBtn = document.getElementById('sidebar-edit-btn');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

    // Display username in sidebar
    updateSidebarUsername();

    if (sidebarEditBtn) {
        sidebarEditBtn.addEventListener('click', () => {
            portfolioView.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            localStorage.setItem(VIEW_MODE_KEY, 'edit');
        });
    }

    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', logout);
    }
}

// ---------------- TAB NAVIGATION ----------------
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.cards-container .card');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            cards.forEach(card => {
                card.classList.remove('active');
            });
            
            const targetCard = document.getElementById(`card-${targetTab}`);
            if (targetCard) {
                setTimeout(() => {
                    targetCard.classList.add('active');
                }, 10);
            }
        });
    });
    
    showDefaultTab();
}

function showDefaultTab() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.cards-container .card');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    cards.forEach(card => card.classList.remove('active'));
    
    const introBtn = document.querySelector('.tab-btn[data-tab="intro"]');
    const introCard = document.getElementById('card-intro');
    
    if (introBtn && introCard) {
        introBtn.classList.add('active');
        introCard.classList.add('active');
    }
}

function resetTabNavigation() {
    showDefaultTab();
}

// ---------------- SKILLS TAGS PREVIEW ----------------
let tempSkills = [];

function initSkillsPreview() {
    const skillsInput = document.getElementById('skills-input');
    const skillsPreview = document.getElementById('skills-preview');
    const addSkillsBtn = document.getElementById('add-skills-btn');
    
    if (!skillsInput || !skillsPreview || !addSkillsBtn) return;
    
    addSkillsBtn.addEventListener('click', addSkill);
    skillsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    renderSkillTags();
}

function addSkill() {
    const skillsInput = document.getElementById('skills-input');
    const skillText = skillsInput.value.trim();
    
    if (skillText) {
        tempSkills.push(skillText);
        skillsInput.value = '';
        renderSkillTags();
        showToast('Skill added!');
    } else {
        showToast('Please enter a skill', 'error');
    }
}

function renderSkillTags() {
    const skillsPreview = document.getElementById('skills-preview');
    
    if (!skillsPreview) return;
    
    skillsPreview.innerHTML = '';
    
    tempSkills.forEach((skill, index) => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `${skill} <i class="fas fa-times"></i>`;
        
        tag.querySelector('i').addEventListener('click', () => {
            removeSkill(index);
        });
        
        skillsPreview.appendChild(tag);
    });
}

function removeSkill(index) {
    tempSkills.splice(index, 1);
    renderSkillTags();
}

function getSkillsForSave() {
    return tempSkills;
}

// ---------------- CERTIFICATION MODAL ----------------
window.showCertModal = function(index) {
    const cert = window.certificationsData[index];
    if (!cert) return;
    
    const modal = document.getElementById('cert-modal');
    const modalImage = document.getElementById('modal-image-container');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    
    modalTitle.textContent = cert.title || '';
    modalDesc.textContent = cert.desc || '';
    
    if (cert.image) {
        modalImage.innerHTML = `<img src="${cert.image}" style="width:100%;border-radius:10px;margin-bottom:20px;">`;
        modalImage.style.display = 'block';
    } else {
        modalImage.innerHTML = '';
        modalImage.style.display = 'none';
    }
    
    modal.style.display = 'block';
    modal.classList.remove('hidden');
};

window.closeCertModal = function() {
    const modal = document.getElementById('cert-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeCertModal);
    }
});

document.addEventListener('click', function(e) {
    const modal = document.getElementById('cert-modal');
    if (e.target === modal) {
        window.closeCertModal();
    }
});

