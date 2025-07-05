// app.js
// Naturopathy Clinic Management System - JavaScript Implementation

// Global State
const state = {
  isAuthenticated: localStorage.getItem('isLoggedIn') === 'true',
  currentPage: 'dashboard',
  darkMode: localStorage.getItem('darkMode') === 'true',
  notifications: [
    { id: 1, title: 'New Appointment', message: 'Michael Johnson - Today at 10:30 AM', read: false },
    { id: 2, title: 'Test Results Ready', message: 'Sarah Roberts - Blood Panel', read: false },
    { id: 3, title: 'Follow-up Required', message: 'David Peterson - Herbal Therapy', read: true }
  ],
  patients: [
    { id: 1, name: 'Michael Johnson', dob: '1985-03-15', gender: 'Male', phone: '555-123-4567', email: 'michael@example.com' },
    { id: 2, name: 'Sarah Roberts', dob: '1990-07-22', gender: 'Female', phone: '555-987-6543', email: 'sarah@example.com' },
    { id: 3, name: 'David Peterson', dob: '1978-11-05', gender: 'Male', phone: '555-456-7890', email: 'david@example.com' },
    { id: 4, name: 'Emma Chen', dob: '1995-01-30', gender: 'Female', phone: '555-234-5678', email: 'emma@example.com' },
    { id: 5, name: 'Thomas Wilson', dob: '1982-09-18', gender: 'Male', phone: '555-876-5432', email: 'thomas@example.com' }
  ]
};

// DOM Elements
const domElements = {
  loginPage: document.getElementById('loginPage'),
  appContainer: document.getElementById('appContainer'),
  darkModeToggle: document.getElementById('darkModeToggle'),
  notificationBadge: document.querySelector('.notification-badge'),
  notificationDropdown: document.getElementById('notificationDropdown'),
  notificationList: document.getElementById('notificationList'),
  mainContent: document.getElementById('mainContent'),
  navLinks: document.querySelectorAll('.main-nav a'),
  mobileToggle: document.querySelector('.mobile-toggle'),
  mainNav: document.querySelector('.main-nav'),
  modalContainer: document.getElementById('modalContainer'),
  modalContent: document.getElementById('modalContent'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose'),
  modalForm: document.getElementById('modalForm'),
  modalFooter: document.getElementById('modalFooter')
};

// Initialize Application
function initApp() {
  // Set authentication state
  if (state.isAuthenticated) {
    domElements.loginPage.style.display = 'none';
    domElements.appContainer.style.display = 'block';
  } else {
    domElements.loginPage.style.display = 'flex';
    domElements.appContainer.style.display = 'none';
  }

  // Apply dark mode
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    domElements.darkModeToggle.querySelector('i').classList.remove('fa-moon');
    domElements.darkModeToggle.querySelector('i').classList.add('fa-sun');
  }

  // Update notification badge
  updateNotificationBadge();

  // Load current page
  loadPage(state.currentPage);

  // Add event listeners
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Login button
  document.querySelector('.login-btn')?.addEventListener('click', login);
  
  // Navigation links
  domElements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage(link.dataset.page);
    });
  });
  
  // Mobile menu toggle
  domElements.mobileToggle?.addEventListener('click', toggleMobileMenu);
  
  // Dark mode toggle
  domElements.darkModeToggle?.addEventListener('click', toggleDarkMode);
  
  // Notification dropdown
  document.querySelector('.nav-icons button:nth-child(2)')?.addEventListener('click', toggleNotifications);
  
  // Modal close button
  domElements.modalClose?.addEventListener('click', closeModal);
  
  // New appointment button
  document.querySelector('.page-title .btn')?.addEventListener('click', () => {
    openModal('New Appointment', createAppointmentForm());
  });
  
  // User profile dropdown
  document.querySelector('.user-profile')?.addEventListener('click', toggleUserMenu);
  
  // Add patient form submit
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'patientForm') {
      e.preventDefault();
      handlePatientFormSubmit(e.target);
    }
  });
  
  // Listen for clicks outside notification dropdown to close it
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-dropdown') && 
        !e.target.closest('.nav-icons button:nth-child(2)')) {
      closeNotifications();
    }
    
    if (!e.target.closest('.user-menu') && 
        !e.target.closest('.user-profile')) {
      closeUserMenu();
    }
  });
}

