document.addEventListener('DOMContentLoaded', () => {

    // Auth check on protected pages
    const isProtected = ['dashboard.html', 'users.html', 'reports.html', 'about.html'].some(page => window.location.pathname.includes(page));
    
    if (isProtected) {
        fetch('api/auth.php?action=check')
            .then(res => res.json())
            .then(data => {
                if (data.status !== 'authenticated') {
                    window.location.href = 'index.html';
                } else {
                    document.querySelectorAll('.currentUser').forEach(el => el.textContent = data.name);
                }
            });
    }

    // Login logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            formData.append('action', 'login');
            const data = Object.fromEntries(formData.entries());

            fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                const msg = document.getElementById('loginMessage');
                msg.style.display = 'block';
                if (res.status === 'success') {
                    window.location.href = 'dashboard.html';
                } else {
                    msg.style.background = '#fde8e8';
                    msg.style.color = '#c0392b';
                    msg.textContent = res.message;
                }
            });
        });
    }

    // Signup logic
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);
            formData.append('action', 'signup');
            const data = Object.fromEntries(formData.entries());

            fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                const msg = document.getElementById('signupMessage');
                msg.style.display = 'block';
                if (res.status === 'success') {
                    window.location.href = 'dashboard.html';
                } else {
                    msg.style.background = '#fde8e8';
                    msg.style.color = '#c0392b';
                    msg.textContent = res.message;
                }
            })
            .catch(err => {
                const msg = document.getElementById('signupMessage');
                msg.style.display = 'block';
                msg.style.background = '#fde8e8';
                msg.style.color = '#c0392b';
                msg.textContent = 'A network or server error occurred: ' + err.message;
            });
        });
    }

    // Recovery logic
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(recoveryForm);
            formData.append('action', 'recover');
            const data = Object.fromEntries(formData.entries());

            fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                const msg = document.getElementById('recoveryMessage');
                msg.style.display = 'block';
                if (res.status === 'success') {
                    msg.style.background = '#e8f5e9';
                    msg.style.color = '#27ae60';
                } else {
                    msg.style.background = '#fde8e8';
                    msg.style.color = '#c0392b';
                }
                msg.textContent = res.message;
            });
        });
    }

    // Password toggle logic
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.toggle-password');
        if (toggleBtn) {
            const passwordInput = toggleBtn.parentElement.querySelector('input');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            } else {
                passwordInput.type = 'password';
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            }
        }
    });

    // Logout logic
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('api/auth.php?action=logout')
                .then(() => window.location.href = 'index.html');
        });
    });

    // Users Page Logic
    if (document.getElementById('usersTable')) {
        loadUsers();
    }

    // Students Page Logic
    if (document.getElementById('studentsTable')) {
        loadStudents();
    }

    // Add Student logic
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addStudentForm);
            formData.append('action', 'create');
            const data = Object.fromEntries(formData.entries());

            fetch('api/students.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if(res.status === 'success') {
                    closeModal('addStudentModal');
                    loadStudents();
                    addStudentForm.reset();
                } else {
                    alert(res.message);
                }
            });
        });
    }

    // Edit Student logic
    const editStudentForm = document.getElementById('editStudentForm');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(editStudentForm);
            formData.append('action', 'update');
            const data = Object.fromEntries(formData.entries());

            fetch('api/students.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if(res.status === 'success') {
                    closeModal('editStudentModal');
                    loadStudents();
                } else {
                    alert(res.message);
                }
            });
        });
    }

    // Add User logic
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addUserForm);
            formData.append('action', 'create');
            const data = Object.fromEntries(formData.entries());

            fetch('api/users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if(res.status === 'success') {
                    closeModal('addModal');
                    loadUsers();
                    addUserForm.reset();
                } else {
                    alert(res.message);
                }
            });
        });
    }

    // Edit User logic
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(editUserForm);
            formData.append('action', 'update');
            const data = Object.fromEntries(formData.entries());

            fetch('api/users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if(res.status === 'success') {
                    closeModal('editModal');
                    loadUsers();
                } else {
                    alert(res.message);
                }
            });
        });
    }
    
    // Dashboard Page Logic
    if (document.querySelector('.stat-grid')) {
        fetch('api/dashboard.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update Stats
                    const stats = data.stats;
                    const statValues = document.querySelectorAll('.stat-card .value');
                    if(statValues.length >= 4) {
                        statValues[0].textContent = stats.total_students;
                        statValues[1].textContent = stats.active_courses;
                        statValues[2].textContent = stats.departments;
                        statValues[3].textContent = stats.total_enrollments;
                    }

                    // Update Recent Enrollments Table
                    const tbody = document.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = '';
                        data.recent_enrollments.forEach(enr => {
                            let badge = 'badge-active';
                            if (enr.status === 'Dropped') badge = 'badge-inactive';
                            else if (enr.status === 'Transferred') badge = 'badge-inactive';
                            else if (enr.status === 'Leave of Absence') badge = 'badge-inactive';
                            else if (enr.status !== 'Enrolled') badge = 'badge-inactive';
                            tbody.innerHTML += `
                                <tr>
                                    <td>${escapeHtml(enr.enrollment_code)}</td>
                                    <td>${escapeHtml(enr.student_name)}</td>
                                    <td>${escapeHtml(enr.course_title)}</td>
                                    <td>${escapeHtml(enr.enrollment_date)}</td>
                                    <td><span class="badge ${badge}">${escapeHtml(enr.status)}</span></td>
                                </tr>
                            `;
                        });
                    }
                }
            });
    }

    // Handle Enrollment Form Submit
    const enrollmentForm = document.getElementById('enrollmentForm');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(enrollmentForm);
            formData.append('action', 'enroll');
            const data = Object.fromEntries(formData.entries());

            fetch('api/dashboard.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    closeModal('enrollmentModal');
                    window.location.reload(); // Reload dashboard to see new stats and enrollment
                } else {
                    alert(res.message);
                }
            });
        });
    }

    // ══════════════════════════════════════════════════
    // REPORTS PAGE LOGIC — DataGrid + Excel Export
    // ══════════════════════════════════════════════════
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        // Toggle date fields based on report type
        const reportTypeSelect = document.getElementById('reportType');
        const dateFromGroup = document.getElementById('dateFromGroup');
        const dateToGroup = document.getElementById('dateToGroup');
        
        function toggleDateFields() {
            const show = reportTypeSelect.value === 'Enrollment Summary';
            if (dateFromGroup) dateFromGroup.style.display = show ? 'block' : 'none';
            if (dateToGroup) dateToGroup.style.display = show ? 'block' : 'none';
        }
        toggleDateFields();
        reportTypeSelect.addEventListener('change', toggleDateFields);

        // Generate Report
        document.getElementById('btnGenerateReport').addEventListener('click', (e) => {
            e.preventDefault();
            generateReport();
        });

        // Export to Excel
        document.getElementById('btnExportExcel').addEventListener('click', (e) => {
            e.preventDefault();
            exportToExcel();
        });
    }
});

