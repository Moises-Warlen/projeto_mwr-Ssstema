const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const pool = require('../config/db');

// Endpoint para upload de múltiplas fotos (máx 5)
router.post('/upload', upload.array('fotos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    const imageUrls = req.files.map(file => file.path); // URL pública retornada pelo Cloudinary
    // Se você quiser salvar as URLs no banco de dados já aqui, pode fazer um INSERT
    // Mas normalmente você as guarda associadas à OS após a criação da OS.
    // Por simplicidade, retornamos as URLs e o frontend as envia depois para o endpoint /fotos/:os_id/fotos
    res.json({ success: true, urls: imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint existente para listar fotos de uma OS (não altera)
router.get('/:os_id/fotos', async (req, res) => {
  const { os_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT id, caminho_arquivo, nome_original FROM fotos_os WHERE os_id = $1', [os_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para salvar as URLs no banco (depois do upload)
router.post('/:os_id/fotos', async (req, res) => {
  const { os_id } = req.params;
  const { fotos } = req.body; // fotos é um array de URLs
  try {
    for (const url of fotos) {
      await pool.query(
        'INSERT INTO fotos_os (os_id, caminho_arquivo, nome_original) VALUES ($1, $2, $3)',
        [os_id, url, 'upload_cloudinary']
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;