// Authentication functions
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember').checked;
  
  if (email && password) {
    // Simple validation - in production this would be an API call
    state.isAuthenticated = true;
    localStorage.setItem('isLoggedIn', 'true');
    
    if (remember) {
      // Store credentials (in production this would be a token)
      localStorage.setItem('userEmail', email);
    } else {
      localStorage.removeItem('userEmail');
    }
    
    // Show main app
    domElements.loginPage.style.display = 'none';
    domElements.appContainer.style.display = 'block';
    
    // Load dashboard
    navigateToPage('dashboard');
  } else {
    alert('Please enter both email and password');
  }
}

function logout() {
  state.isAuthenticated = false;
  localStorage.removeItem('isLoggedIn');
  domElements.loginPage.style.display = 'flex';
  domElements.appContainer.style.display = 'none';
  
  // Reset form
  document.getElementById('email').value = localStorage.getItem('userEmail') || '';
  document.getElementById('password').value = '';
}

// Navigation functions
function navigateToPage(page) {
  state.currentPage = page;
  
  // Update active nav link
  domElements.navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  
  // Load page content
  loadPage(page);
}

function loadPage(page) {
  let content = '';
  
  switch(page) {
    case 'dashboard':
      content = getDashboardContent();
      break;
    case 'patients':
      content = getPatientsContent();
      break;
    case 'visits':
      content = getVisitsContent();
      break;
    case 'tests':
      content = getTestsContent();
      break;
    case 'receipts':
      content = getReceiptsContent();
      break;
    case 'settings':
      content = getSettingsContent();
      break;
    default:
      content = getDashboardContent();
  }
  
  domElements.mainContent.innerHTML = content;
  
  // Reattach event listeners specific to each page
  if (page === 'patients') {
    document.getElementById('newPatientBtn')?.addEventListener('click', () => {
      openModal('Add New Patient', createPatientForm());
    });
    
    document.querySelectorAll('.patient-row').forEach(row => {
      row.addEventListener('click', () => {
        const patientId = row.dataset.id;
        openModal('Patient Details', getPatientDetails(patientId));
      });
    });
  }
}

// UI Interaction Functions
function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark-mode');
  
  const icon = domElements.darkModeToggle.querySelector('i');
  if (state.darkMode) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    localStorage.setItem('darkMode', 'true');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    localStorage.setItem('darkMode', 'false');
  }
}

function toggleMobileMenu() {
  domElements.mainNav.style.display = 
    domElements.mainNav.style.display === 'flex' ? 'none' : 'flex';
}

function toggleNotifications() {
  const isOpen = domElements.notificationDropdown.style.display === 'block';
  
  if (!isOpen) {
    // Mark notifications as read when opened
    state.notifications.forEach(notif => notif.read = true);
    updateNotificationBadge();
    
    // Render notifications
    domElements.notificationList.innerHTML = state.notifications.map(notif => `
      <li class="${notif.read ? 'read' : 'unread'}">
        <div class="notification-title">${notif.title}</div>
        <div class="notification-message">${notif.message}</div>
        <div class="notification-time">Just now</div>
      </li>
    `).join('');
  }
  
  domElements.notificationDropdown.style.display = isOpen ? 'none' : 'block';
}

function closeNotifications() {
  domElements.notificationDropdown.style.display = 'none';
}

