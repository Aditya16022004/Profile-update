document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const previewImage = document.getElementById("preview-image");
    const imageInput = document.querySelector('input[name="profileImage"]');
    
    const viewContainer = document.getElementById("profile-container");
    const viewName = document.getElementById("view-name");
    const viewEmail = document.getElementById("view-email");
    const viewInterests = document.getElementById("view-interests");
    const viewImage = document.getElementById("view-image");
    const editBtn = document.getElementById("edit-btn");

    // Show image preview
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                previewImage.src = reader.result;
                previewImage.classList.remove("hidden");
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.classList.add("hidden");
        }
    });

    // Submit form to server and save to MongoDB
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        
        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Saving...";
            submitBtn.disabled = true;

            // Send data to server
            const response = await fetch("/save-profile", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                
                // Display the server response
                document.body.innerHTML = result;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error saving profile. Please try again.");
            
            // Reset button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = "Save Profile";
            submitBtn.disabled = false;
        }
    });

    // Back to edit mode
    editBtn.addEventListener("click", () => {
        form.classList.remove("hidden");
        viewContainer.classList.add("hidden");
    });
});
