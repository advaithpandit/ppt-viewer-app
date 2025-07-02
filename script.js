    // ===================================================================================
    // === 1. CONFIGURATION: Connect to our Supabase project =============================
    // ===================================================================================

    // Find these values in your Supabase project settings:
    // Go to Settings > API
    const SUPABASE_URL = 'https://ranvcpqfcynzblfhnaer.supabase.co'; // <-- Paste your URL here
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnZjcHFmY3luemJsZmhuYWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc4OTQsImV4cCI6MjA2NzAzMzg5NH0.j2Cxny4EYW4_NzE4AYyi597CwCgZAF5VTqyslJNU5UI'; // <-- Paste your Anon Key here

    // Create a Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    // ===================================================================================
    // === 2. ELEMENT SELECTORS: Get references to our HTML elements =====================
    // ===================================================================================

    const pptList = document.getElementById('ppt-list');
    const uploadForm = document.getElementById('upload-form');
    const uploaderNameInput = document.getElementById('uploader-name');
    const pptFileInput = document.getElementById('ppt-file');
    const uploadStatus = document.getElementById('upload-status');
    const viewerContainer = document.getElementById('viewer-container');
    const welcomeMessage = document.getElementById('welcome-message');


    // ===================================================================================
    // === 3. CORE FUNCTIONS: The main logic of our app ==================================
    // ===================================================================================

    /**
    * Fetches all presentation records from the database and displays them.
    */
    async function fetchPresentations() {
        // Show a loading state in the list
        pptList.innerHTML = '<li class="ppt-list-item">Loading presentations...</li>';

        // 1. Fetch data from the 'presentations' table
        // 2. Order by 'created_at' to show the newest ones first
        const { data: presentations, error } = await supabase
            .from('presentations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching presentations:', error);
            pptList.innerHTML = '<li class="ppt-list-item">Failed to load data.</li>';
            return;
        }

        // If we get here, the fetch was successful. Now, display them.
        displayPresentations(presentations);
    }

    /**
    * Renders the list of presentations in the sidebar.
    * @param {Array} presentations - An array of presentation objects from Supabase.
    */
    function displayPresentations(presentations) {
        // Clear any previous content (like "Loading...")
        pptList.innerHTML = '';

        if (presentations.length === 0) {
            pptList.innerHTML = '<li class="ppt-list-item">No presentations uploaded yet.</li>';
            return;
        }
        
        // Loop through each presentation and create an HTML list item for it
        presentations.forEach((pres, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('ppt-list-item');

            listItem.innerHTML = `
                <div class="ppt-info">
                    <div class="ppt-name">${pres.file_name}</div>
                    <div class="ppt-uploader">by ${pres.uploader_name}</div>
                </div>
            `;

            // Add a click listener to each item to show the viewer
            listItem.addEventListener('click', () => {
                // Visually highlight the active item
                document.querySelectorAll('.ppt-list-item').forEach(item => item.classList.remove('active'));
                listItem.classList.add('active');
                
                // Display the selected presentation
                displayViewer(pres.file_path);
            });

            pptList.appendChild(listItem);

            // Automatically select and view the very first presentation in the list
            if (index === 0) {
                listItem.click();
            }
        });
    }

    /**
    * Displays the Microsoft PPT Viewer in the main content area.
    * @param {string} filePath - The path of the file in Supabase Storage.
    */
    function displayViewer(filePath) {
        // Hide the initial welcome message
        welcomeMessage.style.display = 'none';

        // 1. Get the public URL for our file from Supabase Storage
        const { data } = supabase
            .storage
            .from('ppts')
            .getPublicUrl(filePath);

        const publicUrl = data.publicUrl;

        // 2. Construct the full Microsoft Viewer URL
        const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;

        // 3. Create an iframe and display it
        viewerContainer.innerHTML = `<iframe id="viewer-iframe" src="${viewerUrl}" frameborder="0"></iframe>`;
    }


    /**
    * Handles the file upload process when the form is submitted.
    * @param {Event} event - The form submission event.
    */
    async function handleUpload(event) {
        console.log('Upload function started!'); // <-- ADD THIS LINE
        // Prevent the form from refreshing the page
        event.preventDefault();

        const uploaderName = uploaderNameInput.value.trim();
        const file = pptFileInput.files[0];

        // Basic validation
        if (!uploaderName || !file) {
            uploadStatus.textContent = 'Please fill in your name and choose a file.';
            return;
        }

        uploadStatus.textContent = 'Uploading... Please wait.';
        
        try {
            // 1. Upload the file to Supabase Storage
            // We add a timestamp to the filename to avoid overwriting files with the same name
            const fileName = `${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('ppts')
                .upload(fileName, file);

            if (uploadError) {
                throw uploadError; // Pass the error to the catch block
            }

            // 2. If upload is successful, insert a record into the database
            const { error: insertError } = await supabase
                .from('presentations')
                .insert([
                    {
                        uploader_name: uploaderName,
                        file_name: file.name, // The original file name
                        file_path: fileName, // The unique path in storage
                    },
                ]);
            
            if (insertError) {
                throw insertError; // Pass the error to the catch block
            }

            // 3. If everything is successful:
            uploadStatus.textContent = 'Upload successful!';
            uploadForm.reset(); // Clear the form fields
            
            // Refresh the list of presentations to show the new one
            fetchPresentations();

            // Hide the success message after a few seconds
            setTimeout(() => {
                uploadStatus.textContent = '';
            }, 5000);

        } catch (error) {
            console.error('Upload failed:', error);
            uploadStatus.textContent = `Upload failed: ${error.message}`;
        }
    }


    // ===================================================================================
    // === 4. EVENT LISTENERS: Connect our functions to user actions =====================
    // ===================================================================================

    // Call handleUpload when the form is submitted
    uploadForm.addEventListener('submit', handleUpload);


    // ===================================================================================
    // === 5. INITIALIZATION: What happens when the page first loads =====================
    // ===================================================================================

    // Fetch and display the initial list of presentations as soon as the page is ready
    fetchPresentations();