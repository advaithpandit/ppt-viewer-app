// ===================================================================================
// === 1. CONFIGURATION
// ===================================================================================
const SUPABASE_URL = 'https://ranvcpqfcynzblfhnaer.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnZjcHFmY3luemJsZmhuYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc4OTQsImV4cCI6MjA2NzAzMzg5NH0.j2Cxny4EYW4_NzE4AYyi597CwCgZAF5VTqyslJNU5UI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ICONS = {
    download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
    upload: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`,
    fullscreenEnter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    fullscreenExit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`,
    // NEW: Filetype Icons
    filePpt: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5a36" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M8 16h1"/><path d="M11 16h1"/><path d="M14 16h1"/><path d="M8 12h5.5a2.5 2.5 0 0 1 0 5H8"/></svg>`,
    fileDoc: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    filePdf: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9.4 11.5c.3-.9 1.4-.9 1.7 0l.6 1.8c.1.3.4.5.7.5h1.7c.9 0 .9 1.2 0 1.2h-1.7a.8.8 0 0 1-.7-.5l-.6-1.8Z"/><path d="M16.5 11.5c0 .9-.9 1-1.5 1h-1a.5.5 0 0 0 0 1h1.5c.9 0 1.5.1 1.5 1V16a2 2 0 0 1-2 2h-1.5a2 2 0 0 1-2-2v-2.5a2 2 0 0 1 2-2h1.5a2 2 0 0 1 2 2Z"/></svg>`,
    fileGeneric: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`
};

// ===================================================================================
// === 2. ELEMENT SELECTORS
// ===================================================================================
const pptList = document.getElementById('ppt-list');
const viewerContainer = document.getElementById('viewer-container');
const menuButton = document.getElementById('menu-button');
const dropdownMenu = document.getElementById('dropdown-menu');
const openUploadModalLink = document.getElementById('open-upload-modal');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const allModals = document.querySelectorAll('.modal-overlay');
const uploadModal = document.getElementById('upload-modal');
const editNameModal = document.getElementById('edit-name-modal');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const uploadForm = document.getElementById('upload-form');
const uploaderNameInput = document.getElementById('uploader-name');
const pptFileInput = document.getElementById('ppt-file');
const uploadStatus = document.getElementById('upload-status');
const editForm = document.getElementById('edit-form');
const editUploaderNameInput = document.getElementById('edit-uploader-name');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteConfirmMessage = document.getElementById('delete-confirm-message');

// ===================================================================================
// === 3. STATE MANAGEMENT
// ===================================================================================
let allPresentations = [];
let activePresentationId = null;
let actionTarget = null;

// ===================================================================================
// === 4. CORE FUNCTIONS
// ===================================================================================
// Helper function to get the correct file icon
function getFiletypeIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    if (extension === 'ppt' || extension === 'pptx') return ICONS.filePpt;
    if (extension === 'doc' || extension === 'docx') return ICONS.fileDoc;
    if (extension === 'pdf') return ICONS.filePdf;
    return ICONS.fileGeneric;
}

async function fetchAndInitialize() { /* same as before */ }
function displayPresentationsInDropdown() { /* updated */ }
function displayViewer(presentation) { /* same as before */ }
// ... and so on for all functions ...

async function fetchAndInitialize() {
    const { data, error } = await supabase.from('presentations').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching files:', error); viewerContainer.innerHTML = '<div class="welcome-message"><p>Failed to load data.</p></div>'; return; }
    allPresentations = data;
    displayPresentationsInDropdown();
    if (!activePresentationId || !allPresentations.some(p => p.id === activePresentationId)) {
        if (allPresentations.length > 0) { displayViewer(allPresentations[0]); }
        else {
            viewerContainer.innerHTML = `<div class="welcome-message"><h2>Document Viewer</h2><p>Upload a file to get started.</p></div>`;
            activePresentationId = null;
        }
    }
}

function displayPresentationsInDropdown() {
    pptList.innerHTML = '';
    if (allPresentations.length === 0) { pptList.innerHTML = '<li style="padding: 12px 16px; color: var(--text-secondary);">No files uploaded yet.</li>'; return; }
    allPresentations.forEach((pres) => {
        const li = document.createElement('li');
        li.classList.add('ppt-list-item');
        li.dataset.id = pres.id;
        if (pres.id === activePresentationId) { li.classList.add('active-item'); }
        li.innerHTML = `
            <span class="filetype-icon">${getFiletypeIcon(pres.file_name)}</span>
            <div class="ppt-info">
                <div class="ppt-name">${pres.file_name}</div>
                <div class="ppt-uploader">by ${pres.uploader_name}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn download-btn" title="Download">${ICONS.download}</button>
                <button class="action-btn edit-btn" title="Edit Name">${ICONS.edit}</button>
                <button class="action-btn delete-btn" title="Delete">${ICONS.delete}</button>
            </div>
        `;
        pptList.appendChild(li);
    });
}

function displayViewer(presentation) {
    activePresentationId = presentation.id;
    const { data } = supabase.storage.from('ppts').getPublicUrl(presentation.file_path);
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.publicUrl)}`;
    viewerContainer.innerHTML = `<iframe id="viewer-iframe" src="${viewerUrl}" frameborder="0"></iframe>`;
    displayPresentationsInDropdown();
}

