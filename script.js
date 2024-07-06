document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                console.log('File uploaded successfully');
                loading();
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('File upload failed');
        }
    } else {
        alert('Please choose a file to upload');
    }
});

function loading() {
    // Show the loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';

    // Get the container element
    var container = document.querySelector('.load');

    // Set a timeout to simulate a long-running task
    setTimeout(() => {
        // Hide the loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
        document.getElementById('results-div').style.display = 'flex';
        document.getElementById('img-res').style.display = 'flex';

        // Replace the container's content with the results message
        //container.innerHTML = '<p>Results</p>';

        var results = document.querySelector('.results');
        var response = [];
        var xhr = new XMLHttpRequest();

        xhr.open('GET', '/results', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                response = JSON.parse(xhr.responseText);
                
                var comparedImageHTML = `
                    <img src="data:image/jpeg;base64,${response.compared_face.image_compared}" alt="Image 1">
                `;
                var imageHTML = `
                     <img src="data:image/jpeg;base64,${response.compared_face.image_matched}" alt="Image 2">
                `;
                var messageHTML = `
                    <h1>Similarity:</h1><br><h2>${response.compared_face.Similarity.toFixed(2)}%</h2><br>
                    <h2>${response.compared_face.MatchedFileName}</h2>
                `;

                results.innerHTML = comparedImageHTML + imageHTML;
                container.innerHTML += messageHTML;
            }
        };
    }, 8000); // Simulate a 5-second task
}
