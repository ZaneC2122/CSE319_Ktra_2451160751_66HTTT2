// ====================================================================
// FILE: script.js
// MỤC ĐÍCH: Xử lý các chức năng chính của hệ thống quản lý phiếu mượn
// ====================================================================

// ===== BIẾN TOÀN CỤC =====
// Biến lưu ID của phiếu mượn đang cần xóa
let deleteConfirmBorrowId = null;

// ===== KHỞI ĐỘNG ỨNG DỤNG =====
// Hàm này chạy khi trang web tải xong
$(document).ready(function() {
    loadAndDisplayBorrows();   // Tải và hiển thị danh sách phiếu mượn
    setupEventListeners();     // Thiết lập các sự kiện (click, submit, ...)\n    setDefaultDates();         // Đặt ngày mặc định cho form
});

// Setup event listeners
function setupEventListeners() {
    // Add Borrow Button
    $('#addBorrowBtn').click(function() {
        openBorrowModal();
    });

    // Modal Close Button
    $('.close-btn').click(function() {
        closeBorrowModal();
    });

    // Cancel Button in Form
    $('#cancelBtn').click(function() {
        closeBorrowModal();
    });

    // Close modal when clicking outside
    $(window).click(function(event) {
        const modal = $('#borrowModal')[0];
        const confirmDialog = $('#confirmDialog')[0];
        
        if (event.target === modal) {
            closeBorrowModal();
        }
        if (event.target === confirmDialog) {
            closeConfirmDialog();
        }
    });

    // Form Submit
    $('#borrowForm').submit(function(e) {
        e.preventDefault();
        
        // Validate form
        if (!$(this).valid()) {
            return false;
        }
        
        saveBorrow();
    });

    // Confirm Delete
    $('#confirmDeleteBtn').click(function() {
        performDelete();
    });

    // Cancel Delete
    $('#cancelDeleteBtn').click(function() {
        closeConfirmDialog();
    });

    // Search functionality
    $('#searchInput').on('keyup', function() {
        filterBorrows();
    });
}

// Load and display borrows from Local Storage
function loadAndDisplayBorrows() {
    const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
    
    if (borrowData.length === 0) {
        $('#borrowTableBody').empty();
        $('#noDataMessage').show();
    } else {
        displayBorrows(borrowData);
        $('#noDataMessage').hide();
    }
    
    updateStatistics();
}

// Display borrows in table
function displayBorrows(borrows) {
    const tbody = $('#borrowTableBody');
    tbody.empty();
    
    borrows.forEach(borrow => {
        const row = createBorrowRow(borrow);
        tbody.append(row);
    });
    
    // Attach event listeners to action buttons
    attachActionListeners();
}

// Create a table row for a borrow record
function createBorrowRow(borrow) {
    const statusClass = borrow.status === 'Đang mượn' ? 'active' : 'returned';
    
    const row = $(`
        <tr data-borrow-id="${borrow.borrowId}">
            <td><strong>${borrow.borrowId}</strong></td>
            <td>${borrow.borrowerName}</td>
            <td>${borrow.bookId}</td>
            <td>${borrow.category}</td>
            <td>${formatDate(borrow.borrowDate)}</td>
            <td>${formatDate(borrow.returnDeadline)}</td>
            <td>${borrow.phone}</td>
            <td>${borrow.email}</td>
            <td><span class="status ${statusClass}">${borrow.status}</span></td>
            <td>
                <div class="action-buttons-cell">
                    <button class="btn btn-edit btn-edit-action" data-borrow-id="${borrow.borrowId}">Sửa</button>
                    <button class="btn btn-delete btn-delete-action" data-borrow-id="${borrow.borrowId}">Xóa</button>
                </div>
            </td>
        </tr>
    `);
    
    return row;
}

// Attach event listeners to action buttons
function attachActionListeners() {
    $('.btn-edit-action').click(function() {
        const borrowId = $(this).data('borrow-id');
        editBorrow(borrowId);
    });

    $('.btn-delete-action').click(function() {
        const borrowId = $(this).data('borrow-id');
        confirmDelete(borrowId);
    });
}

// Open borrow modal for adding new borrow
function openBorrowModal(borrowId = null) {
    resetFormValidation();
    
    if (borrowId) {
        // Edit mode
        const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
        const borrow = borrowData.find(b => b.borrowId === borrowId);
        
        if (borrow) {
            $('#modalTitle').text('Cập nhật phiếu mượn');
            populateForm(borrow);
            $('#borrowId').data('editing-id', borrowId);
            $('#borrowId').prop('disabled', true); // Disable ID field in edit mode
        }
    } else {
        // Add mode
        $('#modalTitle').text('Thêm phiếu mươn');
        $('#borrowForm')[0].reset();
        $('#borrowId').data('editing-id', null);
        $('#borrowId').prop('disabled', false);
        setDefaultDates();
    }
    
    $('#borrowModal').show();
}

// Close borrow modal
function closeBorrowModal() {
    $('#borrowModal').hide();
    resetFormValidation();
}