function handleDownload(presentation) { performDownload(presentation); }
function handleEdit(presentation) {
    actionTarget = presentation;
    editUploaderNameInput.value = presentation.uploader_name;
    editNameModal.classList.add('visible');
    setTimeout(() => editUploaderNameInput.focus(), 50);
}
function handleDelete(presentation) {
    actionTarget = presentation;
    deleteConfirmMessage.textContent = `Are you sure you want to delete "${presentation.file_name}"? This action cannot be undone.`;
    deleteConfirmModal.classList.add('visible');
}
async function performDownload(presentation) {
    try {
        const { data: blob, error } = await supabase.storage.from('ppts').download(presentation.file_path);
        if (error) throw error;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = presentation.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) { console.error('Download Error:', error); alert('Could not download file.'); }
}
async function performEdit(event) {
    event.preventDefault();
    const newName = editUploaderNameInput.value.trim();
    if (newName && newName !== actionTarget.uploader_name) {
        const { error } = await supabase.from('presentations').update({ uploader_name: newName }).eq('id', actionTarget.id);
        if (error) { alert("Failed to update name: " + error.message); }
        else { editNameModal.classList.remove('visible'); fetchAndInitialize(); }
    } else { editNameModal.classList.remove('visible'); }
}
async function performDelete() {
    const { id, file_path } = actionTarget;
    const { error: storageError } = await supabase.storage.from('ppts').remove([file_path]);
    if (storageError) { alert("Failed to delete file from storage: " + storageError.message); deleteConfirmModal.classList.remove('visible'); return; }
    const { error: dbError } = await supabase.from('presentations').delete().eq('id', id);
    if (dbError) { alert("File was deleted, but failed to delete database record: " + dbError.message); }
    if (activePresentationId === id) { activePresentationId = null; }
    deleteConfirmModal.classList.remove('visible');
    fetchAndInitialize();
}
async function handleUpload(event) {
    event.preventDefault();
    const uploaderName = uploaderNameInput.value.trim();
    const file = pptFileInput.files[0];
    if (!uploaderName || !file) { uploadStatus.textContent = 'Please fill in name and choose a file.'; return; }
    uploadStatus.textContent = 'Uploading...';
    try {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('ppts').upload(fileName, file);
        await supabase.from('presentations').insert([{ uploader_name: uploaderName, file_name: file.name, file_path: fileName }]);
        uploadStatus.textContent = 'Upload successful!';
        setTimeout(() => {
            uploadModal.classList.remove('visible');
            uploadForm.reset();
            uploadStatus.textContent = '';
            fetchAndInitialize();
        }, 1000);
    } catch (error) { uploadStatus.textContent = `Upload failed: ${error.message}`; }
}
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}
function updateFullscreenButton() {
    if (document.fullscreenElement) {
        fullscreenBtn.innerHTML = `${ICONS.fullscreenExit} Exit Fullscreen`;
        fullscreenBtn.title = "Exit Fullscreen";
    } else {
        fullscreenBtn.innerHTML = `${ICONS.fullscreenEnter} Fullscreen`;
        fullscreenBtn.title = "Enter Fullscreen";
    }
}

// ===================================================================================
// === 5. EVENT LISTENERS
// ===================================================================================
openUploadModalLink.innerHTML = `${ICONS.upload} Upload New Document`;
menuButton.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
openUploadModalLink.addEventListener('click', (e) => {
    e.preventDefault();
    uploadModal.classList.add('visible');
    dropdownMenu.classList.remove('show');
    setTimeout(() => uploaderNameInput.focus(), 50);
});
fullscreenBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFullscreen();
});
document.addEventListener('fullscreenchange', updateFullscreenButton);
window.addEventListener('click', (e) => {
    if (!menuButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});
dropdownMenu.addEventListener('click', (event) => {
    const button = event.target.closest('.action-btn');
    if (button) { button.classList.add('active-pop'); setTimeout(() => button.classList.remove('active-pop'), 150); }
    const listItem = event.target.closest('.ppt-list-item');
    if (listItem) {
        const presId = listItem.dataset.id;
        const presentation = allPresentations.find(p => p.id === presId);
        if (!presentation) return;
        if (event.target.closest('.download-btn')) { handleDownload(presentation); }
        else if (event.target.closest('.edit-btn')) { handleEdit(presentation); }
        else if (event.target.closest('.delete-btn')) { handleDelete(presentation); }
        else { displayViewer(presentation); dropdownMenu.classList.remove('show'); }
    }
});
allModals.forEach(modal => {
    modal.addEventListener('click', (event) => { if (event.target === modal) { modal.classList.remove('visible'); } });
    const closeButtons = modal.querySelectorAll('[data-close-modal]');
    closeButtons.forEach(button => { button.addEventListener('click', () => modal.classList.remove('visible')); });
});
uploadForm.addEventListener('submit', handleUpload);
editForm.addEventListener('submit', performEdit);
confirmDeleteBtn.addEventListener('click', performDelete);

// ===================================================================================
// === 6. INITIALIZATION
// ===================================================================================
updateFullscreenButton();
fetchAndInitialize();