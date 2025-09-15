// Face Recognition Authentication System
class FaceAuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('faceAuthUsers')) || [];
        this.currentUser = null;
        this.videoStream = null;
        this.isCapturing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.displayUsers();
    }

    initializeElements() {
        // Tab elements
        this.tabs = document.querySelectorAll('.tab');
        this.sections = document.querySelectorAll('.form-section');
        
        // Registration elements
        this.usernameInput = document.getElementById('username');
        this.emailInput = document.getElementById('email');
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.faceCircle = document.getElementById('faceCircle');
        this.instructionText = document.getElementById('instructionText');
        this.startCameraBtn = document.getElementById('startCameraBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.registerStatus = document.getElementById('registerStatus');
        
        // Login elements
        this.loginVideo = document.getElementById('loginVideo');
        this.loginCanvas = document.getElementById('loginCanvas');
        this.loginFaceCircle = document.getElementById('loginFaceCircle');
        this.loginInstructionText = document.getElementById('loginInstructionText');
        this.startLoginBtn = document.getElementById('startLoginBtn');
        this.loginCaptureBtn = document.getElementById('loginCaptureBtn');
        this.loginRetakeBtn = document.getElementById('loginRetakeBtn');
        this.loginStatus = document.getElementById('loginStatus');
        this.usersList = document.getElementById('usersList');
        
        // Dashboard elements
        this.loggedInUser = document.getElementById('loggedInUser');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    bindEvents() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Registration events
        this.startCameraBtn.addEventListener('click', () => this.startCamera('register'));
        this.captureBtn.addEventListener('click', () => this.captureImage('register'));
        this.registerBtn.addEventListener('click', () => this.registerUser());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto('register'));

        // Login events
        this.startLoginBtn.addEventListener('click', () => this.startCamera('login'));
        this.loginCaptureBtn.addEventListener('click', () => this.captureImage('login'));
        this.loginRetakeBtn.addEventListener('click', () => this.retakePhoto('login'));

        // Dashboard events
        this.logoutBtn.addEventListener('click', () => this.logout());
    }

    switchTab(tabName) {
        // Update tab active state
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update section visibility
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        if (tabName === 'register') {
            document.getElementById('register-section').classList.add('active');
            this.resetRegistrationForm();
        } else if (tabName === 'login') {
            document.getElementById('login-section').classList.add('active');
            this.resetLoginForm();
        }

        // Stop any active video streams
        this.stopCamera();
    }

    async startCamera(mode) {
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 300, 
                    height: 300,
                    facingMode: 'user'
                } 
            });

            if (mode === 'register') {
                this.video.srcObject = this.videoStream;
                this.video.classList.remove('hidden');
                this.faceCircle.classList.add('active');
                this.startCameraBtn.classList.add('hidden');
                this.captureBtn.classList.remove('hidden');
                this.instructionText.textContent = 'Look directly at the camera and click Capture';
            } else {
                this.loginVideo.srcObject = this.videoStream;
                this.loginVideo.classList.remove('hidden');
                this.loginFaceCircle.classList.add('active');
                this.startLoginBtn.classList.add('hidden');
                this.loginCaptureBtn.classList.remove('hidden');
                this.loginInstructionText.textContent = 'Look directly at the camera and click Scan';
            }

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showStatus(mode === 'register' ? 'registerStatus' : 'loginStatus', 
                          'Camera access denied. Please allow camera permissions.', 'error');
        }
    }

    captureImage(mode) {
        const video = mode === 'register' ? this.video : this.loginVideo;
        const canvas = mode === 'register' ? this.canvas : this.loginCanvas;
        const circle = mode === 'register' ? this.faceCircle : this.loginFaceCircle;
        
        const context = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (mode === 'register') {
            this.capturedImageData = imageData;
            this.video.classList.add('hidden');
            this.canvas.classList.remove('hidden');
            this.faceCircle.classList.add('success');
            this.captureBtn.classList.add('hidden');
            this.registerBtn.classList.remove('hidden');
            this.retakeBtn.classList.remove('hidden');
            this.instructionText.textContent = 'Face captured! Click Register to save.';
        } else {
            this.performFaceLogin(imageData);
        }
        
        circle.classList.add('success-animation');
        setTimeout(() => circle.classList.remove('success-animation'), 600);
        
        this.stopCamera();
    }

    retakePhoto(mode) {
        if (mode === 'register') {
            this.canvas.classList.add('hidden');
            this.faceCircle.classList.remove('success', 'active');
            this.registerBtn.classList.add('hidden');
            this.retakeBtn.classList.add('hidden');
            this.startCameraBtn.classList.remove('hidden');
            this.instructionText.textContent = 'Position your face in the camera';
            this.capturedImageData = null;
        } else {
            this.loginCanvas.classList.add('hidden');
            this.loginFaceCircle.classList.remove('success', 'active', 'scanning');
            this.loginCaptureBtn.classList.add('hidden');
            this.loginRetakeBtn.classList.add('hidden');
            this.startLoginBtn.classList.remove('hidden');
            this.loginInstructionText.textContent = 'Position your face in the camera to login';
        }
        
        this.hideStatus(mode === 'register' ? 'registerStatus' : 'loginStatus');
    }

    async registerUser() {
        const username = this.usernameInput.value.trim();
        const email = this.emailInput.value.trim();
        
        if (!username || !email) {
            this.showStatus('registerStatus', 'Please fill in all fields.', 'error');
            return;
        }
        
        if (!this.capturedImageData) {
            this.showStatus('registerStatus', 'Please capture your face first.', 'error');
            return;
        }
        
        // Check if user already exists
        if (this.users.find(user => user.email === email || user.username === username)) {
            this.showStatus('registerStatus', 'User with this email or username already exists.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            faceData: this.capturedImageData,
            registeredAt: new Date().toISOString()
        };
        
        // Add to users array
        this.users.push(newUser);
        
        // Save to localStorage
        localStorage.setItem('faceAuthUsers', JSON.stringify(this.users));
        
        // Show success message
        this.showStatus('registerStatus', `Registration successful! Welcome, ${username}!`, 'success');
        
        // Reset form
        setTimeout(() => {
            this.resetRegistrationForm();
            this.displayUsers();
            this.switchTab('login');
        }, 2000);
    }

    performFaceLogin(capturedImage) {
        this.loginFaceCircle.classList.add('scanning');
        this.loginInstructionText.textContent = 'Analyzing face...';
        
        // Show scanning status
        this.showStatus('loginStatus', 'Scanning face for recognition...', 'info');
        
        // Simulate face recognition processing
        setTimeout(() => {
            const matchedUser = this.findMatchingFace(capturedImage);
            
            if (matchedUser) {
                this.loginSuccess(matchedUser);
            } else {
                this.loginFailed();
            }
        }, 2000);
    }

    findMatchingFace(capturedImage) {
        // In a real application, this would use actual face recognition algorithms
        // For demo purposes, we'll simulate matching by comparing image data similarity
        
        for (let user of this.users) {
            // Simple similarity check - in reality, you'd use proper face recognition
            const similarity = this.calculateImageSimilarity(capturedImage, user.faceData);
            if (similarity > 0.7) { // 70% similarity threshold
                return user;
            }
        }
        return null;
    }

    calculateImageSimilarity(img1, img2) {
        // This is a very basic similarity calculation for demo purposes
        // Real face recognition would use sophisticated algorithms
        return Math.random() > 0.3 ? Math.random() : 0; // Simulated matching
    }

    loginSuccess(user) {
        this.currentUser = user;
        this.loginFaceCircle.classList.remove('scanning');
        this.loginFaceCircle.classList.add('success');
        
        this.showStatus('loginStatus', `Welcome back, ${user.username}!`, 'success');
        
        setTimeout(() => {
            this.showDashboard();
        }, 1500);
    }

    loginFailed() {
        this.loginFaceCircle.classList.remove('scanning');
        this.showStatus('loginStatus', 'Face not recognized. Please try again or register first.', 'error');
        
        this.loginCanvas.classList.add('hidden');
        this.loginCaptureBtn.classList.add('hidden');
        this.loginRetakeBtn.classList.remove('hidden');
        this.loginInstructionText.textContent = 'Face not recognized';
    }

    showDashboard() {
        // Hide all sections
        this.sections.forEach(section => section.classList.remove('active'));
        
        // Show dashboard
        document.getElementById('dashboard-section').classList.add('active');
        this.loggedInUser.textContent = `${this.currentUser.username} (${this.currentUser.email})`;
        
        // Hide tabs
        document.querySelector('.tab-container').style.display = 'none';
    }

    logout() {
        this.currentUser = null;
        document.querySelector('.tab-container').style.display = 'flex';
        this.switchTab('login');
        this.resetLoginForm();
    }

    displayUsers() {
        this.usersList.innerHTML = '';
        
        if (this.users.length === 0) {
            this.usersList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">No users registered yet</div>';
            return;
        }
        
        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <div class="user-name">${user.username}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                <button class="delete-btn" onclick="faceAuth.deleteUser(${user.id})">Delete</button>
            `;
            this.usersList.appendChild(userItem);
        });
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(user => user.id !== userId);
            localStorage.setItem('faceAuthUsers', JSON.stringify(this.users));
            this.displayUsers();
            this.showStatus('loginStatus', 'User deleted successfully.', 'info');
            setTimeout(() => this.hideStatus('loginStatus'), 3000);
        }
    }

    resetRegistrationForm() {
        this.usernameInput.value = '';
        this.emailInput.value = '';
        this.capturedImageData = null;
        
        this.video.classList.add('hidden');
        this.canvas.classList.add('hidden');
        this.faceCircle.classList.remove('success', 'active');
        
        this.startCameraBtn.classList.remove('hidden');
        this.captureBtn.classList.add('hidden');
        this.registerBtn.classList.add('hidden');
        this.retakeBtn.classList.add('hidden');
        
        this.instructionText.textContent = 'Position your face in the camera';
        this.hideStatus('registerStatus');
        
        this.stopCamera();
    }

    resetLoginForm() {
        this.loginVideo.classList.add('hidden');
        this.loginCanvas.classList.add('hidden');
        this.loginFaceCircle.classList.remove('success', 'active', 'scanning');
        
        this.startLoginBtn.classList.remove('hidden');
        this.loginCaptureBtn.classList.add('hidden');
        this.loginRetakeBtn.classList.add('hidden');
        
        this.loginInstructionText.textContent = 'Position your face in the camera to login';
        this.hideStatus('loginStatus');
        
        this.stopCamera();
    }

    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }

    showStatus(elementId, message, type) {
        const statusElement = document.getElementById(elementId);
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.classList.remove('hidden');
    }

    hideStatus(elementId) {
        const statusElement = document.getElementById(elementId);
        statusElement.classList.add('hidden');
    }
}

// Initialize the face authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.faceAuth = new FaceAuthSystem();
});

// Handle page visibility change to stop camera when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.faceAuth) {
        window.faceAuth.stopCamera();
    }
});

// Handle page unload to clean up resources
window.addEventListener('beforeunload', () => {
    if (window.faceAuth) {
        window.faceAuth.stopCamera();
    }
});