// Populate form with borrow data
function populateForm(borrow) {
    $('#borrowId').val(borrow.borrowId);
    $('#borrowerName').val(borrow.borrowerName);
    $('#bookId').val(borrow.bookId);
    $('#category').val(borrow.category);
    $('#borrowDate').val(borrow.borrowDate);
    $('#returnDeadline').val(borrow.returnDeadline);
    $('#phone').val(borrow.phone);
    $('#email').val(borrow.email);
    $('#status').val(borrow.status);
    $('#notes').val(borrow.notes);
}

// Save borrow to Local Storage
function saveBorrow() {
    const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
    const editingId = $('#borrowId').data('editing-id');
    
    const newBorrow = {
        borrowId: $('#borrowId').val().trim(),
        borrowerName: $('#borrowerName').val().trim(),
        bookId: $('#bookId').val().trim(),
        category: $('#category').val(),
        borrowDate: $('#borrowDate').val(),
        returnDeadline: $('#returnDeadline').val(),
        phone: $('#phone').val().trim(),
        email: $('#email').val().trim(),
        status: $('#status').val(),
        notes: $('#notes').val().trim()
    };
    
    if (editingId) {
        // Update existing record
        const index = borrowData.findIndex(b => b.borrowId === editingId);
        if (index !== -1) {
            borrowData[index] = newBorrow;
        }
    } else {
        // Add new record
        borrowData.push(newBorrow);
    }
    
    localStorage.setItem('borrowData', JSON.stringify(borrowData));
    loadAndDisplayBorrows();
    closeBorrowModal();
    showSuccessMessage(editingId ? 'Cập nhật phiếu mượn thành công!' : 'Thêm phiếu mượn thành công!');
}

// Edit borrow
function editBorrow(borrowId) {
    openBorrowModal(borrowId);
}

// Confirm delete
function confirmDelete(borrowId) {
    deleteConfirmBorrowId = borrowId;
    const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
    const borrow = borrowData.find(b => b.borrowId === borrowId);
    
    if (borrow) {
        $('#confirmMessage').text(`Bạn có chắc chắn muốn xóa phiếu mượn ${borrowId} của ${borrow.borrowerName}?`);
    }
    
    $('#confirmDialog').show();
}

// Perform delete
function performDelete() {
    if (deleteConfirmBorrowId) {
        let borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
        borrowData = borrowData.filter(b => b.borrowId !== deleteConfirmBorrowId);
        localStorage.setItem('borrowData', JSON.stringify(borrowData));
        
        loadAndDisplayBorrows();
        closeConfirmDialog();
        showSuccessMessage('Xóa phiếu mượn thành công!');
    }
}

// Close confirm dialog
function closeConfirmDialog() {
    $('#confirmDialog').hide();
    deleteConfirmBorrowId = null;
}

// Update statistics
function updateStatistics() {
    const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
    
    const totalBorrows = borrowData.length;
    const activeBorrows = borrowData.filter(b => b.status === 'Đang mượn').length;
    const returnedBorrows = borrowData.filter(b => b.status === 'Đã trả').length;
    
    $('#totalBorrows').text(totalBorrows);
    $('#activeBorrows').text(activeBorrows);
    $('#returnedBorrows').text(returnedBorrows);
}

// Filter borrows based on search input
function filterBorrows() {
    const searchTerm = $('#searchInput').val().toLowerCase().trim();
    let borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
    
    if (searchTerm === '') {
        displayBorrows(borrowData);
    } else {
        const filteredBorrows = borrowData.filter(borrow => 
            borrow.borrowId.toLowerCase().includes(searchTerm) ||
            borrow.borrowerName.toLowerCase().includes(searchTerm) ||
            borrow.bookId.toLowerCase().includes(searchTerm) ||
            borrow.phone.includes(searchTerm) ||
            borrow.email.toLowerCase().includes(searchTerm)
        );
        
        if (filteredBorrows.length === 0) {
            $('#borrowTableBody').empty();
            $('#noDataMessage').text('Không tìm thấy phiếu mượn nào').show();
        } else {
            displayBorrows(filteredBorrows);
            $('#noDataMessage').hide();
        }
    }
}

// Set default dates to today
function setDefaultDates() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayString = `${yyyy}-${mm}-${dd}`;
    
    $('#borrowDate').val(todayString);
    
    // Set default return deadline to 7 days from now
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const dd2 = String(sevenDaysLater.getDate()).padStart(2, '0');
    const mm2 = String(sevenDaysLater.getMonth() + 1).padStart(2, '0');
    const yyyy2 = sevenDaysLater.getFullYear();
    const sevenDaysString = `${yyyy2}-${mm2}-${dd2}`;
    
    $('#returnDeadline').val(sevenDaysString);
}

// Format date to display format (DD/MM/YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Show success message
function showSuccessMessage(message) {
    // Create a simple alert for now (can be enhanced with a toast notification)
    const oldBgColor = $('body').css('background-color');
    
    // Simple notification using alert (can be replaced with better UI)
    alert(message);
}

// Handle date change to revalidate the form
$(document).on('change', '#borrowDate, #returnDeadline', function() {
    // Force revalidation of return deadline when dates change
    if ($('#borrowForm').validate()) {
        $('#returnDeadline').valid();
    }
});
