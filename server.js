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

app.get('/racoon-pedro.gif', (req, res) => {
    res.sendFile(path.join(__dirname, 'racoon-pedro.gif'));
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const params = {
        Bucket: 'comparations',
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).send('File upload failed');
        }
        res.send('File uploaded successfully');
    });
});

let firstObject = true;

const getLastUploadedObject = () => {
    const params = {
        TableName: 'ComparisonResults',
    };

    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.error('Error fetching last uploaded object:', err);
        } else {
            data.Items.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
            //console.table(data.Items);
            const newUploadedObject = data.Items[0];
            //console.log('Object:', newUploadedObject);
            if (firstObject) {
                lastUploadedObject = newUploadedObject;
                firstObject = false;
            }
            if (!lastUploadedObject || lastUploadedObject.Timestamp !== newUploadedObject.Timestamp) {
                lastUploadedObject = newUploadedObject;
                console.log('Updated last uploaded object:', lastUploadedObject);
                //Get the image from S3
                const params = {
                    Bucket: 'comparations',
                    Key: lastUploadedObject.ComparisonImageKey
                };
                s3.getObject(params, (err, data) => {
                    if (err) {
                        console.error('Error fetching image from S3:', err);
                    } else {
                        const image = data.Body.toString('base64');
                        lastUploadedObject.image_compared = image;
                        console.log('Image:', image);
                    }
                });


                const params2 = {
                    Bucket: 'celebrity-comparison-images',
                    Key: lastUploadedObject.MatchedFileName
                };
                s3.getObject(params2, (err, data) => {
                    if (err) {
                        console.error('Error fetching image from S3:', err);
                    } else {
                        const image = data.Body.toString('base64');
                        lastUploadedObject.image_matched = image;
                        console.log('\n\n\n\n');
                        console.log('Image:', image);
                    }
                });

                compared_face = lastUploadedObject;
            }
        }
    });
};

setInterval(getLastUploadedObject, 5000);

app.get('/results', (req, res) => {
    //JSON object to store the results
    const results = {
        compared_face: compared_face
    };
    res.json(results);
}
);



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
