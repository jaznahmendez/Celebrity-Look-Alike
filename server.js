const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const app = express();
const port = 3000;

// Configure AWS SDK
AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'YOUR_REGION'
});

const s3 = new AWS.S3();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve CSS and JS files
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// Upload file to S3
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const params = {
        Bucket: 'YOUR_BUCKET_NAME',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // Adjust permissions as needed
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).send('File upload failed');
        }
        res.send('File uploaded successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
