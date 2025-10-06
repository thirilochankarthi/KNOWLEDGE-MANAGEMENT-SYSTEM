document.addEventListener('DOMContentLoaded', () => {

    // DOM Element References
    const navViewAll = document.getElementById('nav-view-all');
    const navAddNew = document.getElementById('nav-add-new');
    const viewAllPage = document.getElementById('view-all-page');
    const addNewPage = document.getElementById('add-new-page');
    const knowledgeList = document.getElementById('knowledge-list');
    const addForm = document.getElementById('add-form');
    const searchInput = document.getElementById('search-input');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Data Management ---
    const getEntries = () => {
        const entries = localStorage.getItem('knowledgeEntries');
        return entries ? JSON.parse(entries) : [];
    };

    const saveEntries = (entries) => {
        localStorage.setItem('knowledgeEntries', JSON.stringify(entries));
    };

    // --- Rendering ---
    const renderEntries = (filter = '') => {
        knowledgeList.innerHTML = '';
        const entries = getEntries();
        const lowerCaseFilter = filter.toLowerCase();

        const filteredEntries = entries.filter(entry =>
            entry.title.toLowerCase().includes(lowerCaseFilter) ||
            entry.content.toLowerCase().includes(lowerCaseFilter) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerCaseFilter))
        );
        
        if (filteredEntries.length === 0) {
            knowledgeList.innerHTML = '<p>No entries found. Try adding one!</p>';
            return;
        }

        filteredEntries.sort((a, b) => b.id - a.id); // Show newest first

        filteredEntries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'knowledge-card';
            card.dataset.id = entry.id;

            const tagsHTML = entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            card.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content}</p>
                <div class="tags-container">${tagsHTML}</div>
                <div class="card-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            knowledgeList.appendChild(card);
        });
    };

    // --- Page Navigation ---
    const showPage = (pageToShow) => {
        [viewAllPage, addNewPage].forEach(page => page.classList.add('hidden'));
        pageToShow.classList.remove('hidden');

        // Update active nav link
        navViewAll.classList.toggle('active', pageToShow === viewAllPage);
        navAddNew.classList.toggle('active', pageToShow === addNewPage);
    };

    // --- Event Handlers ---
    navViewAll.addEventListener('click', (e) => {
        e.preventDefault();
        renderEntries(); // Re-render in case of changes
        showPage(viewAllPage);
    });

    navAddNew.addEventListener('click', (e) => {
        e.preventDefault();
        addForm.reset();
        showPage(addNewPage);
    });
    
    // Add new entry
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entries = getEntries();
        const newEntry = {
            id: Date.now(), // Simple unique ID
            title: document.getElementById('title-input').value,
            content: document.getElementById('content-input').value,
            tags: document.getElementById('tags-input').value.split(',').map(tag => tag.trim()).filter(Boolean)
        };
        entries.push(newEntry);
        saveEntries(entries);
        addForm.reset();
        alert('Entry saved successfully!');
        renderEntries();
        showPage(viewAllPage);
    });

    // Search/Filter entries
    searchInput.addEventListener('input', () => {
        renderEntries(searchInput.value);
    });

    // Edit and Delete button clicks (using event delegation)
    knowledgeList.addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('.knowledge-card');
        if (!card) return;

        const entryId = Number(card.dataset.id);

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this entry?')) {
                let entries = getEntries();
                entries = entries.filter(entry => entry.id !== entryId);
                saveEntries(entries);
                renderEntries(searchInput.value); // Re-render with current filter
            }
        }

        if (target.classList.contains('edit-btn')) {
            const entries = getEntries();
            const entryToEdit = entries.find(entry => entry.id === entryId);
            if (entryToEdit) {
                document.getElementById('edit-id-input').value = entryToEdit.id;
                document.getElementById('edit-title-input').value = entryToEdit.title;
                document.getElementById('edit-content-input').value = entryToEdit.content;
                document.getElementById('edit-tags-input').value = entryToEdit.tags.join(', ');
                editModal.classList.remove('hidden');
            }
        }
    });
    
    // Handle modal form submission for editing
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entryId = Number(document.getElementById('edit-id-input').value);
        let entries = getEntries();
        const entryIndex = entries.findIndex(entry => entry.id === entryId);

        if (entryIndex > -1) {
            entries[entryIndex] = {
                id: entryId,
                title: document.getElementById('edit-title-input').value,
                content: document.getElementById('edit-content-input').value,
                tags: document.getElementById('edit-tags-input').value.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            saveEntries(entries);
            editModal.classList.add('hidden');
            renderEntries(searchInput.value);
        }
    });

    // Cancel edit
    cancelEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });

    // --- Initial Load ---
    renderEntries();
});