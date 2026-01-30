// API Configuration
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// State Management
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let currentSort = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');
const pageInfo = document.getElementById('pageInfo');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const pageSizeSelect = document.getElementById('pageSize');
const productCount = document.getElementById('productCount');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Sort Buttons
const sortPriceAsc = document.getElementById('sortPriceAsc');
const sortPriceDesc = document.getElementById('sortPriceDesc');
const sortNameAsc = document.getElementById('sortNameAsc');
const sortNameDesc = document.getElementById('sortNameDesc');

// Fetch all products from API
async function getAllProducts() {
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        
        console.log('Đang tải dữ liệu từ API...');
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Đã tải thành công:', data.length, 'sản phẩm');
        console.log('Dữ liệu mẫu:', data[0]);
        
        allProducts = data;
        filteredProducts = [...allProducts];
        
        loading.style.display = 'none';
        
        renderTable();
        updatePaginationInfo();
        
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Lỗi khi tải dữ liệu: ${error.message}. Vui lòng thử lại sau!`;
        console.error('Error fetching products:', error);
    }
}

// Render table with current page data
function renderTable() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (pageProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    Không tìm thấy sản phẩm nào
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = pageProducts.map(product => {
        // Generate image gallery HTML with better error handling
        const imagesHTML = product.images.map((img, index) => 
            `<img src="${img}" 
                 alt="${product.title}" 
                 class="product-image" 
                 referrerpolicy="no-referrer"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='https://placehold.co/80x80/667eea/white?text=IMG+${index+1}'; this.style.border='2px solid #ddd';">`
        ).join('');
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div class="image-gallery">
                        ${imagesHTML}
                    </div>
                </td>
                <td><strong>${product.title}</strong></td>
                <td class="price">$${product.price}</td>
                <td>${product.category?.name || 'N/A'}</td>
                <td class="description">${product.description || 'Không có mô tả'}</td>
            </tr>
        `;
    }).join('');
}

// Update pagination info and buttons
function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredProducts.length);
    
    productCount.textContent = `Hiển thị ${startItem}-${endItem} trong tổng số ${filteredProducts.length} sản phẩm`;
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply current sort if exists
    if (currentSort) {
        applySorting(currentSort);
    }
    
    currentPage = 1;
    renderTable();
    updatePaginationInfo();
}

// Sorting functionality
function applySorting(sortType) {
    currentSort = sortType;
    
    switch(sortType) {
        case 'priceAsc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'priceDesc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'nameAsc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'nameDesc':
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    currentPage = 1;
    renderTable();
    updatePaginationInfo();
    
    // Update button styles to show active sort
    updateSortButtonStyles(sortType);
}

// Update sort button styles
function updateSortButtonStyles(activeSort) {
    const buttons = [sortPriceAsc, sortPriceDesc, sortNameAsc, sortNameDesc];
    buttons.forEach(btn => {
        btn.style.background = '#667eea';
    });
    
    switch(activeSort) {
        case 'priceAsc':
            sortPriceAsc.style.background = '#764ba2';
            break;
        case 'priceDesc':
            sortPriceDesc.style.background = '#764ba2';
            break;
        case 'nameAsc':
            sortNameAsc.style.background = '#764ba2';
            break;
        case 'nameDesc':
            sortNameDesc.style.background = '#764ba2';
            break;
    }
}

// Pagination handlers
function goToNextPage() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updatePaginationInfo();
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        updatePaginationInfo();
    }
}

function changePageSize() {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderTable();
    updatePaginationInfo();
}

// Event Listeners
searchInput.addEventListener('input', handleSearch);

sortPriceAsc.addEventListener('click', () => applySorting('priceAsc'));
sortPriceDesc.addEventListener('click', () => applySorting('priceDesc'));
sortNameAsc.addEventListener('click', () => applySorting('nameAsc'));
sortNameDesc.addEventListener('click', () => applySorting('nameDesc'));

nextButton.addEventListener('click', goToNextPage);
prevButton.addEventListener('click', goToPrevPage);
pageSizeSelect.addEventListener('change', changePageSize);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    getAllProducts();
});

// Export functions for external use
window.ProductManager = {
    getAllProducts,
    renderTable,
    handleSearch,
    applySorting
};
