// Face Recognition Authentication System
// Advanced Face Recognition Authentication System
// Main Application State
class FaceAuthApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.faceDescriptors = this.loadFaceDescriptors();
        this.users = this.loadUsers();
        this.loginAttempts = this.loadLoginAttempts();
        this.adminCredentials = { username: 'admin', password: 'admin123' };
        this.currentMode = 'register'; // register, login, dashboard, admin
        this.videoStream = null;
        this.faceDetector = null;
        this.init();
    }

    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadFaceAPI();
        this.showCurrentView();
    }

    initializeElements() {
        // Get all DOM elements
        this.elements = {
            // Registration elements
            registerForm: document.getElementById('registerForm'),
            loginForm: document.getElementById('loginForm'),
            adminLoginForm: document.getElementById('adminLoginForm'),
            
            // Tabs
            faceRecognitionTab: document.getElementById('faceRecognitionTab'),
            emailPasswordTab: document.getElementById('emailPasswordTab'),
            
            // Views
            registrationView: document.getElementById('registrationView'),
            loginView: document.getElementById('loginView'),
            dashboardView: document.getElementById('dashboardView'),
            adminDashboardView: document.getElementById('adminDashboardView'),
            adminLoginView: document.getElementById('adminLoginView'),
            otpModal: document.getElementById('otpModal'),
            
            // Camera elements
            video: document.getElementById('video'),
            canvas: document.getElementById('canvas'),
            captureBtn: document.getElementById('captureBtn'),
            startCameraBtn: document.getElementById('startCamera'),
            
            // Form inputs
            usernameInput: document.getElementById('username'),
            emailInput: document.getElementById('email'),
            loginUsernameInput: document.getElementById('loginUsername'),
            
            // Dashboard elements
            userGreeting: document.getElementById('userGreeting'),
            userProfilePic: document.getElementById('userProfilePic'),
            currentTimeDisplay: document.getElementById('currentTime'),
            
            // Navigation
            logoutBtn: document.getElementById('logoutBtn'),
            adminBtn: document.getElementById('adminBtn'),
            backToLoginBtn: document.getElementById('backToLogin'),
            
            // OTP elements
            otpInputs: document.querySelectorAll('.otp-input'),
            verifyOtpBtn: document.getElementById('verifyOtp'),
            resendOtpBtn: document.getElementById('resendOtp'),
            
            // Admin elements
            totalUsersCount: document.getElementById('totalUsers'),
            activeSessionsCount: document.getElementById('activeSessions'),
            todayLoginsCount: document.getElementById('todayLogins'),
            usersList: document.getElementById('usersList'),
            loginHistoryList: document.getElementById('loginHistory')
        };
    }

    bindEvents() {
        // Tab switching
        if (this.elements.faceRecognitionTab) {
            this.elements.faceRecognitionTab.addEventListener('click', () => this.switchTab('face'));
        }
        if (this.elements.emailPasswordTab) {
            this.elements.emailPasswordTab.addEventListener('click', () => this.switchTab('email'));
        }

        // Camera controls
        if (this.elements.startCameraBtn) {
            this.elements.startCameraBtn.addEventListener('click', () => this.startCamera());
        }
        if (this.elements.captureBtn) {
            this.elements.captureBtn.addEventListener('click', () => this.captureFace());
        }

        // Form submissions
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.elements.adminLoginForm) {
            this.elements.adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
        }

        // Navigation
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.logout());
        }
        if (this.elements.adminBtn) {
            this.elements.adminBtn.addEventListener('click', () => this.showAdminLogin());
        }
        if (this.elements.backToLoginBtn) {
            this.elements.backToLoginBtn.addEventListener('click', () => this.showView('login'));
        }

        // OTP handling
        if (this.elements.verifyOtpBtn) {
            this.elements.verifyOtpBtn.addEventListener('click', () => this.verifyOTP());
        }
        if (this.elements.resendOtpBtn) {
            this.elements.resendOtpBtn.addEventListener('click', () => this.resendOTP());
        }

        // OTP input handling
        this.elements.otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleOTPInput(e, index));
            input.addEventListener('keydown', (e) => this.handleOTPKeydown(e, index));
        });

        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    async loadFaceAPI() {
        try {
            // In a real implementation, you would load face-api.js
            console.log('Face API loaded successfully');
            this.faceDetector = {
                detectFaces: () => Promise.resolve([{ descriptor: this.generateMockDescriptor() }]),
                compareFaces: (desc1, desc2) => Math.random() > 0.3 // Mock comparison
            };
        } catch (error) {
            console.error('Failed to load Face API:', error);
            this.showNotification('Face recognition not available', 'error');
        }
    }

    generateMockDescriptor() {
        // Generate a mock face descriptor for demo purposes
        return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
    }

    async startCamera() {
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            this.elements.video.srcObject = this.videoStream;
            this.elements.video.style.display = 'block';
            this.elements.captureBtn.style.display = 'inline-block';
            this.elements.startCameraBtn.textContent = 'Camera Active';
            this.elements.startCameraBtn.disabled = true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showNotification('Camera access denied', 'error');
        }
    }

    async captureFace() {
        if (!this.videoStream) {
            this.showNotification('Please start camera first', 'error');
            return;
        }

        try {
            const canvas = this.elements.canvas;
            const context = canvas.getContext('2d');
            canvas.width = this.elements.video.videoWidth;
            canvas.height = this.elements.video.videoHeight;
            context.drawImage(this.elements.video, 0, 0);
            
            // Simulate face detection
            await this.delay(1000);
            const faceData = await this.faceDetector.detectFaces();
            
            if (faceData.length > 0) {
                this.currentFaceDescriptor = faceData[0].descriptor;
                this.showNotification('Face captured successfully!', 'success');
                return canvas.toDataURL();
            } else {
                this.showNotification('No face detected. Please try again.', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error capturing face:', error);
            this.showNotification('Error capturing face', 'error');
            return null;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = this.elements.usernameInput.value.trim();
        const email = this.elements.emailInput.value.trim();
        
        if (!username || !email) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        if (!this.currentFaceDescriptor) {
            this.showNotification('Please capture your face first', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.find(user => user.username === username || user.email === email)) {
            this.showNotification('User already exists', 'error');
            return;
        }

        // Register user
        const newUser = {
            id: Date.now(),
            username,
            email,
            faceDescriptor: this.currentFaceDescriptor,
            registeredAt: new Date().toISOString(),
            profilePicture: this.elements.canvas.toDataURL()
        };

        this.users.push(newUser);
        this.faceDescriptors[username] = this.currentFaceDescriptor;
        this.saveUsers();
        this.saveFaceDescriptors();

        this.showNotification('Registration successful!', 'success');
        setTimeout(() => this.showView('login'), 2000);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = this.elements.loginUsernameInput.value.trim();
        
        if (!username) {
            this.showNotification('Please enter username', 'error');
            return;
        }

        // Find user
        const user = this.users.find(u => u.username === username);
        if (!user) {
            this.showNotification('User not found', 'error');
            return;
        }

        if (!this.currentFaceDescriptor) {
            this.showNotification('Please capture your face first', 'error');
            return;
        }

        // Compare face descriptors
        const storedDescriptor = this.faceDescriptors[username];
        const isMatch = this.faceDetector.compareFaces(this.currentFaceDescriptor, storedDescriptor);

        if (isMatch) {
            this.currentUser = user;
            this.recordLoginAttempt(username, true);
            this.showNotification('Face recognition successful!', 'success');
            
            // Send OTP
            setTimeout(() => {
                this.sendOTP(user.email);
                this.showOTPModal();
            }, 1500);
        } else {
            this.recordLoginAttempt(username, false);
            this.showNotification('Face recognition failed', 'error');
        }
    }

    handleAdminLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            this.showNotification('Admin login successful', 'success');
            setTimeout(() => this.showAdminDashboard(), 1000);
        } else {
            this.showNotification('Invalid admin credentials', 'error');
        }
    }

    sendOTP(email) {
        this.currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`OTP sent to ${email}: ${this.currentOTP}`); // In real app, send via email service
        this.showNotification(`OTP sent to ${email}`, 'info');
    }

    showOTPModal() {
        this.elements.otpModal.style.display = 'flex';
        this.elements.otpInputs[0].focus();
    }

    hideOTPModal() {
        this.elements.otpModal.style.display = 'none';
        this.elements.otpInputs.forEach(input => input.value = '');
    }

    handleOTPInput(e, index) {
        const value = e.target.value;
        if (value.length === 1 && index < this.elements.otpInputs.length - 1) {
            this.elements.otpInputs[index + 1].focus();
        }
    }

    handleOTPKeydown(e, index) {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            this.elements.otpInputs[index - 1].focus();
        }
    }

    verifyOTP() {
        const enteredOTP = Array.from(this.elements.otpInputs)
            .map(input => input.value)
            .join('');
        
        if (enteredOTP === this.currentOTP) {
            this.isAuthenticated = true;
            this.hideOTPModal();
            this.showNotification('Login successful!', 'success');
            setTimeout(() => this.showDashboard(), 1000);
        } else {
            this.showNotification('Invalid OTP', 'error');
        }
    }

    resendOTP() {
        if (this.currentUser) {
            this.sendOTP(this.currentUser.email);
        }
    }

    showDashboard() {
        this.showView('dashboard');
        this.updateDashboard();
    }

    updateDashboard() {
        if (!this.currentUser) return;

        // Update greeting
        this.elements.userGreeting.textContent = `Welcome back, ${this.currentUser.username}!`;
        
        // Update profile picture
        if (this.currentUser.profilePicture) {
            this.elements.userProfilePic.src = this.currentUser.profilePicture;
        }
        
        // Update current time
        this.updateCurrentTime();
        
        // Update login time
        const loginTime = new Date().toLocaleString();
        const loginTimeElement = document.getElementById('loginTime');
        if (loginTimeElement) {
            loginTimeElement.textContent = `Last login: ${loginTime}`;
        }
    }

    showAdminDashboard() {
        this.showView('admin');
        this.updateAdminDashboard();
    }

    updateAdminDashboard() {
        // Update statistics
        this.elements.totalUsersCount.textContent = this.users.length;
        this.elements.activeSessionsCount.textContent = this.isAuthenticated ? '1' : '0';
        
        const today = new Date().toDateString();
        const todayLogins = this.loginAttempts.filter(attempt => 
            new Date(attempt.timestamp).toDateString() === today && attempt.success
        ).length;
        this.elements.todayLoginsCount.textContent = todayLogins;
        
        // Update users list
        this.updateUsersList();
        
        // Update login history
        this.updateLoginHistory();
    }

    updateUsersList() {
        this.elements.usersList.innerHTML = '';
        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <img src="${user.profilePicture || '/api/placeholder/40/40'}" alt="${user.username}" class="user-avatar">
                    <div>
                        <div class="user-name">${user.username}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                <div class="user-status">
                    <span class="status-badge ${this.currentUser?.id === user.id ? 'active' : 'inactive'}">
                        ${this.currentUser?.id === user.id ? 'Active' : 'Inactive'}
                    </span>
                </div>
            `;
            this.elements.usersList.appendChild(userItem);
        });
    }

    updateLoginHistory() {
        this.elements.loginHistoryList.innerHTML = '';
        const recentAttempts = this.loginAttempts.slice(-10).reverse();
        
        recentAttempts.forEach(attempt => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-username">${attempt.username}</div>
                    <div class="history-timestamp">${new Date(attempt.timestamp).toLocaleString()}</div>
                </div>
                <div class="history-status">
                    <span class="status-badge ${attempt.success ? 'success' : 'failed'}">
                        ${attempt.success ? 'Success' : 'Failed'}
                    </span>
                </div>
            `;
            this.elements.loginHistoryList.appendChild(historyItem);
        });
    }

    updateCurrentTime() {
        if (this.elements.currentTimeDisplay) {
            const now = new Date();
            this.elements.currentTimeDisplay.textContent = now.toLocaleString();
        }
    }

    recordLoginAttempt(username, success) {
        const attempt = {
            username,
            success,
            timestamp: new Date().toISOString()
        };
        this.loginAttempts.push(attempt);
        this.saveLoginAttempts();
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.currentFaceDescriptor = null;
        this.currentOTP = null;
        
        // Stop camera if active
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        
        this.showNotification('Logged out successfully', 'info');
        this.showView('login');
    }

    showAdminLogin() {
        this.showView('adminLogin');
    }

    switchTab(tabType) {
        if (tabType === 'face') {
            this.elements.faceRecognitionTab.classList.add('active');
            this.elements.emailPasswordTab.classList.remove('active');
            document.querySelector('.face-recognition-section').style.display = 'block';
            document.querySelector('.email-login-section').style.display = 'none';
        } else {
            this.elements.emailPasswordTab.classList.add('active');
            this.elements.faceRecognitionTab.classList.remove('active');
            document.querySelector('.face-recognition-section').style.display = 'none';
            document.querySelector('.email-login-section').style.display = 'block';
        }
    }

    showView(viewName) {
        // Hide all views
        ['registrationView', 'loginView', 'dashboardView', 'adminDashboardView', 'adminLoginView'].forEach(view => {
            if (this.elements[view]) {
                this.elements[view].style.display = 'none';
            }
        });

        // Show selected view
        const viewMap = {
            'register': 'registrationView',
            'login': 'loginView',
            'dashboard': 'dashboardView',
            'admin': 'adminDashboardView',
            'adminLogin': 'adminLoginView'
        };

        const targetView = viewMap[viewName];
        if (targetView && this.elements[targetView]) {
            this.elements[targetView].style.display = 'block';
        }

        this.currentMode = viewName;
    }

    showCurrentView() {
        // Start with login view by default
        this.showView('login');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Data persistence methods
    saveUsers() {
        localStorage.setItem('faceAuth_users', JSON.stringify(this.users));
    }

    loadUsers() {
        const saved = localStorage.getItem('faceAuth_users');
        return saved ? JSON.parse(saved) : [];
    }

    saveFaceDescriptors() {
        localStorage.setItem('faceAuth_descriptors', JSON.stringify(this.faceDescriptors));
    }

    loadFaceDescriptors() {
        const saved = localStorage.getItem('faceAuth_descriptors');
        return saved ? JSON.parse(saved) : {};
    }

    saveLoginAttempts() {
        localStorage.setItem('faceAuth_attempts', JSON.stringify(this.loginAttempts));
    }

    loadLoginAttempts() {
        const saved = localStorage.getItem('faceAuth_attempts');
        return saved ? JSON.parse(saved) : [];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.faceAuthApp = new FaceAuthApp();
});

