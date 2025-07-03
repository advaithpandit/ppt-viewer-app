// ===================================================================================
// === 1. CONFIGURATION
// ===================================================================================
const SUPABASE_URL = 'https://twgslkjjhsjmagvprcip.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Z3Nsa2pqaHNqbWFndnByY2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODIwNjQsImV4cCI6MjA2NzA1ODA2NH0.l0ylH1mQrpTSqCRNcYUvOsqRtwPnLkS6XHOLen__e1Y';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================================================================================
// === 2. ELEMENT SELECTORS
// ===================================================================================
const presentationTitle = document.getElementById('presentation-title');
const pptList = document.getElementById('ppt-list');
const viewerContainer = document.getElementById('viewer-container');
const menuButton = document.getElementById('menu-button');
const dropdownMenu = document.getElementById('dropdown-menu');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carouselCounter = document.getElementById('carousel-counter');
const downloadButton = document.getElementById('download-button');

// Modal Elements
const allModals = document.querySelectorAll('.modal-overlay');
const uploadModal = document.getElementById('upload-modal');
const editNameModal = document.getElementById('edit-name-modal');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');

// --- Upload Modal ---
const uploadButton = document.getElementById('upload-button');
const closeModalBtn = document.getElementById('close-modal-btn');
const uploadForm = document.getElementById('upload-form');
const uploaderNameInput = document.getElementById('uploader-name');
const pptFileInput = document.getElementById('ppt-file');
const uploadStatus = document.getElementById('upload-status');

// --- Edit Modal ---
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editForm = document.getElementById('edit-form');
const editUploaderNameInput = document.getElementById('edit-uploader-name');
const editStatus = document.getElementById('edit-status');

// --- Delete Modal ---
const closeDeleteModalBtn = document.getElementById('close-delete-modal-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteConfirmMessage = document.getElementById('delete-confirm-message');

// ===================================================================================
// === 3. STATE MANAGEMENT
// ===================================================================================
let allPresentations = [];
let currentIndex = -1;
let activePresentation = { id: null, filePath: null, uploaderName: null };

// ===================================================================================
// === 4. CORE & HELPER FUNCTIONS
// ===================================================================================

// --- MODAL HELPERS ---
function showModal(modal) { modal.classList.add('visible'); }
function hideModal(modal) { modal.classList.remove('visible'); }

// --- NEW: FILETYPE ICON HELPER ---
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':    return '📄';
        case 'doc':
        case 'docx':   return '📘';
        case 'xls':
        case 'xlsx':   return '📊';
        case 'ppt':
        case 'pptx':   return '📙';
        default:       return '📁';
    }
}

async function fetchAndInitialize() {
    viewerContainer.innerHTML = '<div class="welcome-message"><p>Loading files...</p></div>';
    // Note: The bucket is still named 'ppts', but it holds all file types.
    // This is fine, but for a new project, you might name it 'documents'.
    const { data, error } = await supabase.from('presentations').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching files:', error);
        viewerContainer.innerHTML = '<div class="welcome-message"><p>Failed to load data.</p></div>';
        return;
    }

    allPresentations = data;
    displayPresentationsInDropdown(allPresentations);
    const lastViewedId = allPresentations[currentIndex]?.id;
    const newIndex = allPresentations.findIndex(p => p.id === lastViewedId);
    currentIndex = (newIndex !== -1) ? newIndex : (allPresentations.length > 0 ? 0 : -1);
    updateCarouselView();
}

// UPDATED to show file icons
function displayPresentationsInDropdown(presentations) {
    pptList.innerHTML = '';
    if (presentations.length === 0) {
        pptList.innerHTML = '<li class="dropdown-item" style="cursor:default; color:var(--text-muted); padding: 12px 16px;">No files found.</li>';
        return;
    }
    presentations.forEach((pres) => {
        const li = document.createElement('li');
        li.classList.add('ppt-list-item');
        li.dataset.id = pres.id;
        const icon = getFileIcon(pres.file_name);
        li.innerHTML = `
            <div class="ppt-info">
                <div class="ppt-name">${icon} ${pres.file_name}</div>
                <div class="ppt-uploader">by ${pres.uploader_name}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn edit-btn" title="Edit Name">✎</button>
                <button class="action-btn delete-btn" title="Delete File">🗑️</button>
            </div>
        `;
        pptList.appendChild(li);
    });
}

// UPDATED with more generic text
function updateCarouselView() {
    if (currentIndex === -1 || allPresentations.length === 0) {
        viewerContainer.innerHTML = `<div id="welcome-message" class="welcome-message"><h2>Document Viewer</h2><p>Select a file from the menu to get started or upload a new one.</p></div>`;
        presentationTitle.textContent = 'Document Viewer';
        carouselCounter.textContent = 'No files loaded';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        downloadButton.disabled = true;
        return;
    }
    const currentPres = allPresentations[currentIndex];
    displayViewer(currentPres.file_path, currentPres.file_name);
    presentationTitle.textContent = getFileIcon(currentPres.file_name) + ' ' + currentPres.file_name;
    carouselCounter.textContent = `${currentIndex + 1} of ${allPresentations.length}`;
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === allPresentations.length - 1);
    downloadButton.disabled = false;
}

// UPDATED with conditional viewer logic
function displayViewer(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    const { data } = supabase.storage.from('ppts').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    let viewerUrl;

    if (extension === 'pdf') {
        // For PDFs, use the direct public URL. The browser's native PDF viewer will be used.
        viewerUrl = publicUrl;
    } else {
        // For Office documents, use the Microsoft Office Apps Live Viewer.
        viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
    }
    
    viewerContainer.innerHTML = `<iframe id="viewer-iframe" src="${viewerUrl}" frameborder="0"></iframe>`;
}