let currentUsers = [];
let deleteId = null;

function loadUsers() {
    fetch('api/users.php?action=list')
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                currentUsers = res.data;
                renderUsers(currentUsers);
                updateStats(currentUsers);
            }
        });
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: #999;">No records found.</td></tr>`;
        return;
    }

    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        const badgeClass = user.account_status === 'Active' ? 'badge-active' : 'badge-inactive';
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight:600; color:var(--maroon-dark);">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.contact_number) || '<em style="color:#aaa;">None</em>'}</td>
            <td>${escapeHtml(user.address) || '<em style="color:#aaa;">None</em>'}</td>
            <td><span class="badge ${badgeClass}">${user.account_status}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="tbl-action">
                <button class="btn-edit" onclick='openEditModal(${JSON.stringify(user).replace(/'/g, "&apos;")})'>Edit</button>
                <button class="btn-del" onclick="confirmDelete(${user.user_id}, '${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats(users) {
    const active = users.filter(u => u.account_status === 'Active').length;
    const totalEl = document.getElementById('statTotal');
    const activeEl = document.getElementById('statActive');
    const inactiveEl = document.getElementById('statInactive');
    
    if(totalEl) totalEl.textContent = users.length;
    if(activeEl) activeEl.textContent = active;
    if(inactiveEl) inactiveEl.textContent = users.length - active;
}