// Additional utility functions for enhanced features

// Biometric security enhancements
class BiometricSecurity {
    static generateSecurityHash(descriptor) {
        // In real implementation, use proper cryptographic hashing
        return btoa(JSON.stringify(descriptor)).slice(0, 16);
    }

    static validateFaceQuality(imageData) {
        // Mock face quality validation
        return Math.random() > 0.2; // 80% pass rate for demo
    }

    static detectLiveness() {
        // Mock liveness detection
        return new Promise((resolve) => {
            setTimeout(() => resolve(Math.random() > 0.1), 1000); // 90% pass rate
        });
    }
}

// Real-time face tracking for enhanced security
class FaceTracker {
    constructor(videoElement) {
        this.video = videoElement;
        this.isTracking = false;
        this.trackingHistory = [];
    }

    startTracking() {
        this.isTracking = true;
        this.track();
    }

    stopTracking() {
        this.isTracking = false;
    }

    track() {
        if (!this.isTracking) return;

        // Mock face tracking
        const mockFacePosition = {
            x: Math.random() * 100,
            y: Math.random() * 100,
            confidence: Math.random(),
            timestamp: Date.now()
        };

        this.trackingHistory.push(mockFacePosition);
        
        // Keep only last 10 positions
        if (this.trackingHistory.length > 10) {
            this.trackingHistory.shift();
        }

        // Continue tracking
        requestAnimationFrame(() => this.track());
    }

