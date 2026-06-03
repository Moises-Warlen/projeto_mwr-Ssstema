import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UploadFotos({ osId }) {
  const [fotos, setFotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const carregarFotos = async () => {
    try {
      const res = await api.get(`/fotos/${osId}/fotos`);
      setFotos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (osId) carregarFotos();
  }, [osId]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append('fotos', file));
    setUploading(true);
    try {
      // 1. Upload para o Cloudinary via backend
      const uploadRes = await api.post('/fotos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const urls = uploadRes.data.urls;
      // 2. Salvar as URLs no banco associadas à OS
      await api.post(`/fotos/${osId}/fotos`, { fotos: urls });
      // 3. Recarregar lista
      await carregarFotos();
    } catch (err) {
      alert('Erro ao enviar fotos');
    } finally {
      setUploading(false);
    }
  };

  const obterUrlFoto = (caminho) => {
    // caminho já é a URL do Cloudinary
    return caminho;
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <h4>Fotos anexadas</h4>
      <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Enviando...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
        {fotos.map(foto => (
          <img
            key={foto.id}
            src={obterUrlFoto(foto.caminho_arquivo)}
            alt="Anexo"
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => window.open(foto.caminho_arquivo, '_blank')}
          />
        ))}
      </div>
    </div>
  );
}

export default UploadFotos;