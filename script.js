document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchButton = document.getElementById('search');
    const queryInput = document.getElementById('query');
    const clearButton = document.getElementById('clearSearch');
    const resultsDiv = document.getElementById('results');
    const resultsHeader = document.getElementById('resultsHeader');
    const resultsCount = document.getElementById('resultsCount');
    const modal = document.getElementById('bookModal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.querySelector('.modal-close');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const themeToggle = document.getElementById('themeToggle');
    const suggestions = document.querySelectorAll('.suggestion-chip');

    let allBooks = [];
    let isSearching = false;

    // Theme Management
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Search Functionality
    searchButton.addEventListener('click', handleSearch);
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isSearching) {
            handleSearch();
        }
    });

    // Clear Search
    clearButton.addEventListener('click', () => {
        queryInput.value = '';
        queryInput.focus();
        clearButton.style.opacity = '0';
    });

    queryInput.addEventListener('input', (e) => {
        clearButton.style.opacity = e.target.value ? '1' : '0';
    });

    // Suggestion Chips
    suggestions.forEach(chip => {
        chip.addEventListener('click', () => {
            queryInput.value = chip.dataset.query;
            handleSearch();
        });
    });

    // Search Handler
    async function handleSearch() {
        const query = queryInput.value.trim();
        if (!query || isSearching) return;

        isSearching = true;
        showLoading();

        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?maxResults=31&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            allBooks = [];
            if (data.items) {
                for (const item of data.items.slice(0, 30)) {
                    const book = item.volumeInfo;
                    const details = {
                        title: book.title || "Unknown",
                        authors: book.authors ? book.authors.join(', ') : "Unknown",
                        publishedDate: book.publishedDate || "Unknown",
                        description: book.description || "No description available.",
                        pageCount: book.pageCount || "N/A",
                        thumbnail: book.imageLinks ? book.imageLinks.thumbnail : null,
                    };
                    allBooks.push(details);
                }
            }
            displayBooks(allBooks);

        } catch (error) {
            showError('Unable to search books. Please check your connection and try again.');
        } finally {
            hideLoading();
            isSearching = false;
        }
    }

    // Display Functions
    function showLoading() {
        loadingOverlay.classList.add('show');
        searchButton.disabled = true;
    }

    function hideLoading() {
        loadingOverlay.classList.remove('show');
        searchButton.disabled = false;
    }

    function showError(message) {
        resultsDiv.innerHTML = `
            <div class="error-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>Something went wrong</h3>
                <p>${message}</p>
                <button onclick="handleSearch()" class="retry-button">Try Again</button>
            </div>
        `;
        resultsHeader.style.display = 'none';
    }

    function displayBooks(books) {
        resultsDiv.innerHTML = '';

        if (books.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <h3>No books found</h3>
                    <p>Try adjusting your search terms or browse our suggestions</p>
                </div>
            `;
            resultsHeader.style.display = 'none';
            return;
        }

        // Show results header
        resultsHeader.style.display = 'flex';
        resultsCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''} found`;

        // Create book cards with staggered animation
        books.forEach((book, index) => {
            const bookCard = createBookCard(book, index);
            resultsDiv.appendChild(bookCard);

            // Staggered animation
            setTimeout(() => {
                bookCard.classList.add('animate-in');
            }, index * 50);
        });
    }

    function createBookCard(book, index) {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-card';
        bookDiv.dataset.index = index;

        const thumbnailHTML = book.thumbnail
            ? `<img src="${book.thumbnail}" alt="${book.title}" loading="lazy">`
            : `<div class="book-placeholder">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                   <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                   <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                 </svg>
               </div>`;

        bookDiv.innerHTML = `
            <div class="book-cover">
                ${thumbnailHTML}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.authors}</p>
                <div class="book-meta">
                    <span class="book-year">${book.publishedDate}</span>
                    ${book.pageCount !== 'N/A' ? `<span class="book-pages">${book.pageCount} pages</span>` : ''}
                </div>
            </div>
        `;

        bookDiv.addEventListener('click', () => openModal(index));
        return bookDiv;
    }

    // Modal Functions
    function openModal(index) {
        const book = allBooks[index];
        modalBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-book-cover">
                    ${book.thumbnail
                ? `<img src="${book.thumbnail}" alt="${book.title}">`
                : `<div class="book-placeholder-large">
                             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                               <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                               <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                             </svg>
                           </div>`
            }
                </div>
                <div class="modal-book-info">
                    <h2 class="modal-title">${book.title}</h2>
                    <p class="modal-author">by ${book.authors}</p>
                    <div class="modal-meta">
                        <span class="meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${book.publishedDate}
                        </span>
                        ${book.pageCount !== 'N/A' ? `
                            <span class="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                                ${book.pageCount} pages
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-description">
                <h3>Description</h3>
                <p>${book.description}</p>
            </div>
            <div class="modal-actions">
                <button class="download-button" data-query="${book.title} ${book.authors}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Get Download Links
                </button>
                <div class="download-links" id="downloadLinks"></div>
            </div>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Add download functionality
        modalBody.querySelector('.download-button').addEventListener('click', fetchDownloadLinks);
    }

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Download Links
    async function fetchDownloadLinks(e) {
        const button = e.target.closest('.download-button');
        const downloadLinksDiv = document.getElementById('downloadLinks');
        const query = button.dataset.query;

        button.disabled = true;
        button.innerHTML = `
            <div class="button-spinner"></div>
            Searching...
        `;

        try {
            const search_url = `https://libgen.gs/index.php?req=${encodeURIComponent(query)}&res=10&filesuns=all&covers=on&curtab=f`;
            const response = await fetch(`https://cors-anywhere.herokuapp.com/${search_url}`);
            const html = await response.text();
            const $ = cheerio.load(html);
            const links = [];
            $('table.table-striped tbody tr').slice(0, 5).each((i, el) => {
                const detailLink = $(el).find('td:last-child a').attr('href');
                if (detailLink) {
                    links.push('https://libgen.gs/' + detailLink);
                }
            });

            if (links && links.length > 0) {
                downloadLinksDiv.innerHTML = `
                    <div class="download-list">
                        <h4>Available Downloads</h4>
                        ${links.map((link, index) => `
                            <a href="${link}" target="_blank" class="download-link">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7,10 12,15 17,10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Download Option ${index + 1}
                            </a>
                        `).join('')}
                    </div>
                `;
            } else {
                downloadLinksDiv.innerHTML = `
                    <div class="no-downloads">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p>No download links found for this book</p>
                    </div>
                `;
            }
        } catch (error) {
            downloadLinksDiv.innerHTML = `
                <div class="download-error">
                    <p>Unable to fetch download links. Please try again.</p>
                </div>
            `;
        } finally {
            button.disabled = false;
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Get Download Links
            `;
        }
    }

    // Event Listeners
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Focus management
    queryInput.focus();
});