    getStabilityScore() {
        if (this.trackingHistory.length < 5) return 0;
        
        // Calculate movement variance
        const movements = this.trackingHistory.slice(1).map((pos, i) => {
            const prev = this.trackingHistory[i];
            return Math.sqrt(Math.pow(pos.x - prev.x, 2) + Math.pow(pos.y - prev.y, 2));
        });
        
        const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;
        return Math.max(0, 1 - avgMovement / 50); // Normalize to 0-1
    }
}

// Enhanced email service simulation
class EmailService {
    static async sendOTP(email, otp) {
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`
        📧 Email sent to: ${email}
        Subject: Your SecureAuth OTP Code
        
        Your verification code is: ${otp}
        
        This code will expire in 5 minutes.
        
        If you didn't request this, please ignore this email.
        `);
        
        return { success: true, messageId: 'msg_' + Date.now() };
    }

    static async sendLoginNotification(email, username, timestamp, ipAddress) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`
        🔔 Security Alert sent to: ${email}
        Subject: New login to your SecureAuth account
        
        Hello ${username},
        
        We detected a new login to your account:
        Time: ${timestamp}
        IP Address: ${ipAddress}
        Device: Web Browser
        
        If this wasn't you, please contact support immediately.
        `);
        
        return { success: true };
    }
}

