const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const convert = require('heic-jpg-exif');
const archiver = require('archiver');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.array('photos', 300), async (req, res) => {
  const files = req.files;
  const outputDir = path.join(__dirname, 'uploads', `converted_${Date.now()}`);
  fs.mkdirSync(outputDir);

  try {
    for (const file of files) {
      const inputBuffer = fs.readFileSync(file.path);
      const outputBuffer = await convert(inputBuffer);
      const originalName = path.parse(file.originalname).name; // sans l'extension
      const outputPath = path.join(outputDir, originalName + '.jpg');

      fs.writeFileSync(outputPath, outputBuffer);
      fs.unlinkSync(file.path); // clean temp
    }

    // Create ZIP
    const zipPath = outputDir + '.zip';
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();

    output.on('close', () => {
      res.download(zipPath, () => {
        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de conversion');
  }
});

app.listen(5171, () => console.log('Serveur en écoute sur http://localhost:5171'));