function filterTable() {
    const input = document.getElementById('searchInput');
    if(!input) return;
    const filter = input.value.toUpperCase();
    const filtered = currentUsers.filter(user => {
        const fullStr = `${user.first_name} ${user.last_name} ${user.email} ${user.contact_number} ${user.address || ''}`.toUpperCase();
        return fullStr.includes(filter);
    });
    renderUsers(filtered);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function openAddModal() {
    const modal = document.getElementById('addModal');
    if(modal) modal.classList.add('open');
}

function openEnrollmentModal() {
    const modal = document.getElementById('enrollmentModal');
    if(modal) {
        modal.classList.add('open');
        // Fetch options
        fetch('api/dashboard.php?action=options')
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    const studentSelect = document.getElementById('enroll_student_id');
                    const courseSelect = document.getElementById('enroll_course_id');
                    
                    studentSelect.innerHTML = '<option value="">Select Student...</option>';
                    data.students.forEach(s => {
                        studentSelect.innerHTML += `<option value="${s.student_id}">${escapeHtml(s.name)}</option>`;
                    });
                    
                    courseSelect.innerHTML = '<option value="">Select Course...</option>';
                    data.courses.forEach(c => {
                        courseSelect.innerHTML += `<option value="${c.course_id}">${escapeHtml(c.title)}</option>`;
                    });
                }
            });
    }
}

function openEditModal(user) {
    document.getElementById('edit_user_id').value = user.user_id;
    document.getElementById('edit_first_name').value = user.first_name;
    document.getElementById('edit_last_name').value = user.last_name;
    document.getElementById('edit_email').value = user.email;
    document.getElementById('edit_contact').value = user.contact_number || '';
    document.getElementById('edit_address').value = user.address || '';
    document.getElementById('edit_status').value = user.account_status;
    const modal = document.getElementById('editModal');
    if(modal) modal.classList.add('open');
}

// Student Management Functions
let currentStudents = [];
let deleteStudentId = null;

function loadStudents() {
    fetch('api/students.php?action=list')
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                currentStudents = res.data;
                renderStudents(currentStudents);
                updateStudentStats(currentStudents);
            }
        });
}

function renderStudents(students) {
    const tbody = document.getElementById('studentsTbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: #999;">No records found.</td></tr>`;
        return;
    }

    students.forEach((student, index) => {
        const tr = document.createElement('tr');
        const badgeClass = student.status === 'Active' ? 'badge-active' : 'badge-inactive';
        
        // Reason badge
        let reasonHtml = '<em style="color:#aaa;">—</em>';
        if (student.status === 'Inactive' && student.inactive_reason) {
            let reasonBadge = 'badge-inactive';
            if (student.inactive_reason === 'Dropped') reasonBadge = 'badge-dropped';
            else if (student.inactive_reason === 'Transferred') reasonBadge = 'badge-transferred';
            else if (student.inactive_reason === 'Leave of Absence') reasonBadge = 'badge-loa';
            reasonHtml = `<span class="badge ${reasonBadge}">${escapeHtml(student.inactive_reason)}</span>`;
        }

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td style="font-weight:600; color:var(--maroon-dark);">${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.contact_number) || '<em style="color:#aaa;">None</em>'}</td>
            <td>${escapeHtml(student.address) || '<em style="color:#aaa;">None</em>'}</td>
            <td><span class="badge ${badgeClass}">${student.status}</span></td>
            <td>${reasonHtml}</td>
            <td class="tbl-action">
                <button class="btn-edit" onclick='openEditStudentModal(${JSON.stringify(student).replace(/'/g, "&apos;")})'>Edit</button>
                <button class="btn-del" onclick="confirmDeleteStudent(${student.student_id}, '${escapeHtml(student.name)}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStudentStats(students) {
    const active = students.filter(s => s.status === 'Active').length;
    const totalEl = document.getElementById('statTotalStudents');
    const activeEl = document.getElementById('statActiveStudents');
    const inactiveEl = document.getElementById('statInactiveStudents');
    
    if(totalEl) totalEl.textContent = students.length;
    if(activeEl) activeEl.textContent = active;
    if(inactiveEl) inactiveEl.textContent = students.length - active;
}

function filterStudentsTable() {
    const input = document.getElementById('studentSearchInput');
    if(!input) return;
    const filter = input.value.toUpperCase();
    const filtered = currentStudents.filter(student => {
        const fullStr = `${student.name} ${student.email} ${student.contact_number} ${student.address || ''}`.toUpperCase();
        return fullStr.includes(filter);
    });
    renderStudents(filtered);
}