// Advanced analytics and reporting
class AnalyticsService {
    static trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };
        
        console.log('📊 Analytics Event:', event);
        
        // In real implementation, send to analytics service
        this.saveToLocalAnalytics(event);
    }

    static saveToLocalAnalytics(event) {
        const analytics = JSON.parse(localStorage.getItem('faceAuth_analytics') || '[]');
        analytics.push(event);
        
        // Keep only last 1000 events
        if (analytics.length > 1000) {
            analytics.splice(0, analytics.length - 1000);
        }
        
        localStorage.setItem('faceAuth_analytics', JSON.stringify(analytics));
    }

    static getAnalyticsData() {
        return JSON.parse(localStorage.getItem('faceAuth_analytics') || '[]');
    }

    static generateReport() {
        const data = this.getAnalyticsData();
        const last30Days = data.filter(event => {
            const eventDate = new Date(event.properties.timestamp);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return eventDate > thirtyDaysAgo;
        });

        const report = {
            totalEvents: data.length,
            last30DaysEvents: last30Days.length,
            eventsByType: {},
            topEvents: []
        };

        // Group by event type
        last30Days.forEach(event => {
            report.eventsByType[event.name] = (report.eventsByType[event.name] || 0) + 1;
        });

        // Get top events
        report.topEvents = Object.entries(report.eventsByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return report;
    }
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FaceAuthApp,
        BiometricSecurity,
        FaceTracker,
        EmailService,
        AnalyticsService
    };
}