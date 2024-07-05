const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let lastUploadedObject = null; // Variable to store the last uploaded object

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const params = {
        Bucket: 'equipo-04-cloud',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).send('File upload failed');
        }
    });
});

let firstObject = true;

const getLastUploadedObject = () => {
    const params = {
        TableName: 'ComparisonResults',
        Limit: 1,
        ScanIndexForward: false,
    };

    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.error('Error fetching last uploaded object:', err);
        } else {
            const newUploadedObject = data.Items[0];
            if (firstObject) {
                lastUploadedObject = newUploadedObject;
                firstObject = false;
            }
            if (!lastUploadedObject || lastUploadedObject.id !== newUploadedObject.id) {
                lastUploadedObject = newUploadedObject;
                console.log('Updated last uploaded object:', lastUploadedObject);
            }
        }
    });
};

setInterval(getLastUploadedObject, 5000);



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