function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if(modal) {
        modal.classList.add('open');
        // Reset reason field
        const reasonGroup = document.getElementById('add_reason_group');
        if (reasonGroup) reasonGroup.classList.remove('visible');
        const reasonSelect = document.getElementById('add_inactive_reason');
        if (reasonSelect) reasonSelect.value = '';
        const statusSelect = document.getElementById('add_student_status');
        if (statusSelect) statusSelect.value = 'Active';
    }
}

function openEditStudentModal(student) {
    document.getElementById('edit_student_id').value = student.student_id;
    document.getElementById('edit_student_name').value = student.name;
    document.getElementById('edit_student_email').value = student.email;
    document.getElementById('edit_student_contact').value = student.contact_number || '';
    document.getElementById('edit_student_address').value = student.address || '';
    document.getElementById('edit_student_status').value = student.status;
    
    // Set inactive reason and toggle visibility
    const reasonSelect = document.getElementById('edit_inactive_reason');
    if (reasonSelect) reasonSelect.value = student.inactive_reason || '';
    toggleReasonField('edit');

    const modal = document.getElementById('editStudentModal');
    if(modal) modal.classList.add('open');
}

function confirmDeleteStudent(id, name) {
    deleteStudentId = id;
    const nameEl = document.getElementById('deleteStudentName');
    if(nameEl) nameEl.textContent = name;
    const modal = document.getElementById('deleteStudentModal');
    if(modal) modal.classList.add('open');
}

/**
 * Toggle the inactive reason dropdown visibility based on status selection.
 * @param {string} prefix - 'add' or 'edit' to target the correct modal fields.
 */
function toggleReasonField(prefix) {
    const statusSelect = document.getElementById(`${prefix}_student_status`);
    const reasonGroup = document.getElementById(`${prefix}_reason_group`);
    const reasonSelect = document.getElementById(`${prefix}_inactive_reason`);
    
    if (!statusSelect || !reasonGroup) return;

    if (statusSelect.value === 'Inactive') {
        reasonGroup.classList.add('visible');
        if (reasonSelect) reasonSelect.setAttribute('required', 'required');
    } else {
        reasonGroup.classList.remove('visible');
        if (reasonSelect) {
            reasonSelect.removeAttribute('required');
            reasonSelect.value = '';
        }
    }
}

document.addEventListener('click', e => {
    if (e.target && e.target.id === 'btnConfirmDeleteStudent') {
        if (deleteStudentId) {
            fetch('api/students.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: deleteStudentId })
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    closeModal('deleteStudentModal');
                    loadStudents();
                }
            });
        }
    }
});

function confirmDelete(id, name) {
    deleteId = id;
    const nameEl = document.getElementById('deleteUserName');
    if(nameEl) nameEl.textContent = name;
    const modal = document.getElementById('deleteModal');
    if(modal) modal.classList.add('open');
}

document.addEventListener('click', e => {
    if (e.target && e.target.id === 'btnConfirmDelete') {
        if (deleteId) {
            fetch('api/users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: deleteId })
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    closeModal('deleteModal');
                    loadUsers();
                }
            });
        }
    }
});

function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.remove('open');
    }
}

// ══════════════════════════════════════════════════════════════════
//  REPORT MODULE — Generate, DataGrid, Filter, Excel Export
// ══════════════════════════════════════════════════════════════════

let currentReportData = null;  // Stores the full report response
let filteredReportRows = [];   // Stores currently filtered rows

/**
 * Generate Report — Fetch data from API and render DataGrid
 */
