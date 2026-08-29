const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 } // ROM'lar büyük olabileceği için limiti 5 GB yaptım
});

// DOSYA TÜRÜNÜ (PLATFORMU) ALGILAMA FONKSİYONU
function detectPlatform(filename) {
  const ext = path.extname(filename).toLowerCase();
  
  if (['.apk', '.xapk', '.apks'].includes(ext)) return 'Android Uygulama/Oyun';
  if (['.nsp', '.xci'].includes(ext)) return 'Nintendo Switch ROM';
  if (['.iso', '.bin', '.cue'].includes(ext)) return 'PlayStation ROM';
  if (['.exe', '.msi'].includes(ext)) return 'Windows Programı';
  if (['.gba', '.nes', '.smd'].includes(ext)) return 'Retro Konsol ROM';
  if (['.zip', '.rar', '.7z', '.obb'].includes(ext)) return 'Arşiv / Ek Veri';
  
  return 'Bilinmeyen / Diğer Dosya';
}

// 1. HER TÜRLÜ DOSYAYI YÜKLEME VE KATEGORİLEME
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya bulunamadı.' });
  
  const platform = detectPlatform(req.file.originalname);
  
  res.json({
    success: true,
    platform: platform, // Uygulama mağazan için dosyanın türünü döndürür
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
    name: req.file.originalname,
    size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB' // Boyutu MB cinsinden göster
  });
});

// 2. YÜKLENEN DOSYALARI LİSTELEME
app.get('/api/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Klasör okunamadı.' });
    
    const fileList = files.map(file => ({
      name: file,
      platform: detectPlatform(file),
      url: `${req.protocol}://${req.get('host')}/uploads/${file}`
    }));
    
    res.json({ success: true, files: fileList });
  });
});

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
