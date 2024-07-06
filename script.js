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
                alert('File uploaded successfully');
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
    // Get the container element
    var container = document.querySelector('.load');

    container.innerHTML = '';

    // Create an image element for the loading GIF
    var loadingImage = document.createElement('img');
    loadingImage.src = './racoon-pedro.gif'; // Replace with your actual loading GIF path
    loadingImage.alt = 'Loading...';

    // Set the image's width and height
    loadingImage.style.width = '450px';
    loadingImage.style.height = '350px';

    // Append the loading image to the container
    container.appendChild(loadingImage);

    // Set a timeout to simulate a long-running task
    setTimeout(() => {
        // Clear the container's content
        container.innerHTML = '';

        // Create a paragraph element to display the message
        var message = document.createElement('p');
        message.textContent = 'Results'; // Replace with your actual message

        // Append the message to the container 
        container.appendChild(message);
        var results = document.querySelector('.results');
        // Create two cols to insert images
        var response = [];
        xhr = new XMLHttpRequest();

        xhr.open('GET', '/results', true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.table(JSON.parse(xhr.responseText));
                response = JSON.parse(xhr.responseText);
                
                console.table(response);
                console.log(response.compared_face.image);
                compared_image = document.createElement('img');
                compared_image.src = 'data:image/jpeg;base64,' + response.compared_face.image_compared;
                compared_image.alt = 'Image 1';
                compared_image.style.width = '200px';
                compared_image.style.height = '200px';
                results.appendChild(compared_image);

                // Create the second image
                var image = document.createElement('img');
                image.src = 'data:image/jpeg;base64,' + response.compared_face.image_matched;
                image.alt = 'Image 2';
                image.style.width = '200px';
                image.style.height = '200px';
                results.appendChild(image);

                message.innerHTML = 'Similarity: ' + response.compared_face.Similarity.toFixed(2) + '%<br>Your similarity is with: ' + response.compared_face.MatchedFileName;
                container.appendChild(message);
                

                
                        
                container.appendChild



           
                    
        }
        }

        



        // results.innerHTML = '<div class="row">\
        //                         <img src="racoon-pedro.gif" alt="Image 1" style="heigth:200px; width:200px">\
        //                         <img src="racoon-pedro.gif" alt="Image 2" style="heigth: 200px; width:200px">\
        //                     </div>';
        
    }, 5000); 
    // Simulate a 5-second task
}