function generateReport() {
    const type = document.getElementById('reportType').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    const loading = document.getElementById('reportLoading');
    const container = document.getElementById('datagridContainer');
    const exportBtn = document.getElementById('btnExportExcel');

    // Show loading, hide grid
    if (loading) loading.classList.add('active');
    if (container) container.classList.remove('visible');
    if (exportBtn) exportBtn.disabled = true;

    const url = `api/reports.php?action=generate&type=${encodeURIComponent(type)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (loading) loading.classList.remove('active');

            if (data.status === 'success') {
                currentReportData = data;
                filteredReportRows = [...data.data];
                renderDataGrid(data.columns, data.data);

                // Update meta info
                const metaType = document.getElementById('metaType');
                const metaDate = document.getElementById('metaDate');
                const metaRange = document.getElementById('metaRange');
                const metaRangeContainer = document.getElementById('metaRangeContainer');

                if (metaType) metaType.textContent = data.report_type;
                if (metaDate) metaDate.textContent = data.generated_at;
                if (metaRangeContainer) {
                    if (data.date_from && data.date_to) {
                        metaRangeContainer.style.display = 'inline';
                        if (metaRange) metaRange.textContent = `${data.date_from} to ${data.date_to}`;
                    } else {
                        metaRangeContainer.style.display = 'none';
                    }
                }

                // Show grid and enable export
                if (container) container.classList.add('visible');
                if (exportBtn) exportBtn.disabled = false;

                // Update title
                const datagridTitle = document.getElementById('datagridTitle');
                if (datagridTitle) datagridTitle.textContent = data.report_type;

                // Clear search
                const searchInput = document.getElementById('datagridSearch');
                if (searchInput) searchInput.value = '';

                showToast('Report generated successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to generate report.', 'error');
            }
        })
        .catch(err => {
            if (loading) loading.classList.remove('active');
            showToast('Network error: ' + err.message, 'error');
        });
}

/**
 * Render DataGrid — Build table headers and rows dynamically
 */
function renderDataGrid(columns, rows) {
    const thead = document.getElementById('datagridHead');
    const tbody = document.getElementById('datagridBody');
    const emptyState = document.getElementById('emptyReport');
    const recordCount = document.getElementById('recordCount');

    if (!thead || !tbody) return;

    // Build header
    let headerHtml = '<tr><th>#</th>';
    columns.forEach(col => {
        headerHtml += `<th>${escapeHtml(col.label)}</th>`;
    });
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;

    // Build rows
    if (rows.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (recordCount) recordCount.textContent = '0 records';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (recordCount) recordCount.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;

    tbody.innerHTML = '';
    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        let cellHtml = `<td>${index + 1}</td>`;
        columns.forEach(col => {
            let val = row[col.key] || '';
            // Add badge styling for status columns
            if (col.key === 'status' || col.key === 'account_status') {
                const badgeClass = val === 'Active' || val === 'Enrolled' ? 'badge-active' : 'badge-inactive';
                cellHtml += `<td><span class="badge ${badgeClass}">${escapeHtml(val)}</span></td>`;
            } else {
                cellHtml += `<td>${escapeHtml(val)}</td>`;
            }
        });
        tr.innerHTML = cellHtml;
        tbody.appendChild(tr);
    });
}

/**
 * Filter DataGrid — Search/filter rows in the current report
 */
function filterDatagrid() {
    if (!currentReportData) return;

    const input = document.getElementById('datagridSearch');
    if (!input) return;

    const filter = input.value.toUpperCase();

    if (!filter) {
        filteredReportRows = [...currentReportData.data];
    } else {
        filteredReportRows = currentReportData.data.filter(row => {
            const rowStr = Object.values(row).join(' ').toUpperCase();
            return rowStr.includes(filter);
        });
    }

    renderDataGrid(currentReportData.columns, filteredReportRows);
}

/**
 * Export to Excel — Build a professional .xlsx file with full cell styling:
 *   Sheet 1: Styled Header + Logo + Bordered Data Table + Signature
 *   Sheet 2: Styled Chart Summary Data Table
 */
function exportToExcel() {
    if (!currentReportData || !window.XLSX) {
        showToast('No report data to export or XLSX library not loaded.', 'error');
        return;
    }

    const data = currentReportData;
    const wb = XLSX.utils.book_new();
    const colCount = data.columns.length + 1; // +1 for # column

    // ─── Style Definitions ────────────────────────────
    const maroonFill   = { fgColor: { rgb: '800000' } };
    const darkFill     = { fgColor: { rgb: '4A0000' } };
    const lightFill    = { fgColor: { rgb: 'FCF1F1' } };
    const grayFill     = { fgColor: { rgb: 'F2F2F2' } };
    const greenFill    = { fgColor: { rgb: 'E8F5E9' } };
    const whiteFill    = { fgColor: { rgb: 'FFFFFF' } };
    const whiteFont    = { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Calibri' };
    const subtitleFont = { bold: false, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' };
    const titleFont    = { bold: true, color: { rgb: '4A0000' }, sz: 12, name: 'Calibri' };
    const dateFont     = { bold: false, color: { rgb: '666666' }, sz: 9, name: 'Calibri' };
    const headerFont   = { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' };
    const cellFont     = { sz: 10, name: 'Calibri', color: { rgb: '333333' } };
    const sigLabelFont = { bold: true, sz: 10, name: 'Calibri', color: { rgb: '4A0000' } };
    const sigFont      = { sz: 10, name: 'Calibri', color: { rgb: '333333' } };

    const thinBorder = {
        top:    { style: 'thin', color: { rgb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
        left:   { style: 'thin', color: { rgb: 'D0D0D0' } },
        right:  { style: 'thin', color: { rgb: 'D0D0D0' } }
    };
    const headerBorder = {
        top:    { style: 'thin', color: { rgb: '800000' } },
        bottom: { style: 'medium', color: { rgb: '800000' } },
        left:   { style: 'thin', color: { rgb: '800000' } },
        right:  { style: 'thin', color: { rgb: '800000' } }
    };
    const sigBorder = {
        bottom: { style: 'thin', color: { rgb: '333333' } }
    };

    const centerAlign = { horizontal: 'center', vertical: 'center', wrapText: true };
    const leftAlign   = { horizontal: 'left', vertical: 'center' };
    const rightAlign  = { horizontal: 'right', vertical: 'center' };

    // ─── SHEET 1: Report Data ─────────────────────────
    const ws1 = {};
    let rowIdx = 0;

    // Helper to set a cell
    function setCell(ws, r, c, value, style) {
        const ref = XLSX.utils.encode_cell({ r, c });
        ws[ref] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style || {} };
    }

    // Row 0: Company Name — dark maroon background, white bold
    for (let c = 0; c < colCount; c++) {
        setCell(ws1, 0, c, c === 0 ? 'SCHOOL OF ROCK ENROLLMENT SYSTEM' : '', {
            font: whiteFont, fill: darkFill, alignment: centerAlign
        });
    }
    rowIdx = 1;

    // Row 1: Subtitle / Logo placeholder
    for (let c = 0; c < colCount; c++) {
        setCell(ws1, 1, c, c === 0 ? 'Official Institution Report' : '', {
            font: subtitleFont, fill: maroonFill, alignment: centerAlign
        });
    }
    rowIdx = 2;

    // Row 2: Report Title
    for (let c = 0; c < colCount; c++) {
        setCell(ws1, 2, c, c === 0 ? `Report: ${data.report_type}` : '', {
            font: titleFont, fill: lightFill, alignment: centerAlign,
            border: { bottom: { style: 'thin', color: { rgb: 'E0C0C0' } } }
        });
    }
    rowIdx = 3;

    // Row 3: Date & Range info
    let dateInfo = `Generated: ${data.generated_at}`;
    if (data.date_from && data.date_to) {
        dateInfo += `   |   Period: ${data.date_from} to ${data.date_to}`;
    }
    for (let c = 0; c < colCount; c++) {
        setCell(ws1, 3, c, c === 0 ? dateInfo : '', {
            font: dateFont, fill: whiteFill, alignment: centerAlign
        });
    }
    rowIdx = 4;

    // Row 4: Empty separator
    for (let c = 0; c < colCount; c++) {
        setCell(ws1, 4, c, '', { fill: whiteFill });
    }
    rowIdx = 5;

    // Row 5: Column Headers — maroon background, white bold text
    const headers = ['#', ...data.columns.map(c => c.label)];
    headers.forEach((hdr, c) => {
        setCell(ws1, 5, c, hdr, {
            font: headerFont, fill: maroonFill, alignment: centerAlign, border: headerBorder
        });
    });
    rowIdx = 6;

    // Data Rows — alternating white/light gray, bordered
    data.data.forEach((row, idx) => {
        const isEven = idx % 2 === 0;
        const rowFill = isEven ? whiteFill : grayFill;

        // # column
        setCell(ws1, rowIdx, 0, idx + 1, {
            font: cellFont, fill: rowFill, alignment: centerAlign, border: thinBorder
        });

        // Data columns
        data.columns.forEach((col, cIdx) => {
            let val = row[col.key] || '';
            setCell(ws1, rowIdx, cIdx + 1, val, {
                font: cellFont, fill: rowFill, alignment: leftAlign, border: thinBorder
            });
        });
        rowIdx++;
    });

    // Row after data: Total record count
    rowIdx++; // blank row
    setCell(ws1, rowIdx, 0, `Total Records: ${data.data.length}`, {
        font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: '4A0000' } },
        alignment: leftAlign
    });
    rowIdx += 2; // 2 blank rows

    // ── Signature Section ──
    const sigStartRow = rowIdx;

    // "Prepared by:" and "Approved by:" labels
    setCell(ws1, sigStartRow, 0, 'Prepared by:', { font: sigLabelFont, alignment: leftAlign });
    if (colCount > 3) {
        setCell(ws1, sigStartRow, 3, 'Approved by:', { font: sigLabelFont, alignment: leftAlign });
    }

    // Blank line for actual signature
    rowIdx = sigStartRow + 2;

    // Signature line (underscores)
    setCell(ws1, rowIdx, 0, '', { border: sigBorder });
    setCell(ws1, rowIdx, 1, '', { border: sigBorder });
    if (colCount > 3) {
        setCell(ws1, rowIdx, 3, '', { border: sigBorder });
        setCell(ws1, rowIdx, 4, '', { border: sigBorder });
    }
    rowIdx++;

    // Name under signature — first name and last name in separate cells
    setCell(ws1, rowIdx, 0, data.prepared_by_first || data.prepared_by, {
        font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: '333333' } },
        alignment: centerAlign
    });
    setCell(ws1, rowIdx, 1, data.prepared_by_last || '', {
        font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: '333333' } },
        alignment: centerAlign
    });
    if (colCount > 3) {
        setCell(ws1, rowIdx, 3, '', {
            font: sigFont, alignment: centerAlign
        });
    }
    rowIdx++;

    // Date placeholder
    setCell(ws1, rowIdx, 0, 'Date: ______________', { font: sigFont, alignment: leftAlign });
    if (colCount > 3) {
        setCell(ws1, rowIdx, 3, 'Date: ______________', { font: sigFont, alignment: leftAlign });
    }
    rowIdx += 2;

    // "Noted by:" section
    setCell(ws1, rowIdx, 0, 'Noted by:', { font: sigLabelFont, alignment: leftAlign });
    rowIdx += 2;
    setCell(ws1, rowIdx, 0, '', { border: sigBorder });
    setCell(ws1, rowIdx, 1, '', { border: sigBorder });
    rowIdx++;
    setCell(ws1, rowIdx, 0, '', { font: sigFont, alignment: centerAlign });
    rowIdx++;
    setCell(ws1, rowIdx, 0, 'Date: ______________', { font: sigFont, alignment: leftAlign });

    // Set sheet range
    ws1['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rowIdx, c: colCount - 1 } });

    // Merge cells for header rows
    ws1['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: colCount - 1 } },
    ];
    // Merge approved-by signature cells if enough columns
    if (colCount > 4) {
        ws1['!merges'].push(
            { s: { r: sigStartRow + 2, c: 3 }, e: { r: sigStartRow + 2, c: 4 } }
        );
    }

    // Column widths
    const colWidths = [{ wch: 6 }];
    data.columns.forEach(col => {
        let maxLen = col.label.length;
        data.data.forEach(row => {
            const val = (row[col.key] || '').toString();
            if (val.length > maxLen) maxLen = val.length;
        });
        colWidths.push({ wch: Math.min(Math.max(maxLen + 4, 16), 40) });
    });
    ws1['!cols'] = colWidths;

    // Row heights
    ws1['!rows'] = [
        { hpt: 36 },  // Company name
        { hpt: 24 },  // Subtitle
        { hpt: 26 },  // Report title
        { hpt: 20 },  // Date
        { hpt: 8 },   // Separator
        { hpt: 24 },  // Column headers
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Report Data');

    // ─── SHEET 2: Chart Summary Data ──────────────────
    const ws2 = {};
    let r2 = 0;

    // Title row
    setCell(ws2, 0, 0, `${data.report_type}`, {
        font: { bold: true, sz: 14, name: 'Calibri', color: { rgb: 'FFFFFF' } },
        fill: darkFill, alignment: centerAlign
    });
    setCell(ws2, 0, 1, '', { fill: darkFill });
    setCell(ws2, 0, 2, '', { fill: darkFill });
    r2 = 1;

    // Subtitle
    setCell(ws2, 1, 0, 'Chart Summary Data', {
        font: { bold: false, sz: 10, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
        fill: maroonFill, alignment: centerAlign
    });
    setCell(ws2, 1, 1, '', { fill: maroonFill });
    setCell(ws2, 1, 2, '', { fill: maroonFill });
    r2 = 2;

    // Blank row
    r2 = 3;

    // Summary Table Headers
    setCell(ws2, 3, 0, 'Category', {
        font: headerFont, fill: maroonFill, alignment: centerAlign, border: headerBorder
    });
    setCell(ws2, 3, 1, 'Count', {
        font: headerFont, fill: maroonFill, alignment: centerAlign, border: headerBorder
    });
    setCell(ws2, 3, 2, 'Visual', {
        font: headerFont, fill: maroonFill, alignment: centerAlign, border: headerBorder
    });
    r2 = 4;

    // Summary Data Rows
    const maxCount = data.summary ? Math.max(...data.summary.map(s => s.count), 1) : 1;
    if (data.summary && data.summary.length > 0) {
        data.summary.forEach((item, idx) => {
            const isEven = idx % 2 === 0;
            const rf = isEven ? whiteFill : grayFill;
            setCell(ws2, r2, 0, item.category, {
                font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: '333333' } },
                fill: rf, alignment: leftAlign, border: thinBorder
            });
            setCell(ws2, r2, 1, item.count, {
                font: { bold: true, sz: 12, name: 'Calibri', color: { rgb: '800000' } },
                fill: rf, alignment: centerAlign, border: thinBorder
            });
            // Visual bar using repeated block characters
            const barLength = Math.round((item.count / maxCount) * 20);
            const bar = '█'.repeat(barLength) || '▎';
            setCell(ws2, r2, 2, bar, {
                font: { sz: 10, name: 'Calibri', color: { rgb: '800000' } },
                fill: rf, alignment: leftAlign, border: thinBorder
            });
            r2++;
        });
    } else {
        setCell(ws2, r2, 0, 'No data', { font: cellFont, alignment: leftAlign, border: thinBorder });
        setCell(ws2, r2, 1, 0, { font: cellFont, alignment: centerAlign, border: thinBorder });
        setCell(ws2, r2, 2, '', { font: cellFont, border: thinBorder });
        r2++;
    }

    r2 += 1;

    // // Instructions
    // setCell(ws2, r2, 0, 'How to create a chart:', {
    //     font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: '4A0000' } },
    //     alignment: leftAlign
    // });
    // r2++;
    // setCell(ws2, r2, 0, '1. Select cells A4:B' + (4 + (data.summary ? data.summary.length : 1)), {
    //     font: { sz: 9, name: 'Calibri', color: { rgb: '666666' } }, alignment: leftAlign
    // });
    // r2++;
    // setCell(ws2, r2, 0, '2. Go to Insert tab → Chart', {
    //     font: { sz: 9, name: 'Calibri', color: { rgb: '666666' } }, alignment: leftAlign
    // });
    // r2++;
    // setCell(ws2, r2, 0, '3. Choose Bar Chart or Pie Chart', {
    //     font: { sz: 9, name: 'Calibri', color: { rgb: '666666' } }, alignment: leftAlign
    // });
    // r2 += 2;

    // Footer info
    setCell(ws2, r2, 0, `Report: ${data.report_type}`, {
        font: { sz: 9, name: 'Calibri', color: { rgb: '999999' } }
    });
    r2++;
    setCell(ws2, r2, 0, `Generated: ${data.generated_at}`, {
        font: { sz: 9, name: 'Calibri', color: { rgb: '999999' } }
    });
    r2++;
    setCell(ws2, r2, 0, `Prepared by: ${data.prepared_by}`, {
        font: { sz: 9, name: 'Calibri', color: { rgb: '999999' } }
    });

    // Sheet 2 range
    ws2['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r2, c: 2 } });

    // Merges
    ws2['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    ];

    // Column widths
    ws2['!cols'] = [
        { wch: 28 },
        { wch: 12 },
        { wch: 25 }
    ];

    // Row heights
    ws2['!rows'] = [
        { hpt: 32 },
        { hpt: 22 },
        { hpt: 8 },
        { hpt: 24 },
    ];

    XLSX.utils.book_append_sheet(wb, ws2, 'Chart Summary');

    // ─── Download ─────────────────────────────────────
    const safeName = data.report_type.replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
    showToast(`Excel file "${filename}" downloaded!`, 'success');
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = 'toast-notification';
    
    if (type === 'success') {
        toast.classList.add('success');
        if (toastIcon) toastIcon.textContent = '✅';
    } else if (type === 'error') {
        toast.classList.add('error');
        if (toastIcon) toastIcon.textContent = '❌';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