function updateNotificationBadge() {
  const unreadCount = state.notifications.filter(notif => !notif.read).length;
  domElements.notificationBadge.textContent = unreadCount > 0 ? unreadCount : '';
  domElements.notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

function toggleUserMenu() {
  const userMenu = document.querySelector('.user-menu');
  if (!userMenu) {
    createUserMenu();
  } else {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
  }
}

function closeUserMenu() {
  const userMenu = document.querySelector('.user-menu');
  if (userMenu) {
    userMenu.style.display = 'none';
  }
}

function createUserMenu() {
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.innerHTML = `
    <ul>
      <li><a href="#"><i class="fas fa-user"></i> My Profile</a></li>
      <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li>
      <li><a href="#"><i class="fas fa-question-circle"></i> Help</a></li>
      <li><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    </ul>
  `;
  
  document.querySelector('.user-profile').appendChild(userMenu);
  
  // Add logout event
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Modal Functions
function openModal(title, content, formId = null) {
  domElements.modalTitle.textContent = title;
  domElements.modalBody.innerHTML = content;
  domElements.modalContainer.style.display = 'flex';
  
  if (formId) {
    domElements.modalForm.id = formId;
  }
}

function closeModal() {
  domElements.modalContainer.style.display = 'none';
  domElements.modalForm.id = '';
  domElements.modalFooter.innerHTML = '';
}

// Form Functions
function createPatientForm(patient = null) {
  return `
    <form id="patientForm">
      <div class="form-row">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" required value="${patient?.name?.split(' ')[0] || ''}">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" required value="${patient?.name?.split(' ')[1] || ''}">
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="dob">Date of Birth</label>
          <input type="date" id="dob" required value="${patient?.dob || ''}">
        </div>
        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" required>
            <option value="">Select Gender</option>
            <option value="Male" ${patient?.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${patient?.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" required value="${patient?.phone || ''}">
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" value="${patient?.email || ''}">
      </div>
      
      <div class="form-group">
        <label for="address">Address</label>
        <textarea id="address">${patient?.address || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label for="insurance">Insurance Information</label>
        <input type="text" id="insurance" value="${patient?.insurance || ''}">
      </div>
      
      <div class="form-footer">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">${patient ? 'Update' : 'Add'} Patient</button>
      </div>
    </form>
  `;
}

function handlePatientFormSubmit(form) {
  // Form validation would go here
  const patientData = {
    id: state.patients.length + 1,
    name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    insurance: document.getElementById('insurance').value
  };
  
  // Add to patients array (in production this would be an API call)
  state.patients.push(patientData);
  
  // Close modal and refresh patient list
  closeModal();
  navigateToPage('patients');
}

function createAppointmentForm() {
  return `
    <form id="appointmentForm">
      <div class="form-group">
        <label for="patientSelect">Select Patient</label>
        <select id="patientSelect" required>
          <option value="">Select a patient</option>
          ${state.patients.map(patient => `
            <option value="${patient.id}">${patient.name}</option>
          `).join('')}
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="appointmentDate">Date</label>
          <input type="date" id="appointmentDate" required>
        </div>
        <div class="form-group">
          <label for="appointmentTime">Time</label>
          <input type="time" id="appointmentTime" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="visitType">Visit Type</label>
        <select id="visitType" required>
          <option value="">Select visit type</option>
          <option value="consultation">Initial Consultation</option>
          <option value="follow-up">Follow-up Visit</option>
          <option value="therapy">Therapy Session</option>
          <option value="emergency">Emergency Visit</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="visitNotes">Notes</label>
        <textarea id="visitNotes" rows="4"></textarea>
      </div>
      
      <div class="form-footer">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Schedule Appointment</button>
      </div>
    </form>
  `;
}

// Page Content Generators
function getDashboardContent() {
  return `
    <div class="breadcrumb">
      <a href="#">Home</a>
      <i class="fas fa-chevron-right"></i>
      <span>Dashboard</span>
    </div>
    
    <div class="page-title">
      <h2>Dashboard</h2>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i> New Appointment
      </button>
    </div>
    
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-user-injured"></i>
        </div>
        <div class="card-value">${state.patients.length}</div>
        <div class="card-label">Total Patients</div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="card-value">8</div>
        <div class="card-label">Upcoming Visits</div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-vial"></i>
        </div>
        <div class="card-value">5</div>
        <div class="card-label">Pending Tests</div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="card-value">$8,420</div>
        <div class="card-label">Monthly Revenue</div>
      </div>
    </div>
    
    <div class="charts-container">
      <div class="chart-card">
        <h3>Patient Visits (Last 6 Months)</h3>
        <div class="chart-placeholder">
          <i class="fas fa-chart-line fa-3x"></i>
          <span style="margin-left: 15px;">Visits Over Time Chart</span>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>Symptom Analysis</h3>
        <div class="chart-placeholder">
          <i class="fas fa-chart-pie fa-3x"></i>
          <span style="margin-left: 15px;">Symptoms Distribution Chart</span>
        </div>
      </div>
    </div>
    
    <div class="recent-appointments">
      <h3>Recent Appointments</h3>
      <ul class="appointment-list">
        <li class="appointment-item">
          <div class="appointment-info">
            <div class="appointment-avatar">MJ</div>
            <div class="appointment-details">
              <h4>Michael Johnson</h4>
              <p>Follow-up Consultation</p>
            </div>
          </div>
          <div class="appointment-time">Today, 10:30 AM</div>
        </li>
        
        <li class="appointment-item">
          <div class="appointment-info">
            <div class="appointment-avatar">SR</div>
            <div class="appointment-details">
              <h4>Sarah Roberts</h4>
              <p>Initial Consultation</p>
            </div>
          </div>
          <div class="appointment-time">Today, 2:15 PM</div>
        </li>
        
        <li class="appointment-item">
          <div class="appointment-info">
            <div class="appointment-avatar">DP</div>
            <div class="appointment-details">
              <h4>David Peterson</h4>
              <p>Herbal Therapy Session</p>
            </div>
          </div>
          <div class="appointment-time">Tomorrow, 9:00 AM</div>
        </li>
        
        <li class="appointment-item">
          <div class="appointment-info">
            <div class="appointment-avatar">EC</div>
            <div class="appointment-details">
              <h4>Emma Chen</h4>
              <p>Nutrition Counseling</p>
            </div>
          </div>
          <div class="appointment-time">Tomorrow, 11:45 AM</div>
        </li>
        
        <li class="appointment-item">
          <div class="appointment-info">
            <div class="appointment-avatar">TW</div>
            <div class="appointment-details">
              <h4>Thomas Wilson</h4>
              <p>Acupuncture Session</p>
            </div>
          </div>
          <div class="appointment-time">Tomorrow, 4:30 PM</div>
        </li>
      </ul>
    </div>
  `;
}

function getPatientsContent() {
  return `
    <div class="breadcrumb">
      <a href="#">Home</a>
      <i class="fas fa-chevron-right"></i>
      <span>Patients</span>
    </div>
    
    <div class="page-title">
      <h2>Patient Management</h2>
      <button class="btn btn-primary" id="newPatientBtn">
        <i class="fas fa-plus"></i> New Patient
      </button>
    </div>
    
    <div class="search-bar" style="margin-bottom: 20px; max-width: 400px;">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Search patients...">
    </div>
    
    <div class="recent-appointments">
      <div class="table-header">
        <h3>Patient List</h3>
        <span>Showing ${state.patients.length} patients</span>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.patients.map(patient => `
            <tr class="patient-row" data-id="${patient.id}">
              <td>${patient.id}</td>
              <td>${patient.name}</td>
              <td>${formatDate(patient.dob)}</td>
              <td>${patient.gender}</td>
              <td>${patient.phone}</td>
              <td class="table-actions">
                <button class="btn-icon" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="table-footer">
        <div>Showing 1 to ${state.patients.length} of ${state.patients.length} entries</div>
        <div class="pagination">
          <button class="btn btn-outline" disabled><i class="fas fa-chevron-left"></i></button>
          <button class="btn btn-primary">1</button>
          <button class="btn btn-outline"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function getPatientDetails(patientId) {
  const patient = state.patients.find(p => p.id == patientId) || {};
  
  return `
    <div class="patient-details">
      <div class="patient-header">
        <div class="patient-avatar">${patient.name?.charAt(0)}</div>
        <div>
          <h3>${patient.name}</h3>
          <p>Patient ID: ${patient.id}</p>
        </div>
      </div>
      
      <div class="tabs">
        <div class="tab-header">
          <button class="tab-btn active">Overview</button>
          <button class="tab-btn">Medical History</button>
          <button class="tab-btn">Visits</button>
          <button class="tab-btn">Tests</button>
        </div>
        
        <div class="tab-content">
          <div class="tab-pane active">
            <div class="info-section">
              <h4>Personal Information</h4>
              <div class="info-grid">
                <div>
                  <label>Date of Birth</label>
                  <p>${formatDate(patient.dob)}</p>
                </div>
                <div>
                  <label>Gender</label>
                  <p>${patient.gender}</p>
                </div>
                <div>
                  <label>Phone</label>
                  <p>${patient.phone}</p>
                </div>
                <div>
                  <label>Email</label>
                  <p>${patient.email || 'N/A'}</p>
                </div>
                <div>
                  <label>Address</label>
                  <p>${patient.address || 'No address provided'}</p>
                </div>
                <div>
                  <label>Insurance</label>
                  <p>${patient.insurance || 'No insurance information'}</p>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h4>Current Symptoms</h4>
              <div class="symptoms-list">
                <div class="symptom-item">
                  <div>
                    <strong>Headache</strong>
                    <span>Severity: Moderate</span>
                  </div>
                  <span>Reported: 2 days ago</span>
                </div>
                <div class="symptom-item">
                  <div>
                    <strong>Fatigue</strong>
                    <span>Severity: Mild</span>
                  </div>
                  <span>Reported: 5 days ago</span>
                </div>
              </div>
              <button class="btn btn-outline" style="margin-top: 10px;">
                <i class="fas fa-plus"></i> Add Symptom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getVisitsContent() {
  return `
    <div class="breadcrumb">
      <a href="#">Home</a>
      <i class="fas fa-chevron-right"></i>
      <span>Visits</span>
    </div>
    
    <div class="page-title">
      <h2>Appointments & Visits</h2>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i> New Appointment
      </button>
    </div>
    
    <div class="charts-container">
      <div class="chart-card">
        <div class="calendar-header">
          <h3>Appointment Calendar</h3>
          <div>
            <button class="btn-icon"><i class="fas fa-chevron-left"></i></button>
            <span>June 2023</span>
            <button class="btn-icon"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="calendar-placeholder">
          <i class="fas fa-calendar-alt fa-3x"></i>
          <span>Interactive Calendar View</span>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>Upcoming Appointments</h3>
        <div class="appointments-list">
          <div class="appointment-item">
            <div class="appointment-info">
              <div class="appointment-avatar">MJ</div>
              <div class="appointment-details">
                <h4>Michael Johnson</h4>
                <p>Follow-up Consultation</p>
              </div>
            </div>
            <div class="appointment-time">Today, 10:30 AM</div>
          </div>
          
          <div class="appointment-item">
            <div class="appointment-info">
              <div class="appointment-avatar">SR</div>
              <div class="appointment-details">
                <h4>Sarah Roberts</h4>
                <p>Initial Consultation</p>
              </div>
            </div>
            <div class="appointment-time">Today, 2:15 PM</div>
          </div>
          
          <div class="appointment-item">
            <div class="appointment-info">
              <div class="appointment-avatar">DP</div>
              <div class="appointment-details">
                <h4>David Peterson</h4>
                <p>Herbal Therapy</p>
              </div>
            </div>
            <div class="appointment-time">Tomorrow, 9:00 AM</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="recent-appointments">
      <h3>Recent Visits</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Patient</th>
            <th>Type</th>
            <th>Practitioner</th>
            <th>Notes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Jun 15, 2023</td>
            <td>Michael Johnson</td>
            <td>Follow-up</td>
            <td>Dr. Sarah Johnson</td>
            <td>Improved symptoms, adjusted herbal regimen</td>
            <td><span class="status-badge completed">Completed</span></td>
          </tr>
          <tr>
            <td>Jun 14, 2023</td>
            <td>Emma Chen</td>
            <td>Nutrition Counseling</td>
            <td>Dr. Robert Green</td>
            <td>Discussed dietary changes for digestion issues</td>
            <td><span class="status-badge completed">Completed</span></td>
          </tr>
          <tr>
            <td>Jun 12, 2023</td>
            <td>Thomas Wilson</td>
            <td>Acupuncture</td>
            <td>Dr. Lisa Wong</td>
            <td>Session for back pain relief</td>
            <td><span class="status-badge completed">Completed</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Expose functions to global scope for HTML onclick attributes
window.openModal = openModal;
window.closeModal = closeModal;
window.login = login;
window.logout = logout;
window.navigateToPage = navigateToPage;