// --- Action Handlers (Most remain unchanged) ---

async function handleDownload() {
    if (currentIndex === -1) return;
    const presentation = allPresentations[currentIndex];
    downloadButton.textContent = 'Downloading...';
    downloadButton.disabled = true;
    try {
        const { data: blob, error } = await supabase.storage.from('ppts').download(presentation.file_path);
        if (error) throw error;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = presentation.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again.');
    } finally {
        downloadButton.textContent = 'Download';
        downloadButton.disabled = false;
    }
}

function handleEdit(presentation) {
    activePresentation = { id: presentation.id, uploaderName: presentation.uploader_name };
    editUploaderNameInput.value = presentation.uploader_name;
    editStatus.textContent = '';
    showModal(editNameModal);
}

function handleDelete(presentation) {
    activePresentation = { id: presentation.id, filePath: presentation.file_path };
    deleteConfirmMessage.textContent = `Are you sure you want to delete "${presentation.file_name}"? This action cannot be undone.`;
    showModal(deleteConfirmModal);
}

// ... performEdit, performDelete, handleUpload functions remain exactly the same ...
async function performEdit(event) {
    event.preventDefault();
    const newName = editUploaderNameInput.value.trim();

    if (newName && newName !== activePresentation.uploaderName) {
        editStatus.textContent = 'Saving...';
        const { error } = await supabase.from('presentations').update({ uploader_name: newName }).eq('id', activePresentation.id);
        
        if (error) {
            editStatus.textContent = "Failed to update name: " + error.message;
        } else {
            editStatus.textContent = 'Saved!';
            setTimeout(() => {
                hideModal(editNameModal);
                fetchAndInitialize();
            }, 1000);
        }
    } else if (newName === activePresentation.uploaderName) {
        hideModal(editNameModal);
    } else {
        editStatus.textContent = 'Name cannot be empty.';
    }
}

async function performDelete() {
    const { id, filePath } = activePresentation;
    const { error: storageError } = await supabase.storage.from('ppts').remove([filePath]);
    if (storageError) {
        alert("Failed to delete file from storage: " + storageError.message);
        hideModal(deleteConfirmModal);
        return;
    }

    const { error: dbError } = await supabase.from('presentations').delete().eq('id', id);
    if (dbError) {
        alert("File was deleted from storage, but failed to delete database record: " + dbError.message);
    }
    
    hideModal(deleteConfirmModal);
    if (allPresentations[currentIndex]?.id === id) {
        currentIndex = -1;
    }
    fetchAndInitialize(); 
}

async function handleUpload(event) {
    event.preventDefault();
    const uploaderName = uploaderNameInput.value.trim();
    const file = pptFileInput.files[0];
    if (!uploaderName || !file) {
        uploadStatus.textContent = 'Please fill in your name and choose a file.';
        return;
    }
    uploadStatus.textContent = 'Uploading... Please wait.';
    try {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('ppts').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from('presentations').insert([{ uploader_name: uploaderName, file_name: file.name, file_path: fileName }]);
        if (insertError) throw insertError;

        uploadStatus.textContent = 'Upload successful!';
        setTimeout(() => {
            hideModal(uploadModal);
            uploadForm.reset();
            uploadStatus.textContent = '';
            fetchAndInitialize();
        }, 1500);
    } catch (error) {
        console.error('Upload failed:', error);
        uploadStatus.textContent = `Upload failed: ${error.message}`;
    }
}

// ===================================================================================
// === 5. EVENT LISTENERS
// ===================================================================================
// ... All event listeners remain exactly the same ...
downloadButton.addEventListener('click', handleDownload);
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarouselView();
    }
});
nextBtn.addEventListener('click', () => {
    if (currentIndex < allPresentations.length - 1) {
        currentIndex++;
        updateCarouselView();
    }
});
menuButton.addEventListener('click', () => dropdownMenu.classList.toggle('show'));
window.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});
pptList.addEventListener('click', (event) => {
    const listItem = event.target.closest('.ppt-list-item');
    if (!listItem) return;
    const presId = listItem.dataset.id;
    const presentation = allPresentations.find(p => p.id === presId);
    if (!presentation) return;
    if (event.target.closest('.delete-btn')) {
        handleDelete(presentation);
    } else if (event.target.closest('.edit-btn')) {
        handleEdit(presentation);
    } else {
        currentIndex = allPresentations.findIndex(p => p.id === presId);
        updateCarouselView();
        dropdownMenu.classList.remove('show');
    }
});
uploadButton.addEventListener('click', () => showModal(uploadModal));
closeModalBtn.addEventListener('click', () => hideModal(uploadModal));
uploadForm.addEventListener('submit', handleUpload);
editForm.addEventListener('submit', performEdit);
closeEditModalBtn.addEventListener('click', () => hideModal(editNameModal));
cancelEditBtn.addEventListener('click', () => hideModal(editNameModal));
confirmDeleteBtn.addEventListener('click', performDelete);
closeDeleteModalBtn.addEventListener('click', () => hideModal(deleteConfirmModal));
cancelDeleteBtn.addEventListener('click', () => hideModal(deleteConfirmModal));
allModals.forEach(modal => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal(modal);
        }
    });
});

// ===================================================================================
// === 6. INITIALIZATION
// ===================================================================================
fetchAndInitialize();
allModals.forEach(modal => hideModal(modal));