$(document).ready(function() {
    
    // ===== RULE 1: Kiểm tra định dạng Mã phiếu mượn (PM-XXXX) =====
    // Yêu cầu: Phải bắt đầu bằng "PM-" theo sau là 4 chữ số
    // Ví dụ hợp lệ: PM-2048, PM-0001
    $.validator.addMethod("borrowIdFormat", function(value, element) {
        return this.optional(element) || /^PM-\d{4}$/.test(value);
    }, "Mã phiếu mượn phải theo định dạng PM-XXXX (ví dụ: PM-2048)");

    // ===== RULE 2: Kiểm tra tính duy nhất của Mã phiếu mượn =====
    // Yêu cầu: Mã không được trùng với các mã khác trong Local Storage
    // Trừ khi đang sửa (editing mode)
    $.validator.addMethod("borrowIdUnique", function(value, element) {
        if (this.optional(element)) return true;
        
        const borrowData = JSON.parse(localStorage.getItem('borrowData') || '[]');
        const editingId = $('#borrowId').data('editing-id');
        
        // Kiểm tra xem ID đã tồn tại chưa (không kiểm tra nếu đang sửa)
        return !borrowData.some(item => item.borrowId === value && item.borrowId !== editingId);
    }, "Mã phiếu mượn này đã tồn tại");

    // ===== RULE 3: Kiểm tra Họ tên người mượn =====
    // Yêu cầu: 
    //  - Chiều dài 2-40 ký tự
    //  - Chỉ chứa chữ cái (A-Z, a-z) và khoảng trắng
    //  - Hỗ trợ tiếng Việt (à, á, ả, ã, ạ, ...)
    $.validator.addMethod("validName", function(value, element) {
        return this.optional(element) || /^[a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]{2,40}$/u.test(value);
    }, "Họ tên phải từ 2-40 ký tự, chỉ chứa chữ cái và khoảng trắng");

    // ===== RULE 4: Kiểm tra định dạng Mã sách (BK + 5 chữ số) =====
    // Yêu cầu: Phải bắt đầu bằng "BK" theo sau là đúng 5 chữ số
    // Ví dụ hợp lệ: BK10234, BK00001
    $.validator.addMethod("bookIdFormat", function(value, element) {
        return this.optional(element) || /^BK\d{5}$/.test(value);
    }, "Mã sách phải bắt đầu bằng BK và theo sau là đúng 5 chữ số (ví dụ: BK10234)");

    // ===== RULE 5: Kiểm tra Ngày mượn =====
    // Yêu cầu: Ngày mượn không được vượt quá ngày hôm nay
    // (Không thể "mượn" từ tương lai)
    $.validator.addMethod("borrowDateValid", function(value, element) {
        if (this.optional(element)) return true;
        
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt giờ về 0 để so sánh ngày
        
        return selectedDate <= today;
    }, "Ngày mượn không được lớn hơn ngày hiện tại");

    // ===== RULE 6: Kiểm tra Hạn trả =====
    // Yêu cầu:
    //  - Hạn trả >= ngày mượn
    //  - Hạn trả không được vượt quá 30 ngày kể từ ngày mượn
    $.validator.addMethod("returnDeadlineValid", function(value, element) {
        if (this.optional(element)) return true;
        
        const borrowDate = new Date($('#borrowDate').val());
        const returnDate = new Date(value);
        const maxDate = new Date(borrowDate);
        maxDate.setDate(maxDate.getDate() + 30); // Cộng thêm 30 ngày
        
        return returnDate >= borrowDate && returnDate <= maxDate;
    }, "Hạn trả phải >= ngày mượn và không vượt quá 30 ngày");

    // ===== RULE 7: Kiểm tra Số điện thoại =====
    // Yêu cầu: Phải bắt đầu bằng 0 và có tổng cộng 10 chữ số
    // Ví dụ hợp lệ: 0912345678, 0987654321
    $.validator.addMethod("validPhone", function(value, element) {
        return this.optional(element) || /^0\d{9}$/.test(value);
    }, "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số");

    // ===== CẤU HÌNH FORM VALIDATION =====
    // Áp dụng các rule trên cho form #borrowForm
    $("#borrowForm").validate({
        rules: {
            borrowId: {
                required: true,
                borrowIdFormat: true,
                borrowIdUnique: true
            },
            borrowerName: {
                required: true,
                validName: true
            },
            bookId: {
                required: true,
                bookIdFormat: true
            },
            category: {
                required: true
            },
            borrowDate: {
                required: true,
                borrowDateValid: true
            },
            returnDeadline: {
                required: true,
                returnDeadlineValid: true
            },
            phone: {
                required: true,
                validPhone: true
            },
            email: {
                required: true,
                email: true
            },
            status: {
                required: true
            }
        },
        messages: {
            borrowId: {
                required: "Vui lòng nhập mã phiếu mượn"
            },
            borrowerName: {
                required: "Vui lòng nhập họ tên người mượn"
            },
            bookId: {
                required: "Vui lòng nhập mã sách"
            },
            category: {
                required: "Vui lòng chọn thể loại sách"
            },
            borrowDate: {
                required: "Vui lòng chọn ngày mượn"
            },
            returnDeadline: {
                required: "Vui lòng chọn hạn trả"
            },
            phone: {
                required: "Vui lòng nhập số điện thoại"
            },
            email: {
                required: "Vui lòng nhập email",
                email: "Vui lòng nhập email hợp lệ"
            },
            status: {
                required: "Vui lòng chọn trạng thái"
            }
        },
        errorClass: "error",          
        errorElement: "label",         
        errorPlacement: function(error, element) {
            error.insertAfter(element); // Đặt lỗi sau input
        },
        highlight: function(element, errorClass, validClass) {
            $(element).addClass("error"); // Thêm class error khi sai
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).removeClass("error"); // Bỏ class error khi đúng
        }
    });
});

// ===== HÀM: Đặt lại form validation =====
// Mục đích: Xóa tất cả lỗi và reset form khi đóng modal
function resetFormValidation() {
    const validator = $("#borrowForm").validate();
    validator.resetForm();        // Xóa tất cả lỗi
    $("#borrowForm")[0].reset(); // Xóa tất cả giá trị trong form
}
