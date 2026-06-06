// ====================================================================
// FILE: data.js
// MỤC ĐÍCH: Khởi tạo dữ liệu mẫu và Local Storage
// ====================================================================

// ===== DỮ LIỆU MẪU =====
// Các phiếu mượn mẫu để kiểm tra chương trình
const sampleBorrowData = [
    {
        borrowId: "PM-0001",
        borrowerName: "Nguyễn Văn A",
        bookId: "BK10001",
        category: "CNTT",
        borrowDate: "2024-06-01",
        returnDeadline: "2024-06-15",
        phone: "0912345678",
        email: "nguyen.a@email.com",
        status: "Đang mượn",
        notes: "Sách kỹ thuật lập trình C++"
    },
    {
        borrowId: "PM-0002",
        borrowerName: "Trần Thị B",
        bookId: "BK10002",
        category: "Kinh tế",
        borrowDate: "2024-05-15",
        returnDeadline: "2024-05-29",
        phone: "0987654321",
        email: "tran.b@email.com",
        status: "Đã trả",
        notes: "Sách kinh tế lượng"
    },
    {
        borrowId: "PM-0003",
        borrowerName: "Phạm Minh C",
        bookId: "BK10003",
        category: "Ngoại ngữ",
        borrowDate: "2024-06-05",
        returnDeadline: "2024-06-19",
        phone: "0901234567",
        email: "pham.c@email.com",
        status: "Đang mượn",
        notes: ""
    },
    {
        borrowId: "PM-0004",
        borrowerName: "Lê Xuân D",
        bookId: "BK10004",
        category: "Kỹ năng",
        borrowDate: "2024-05-20",
        returnDeadline: "2024-06-03",
        phone: "0923456789",
        email: "le.d@email.com",
        status: "Đã trả",
        notes: "Kỹ năng quản lý"
    }
];

// ===== HÀM: KHỞI TẠO LOCAL STORAGE =====
// Nếu Local Storage trống, đưa dữ liệu mẫu vào
function initializeLocalStorage() {
    const existingData = localStorage.getItem('borrowData');
    if (!existingData) {
        // Lần đầu tiên chương trình chạy, thêm dữ liệu mẫu
        localStorage.setItem('borrowData', JSON.stringify(sampleBorrowData));
    }
}

// Gọi hàm khởi tạo khi tải trang
initializeLocalStorage();
