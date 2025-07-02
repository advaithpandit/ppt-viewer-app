// ===================================================================================
// === 1. CONFIGURATION
// ===================================================================================
const SUPABASE_URL = 'https://ranvcpqfcynzblfhnaer.supabase.co'; // Your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnZjcHFmY3luemJsZmhuYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc4OTQsImV4cCI6MjA2NzAzMzg5NH0.j2Cxny4EYW4_NzE4AYyi597CwCgZAF5VTqyslJNU5UI'; // Your Supabase Anon Key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================================================================================
// === 2. ELEMENT SELECTORS
// ===================================================================================
const pptList = document.getElementById('ppt-list');
const uploadForm = document.getElementById('upload-form');
const uploaderNameInput = document.getElementById('uploader-name');
const pptFileInput = document.getElementById('ppt-file');
const uploadStatus = document.getElementById('upload-status');
const viewerContainer = document.getElementById('viewer-container');
const welcomeMessage = document.getElementById('welcome-message');

// New UI Elements
const menuButton = document.getElementById('menu-button');
const dropdownMenu = document.getElementById('dropdown-menu');
const uploadLink = document.getElementById('upload-link');
const uploadModal = document.getElementById('upload-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const carouselCounter = document.getElementById('carousel-counter');

// ===================================================================================
// === 3. STATE MANAGEMENT
// ===================================================================================
let allPresentations = [];
let currentIndex = -1;

// ===================================================================================
// === 4. CORE FUNCTIONS
// ===================================================================================

async function fetchAndInitialize() {
    viewerContainer.innerHTML = '<div class="welcome-message"><p>Loading presentations...</p></div>';
    const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching presentations:', error);
        viewerContainer.innerHTML = '<div class="welcome-message"><p>Failed to load data.</p></div>';
        return;
    }

    allPresentations = data;
    displayPresentationsInDropdown(allPresentations);

    if (allPresentations.length > 0) {
        currentIndex = 0;
        updateCarouselView();
    } else {
        updateCarouselView(); // Show welcome message
    }
}

function displayPresentationsInDropdown(presentations) {
    pptList.innerHTML = '';
    if (presentations.length === 0) {
        pptList.innerHTML = '<li class="dropdown-item" style="cursor:default; color:var(--text-muted);">No presentations found.</li>';
    }
    presentations.forEach((pres, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="ppt-info">
            <div class="ppt-name">${pres.file_name}</div>
            <div class="ppt-uploader">by ${pres.uploader_name}</div>
        </div>`;
        li.addEventListener('click', () => {
            jumpToPresentation(index);
        });
        pptList.appendChild(li);
    });
}

function jumpToPresentation(index) {
    currentIndex = index;
    updateCarouselView();
    dropdownMenu.classList.remove('show');
}

function updateCarouselView() {
    if (currentIndex === -1 || allPresentations.length === 0) {
        viewerContainer.innerHTML = `
            <div id="welcome-message" class="welcome-message">
                <h2>Welcome to the PPT Viewer</h2>
                <p>Select a presentation from the menu to get started or upload a new one.</p>
            </div>`;
        carouselCounter.textContent = 'No presentations loaded';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const currentPres = allPresentations[currentIndex];
    displayViewer(currentPres.file_path);
    carouselCounter.textContent = `${currentIndex + 1} of ${allPresentations.length}`;

    // Update button states
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === allPresentations.length - 1);
}

function displayViewer(filePath) {
    const { data } = supabase.storage.from('ppts').getPublicUrl(filePath);
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.publicUrl)}`;
    viewerContainer.innerHTML = `<iframe id="viewer-iframe" src="${viewerUrl}" frameborder="0"></iframe>`;
}

function showNext() {
    if (currentIndex < allPresentations.length - 1) {
        currentIndex++;
        updateCarouselView();
    }
}

function showPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarouselView();
    }
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

        const { error: insertError } = await supabase.from('presentations').insert([{
            uploader_name: uploaderName,
            file_name: file.name,
            file_path: fileName,
        }]);
        if (insertError) throw insertError;

        uploadStatus.textContent = 'Upload successful!';
        setTimeout(() => {
            uploadModal.classList.add('hidden');
            uploadForm.reset();
            uploadStatus.textContent = '';
        }, 1500);

        fetchAndInitialize(); // Re-fetch all data to update UI

    } catch (error) {
        console.error('Upload failed:', error);
        uploadStatus.textContent = `Upload failed: ${error.message}`;
    }
}

// ===================================================================================
// === 5. EVENT LISTENERS
// ===================================================================================

// Carousel navigation
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);

// Dropdown menu
menuButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});

// Hide dropdown if clicking outside
window.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// Modal controls
uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    uploadModal.classList.remove('hidden');
    dropdownMenu.classList.remove('show');
});

closeModalBtn.addEventListener('click', () => {
    uploadModal.classList.add('hidden');
});

uploadModal.addEventListener('click', (event) => {
    if (event.target === uploadModal) {
        uploadModal.classList.add('hidden');
    }
});

// Form submission
uploadForm.addEventListener('submit', handleUpload);

// ===================================================================================
// === 6. INITIALIZATION
// ===================================================================================
fetchAndInitialize();