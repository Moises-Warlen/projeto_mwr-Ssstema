import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UploadFotos({ osId }) {
    const [fotos, setFotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [modalFoto, setModalFoto] = useState(null);

    const carregarFotos = async () => {
        try {
            const res = await api.get(`/fotos/${osId}/fotos`);
            setFotos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setFotos([]);
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
            const uploadRes = await api.post(`/fotos/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // 2. Extrair as URLs do Cloudinary
            const imageUrls = uploadRes.data.urls;
            
            // 3. Salvar as URLs no banco (associadas à OS)
            await api.post(`/fotos/${osId}/fotos`, { fotos: imageUrls });
            
            // 4. Recarregar a lista de fotos
            await carregarFotos();
            
            alert('Fotos enviadas com sucesso!');
        } catch (err) {
            console.error('Erro detalhado:', err);
            alert('Erro ao enviar fotos: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const obterUrlFoto = (caminho) => {
        if (!caminho) return '';
        if (caminho.startsWith('http')) return caminho;
        const nomeArquivo = caminho.split('\\').pop();
        return `https://projeto-mwr-ssstema-1.onrender.com/uploads/${nomeArquivo}`;
    };

    return (
        <div style={{ margin: '20px 0' }}>
            <h4>📸 Fotos anexadas</h4>
            <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading && <p>Enviando...</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {fotos.map(foto => (
                    <img
                        key={foto.id}
                        src={obterUrlFoto(foto.caminho_arquivo)}
                        alt="Anexo"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' }}
                        onClick={() => setModalFoto(obterUrlFoto(foto.caminho_arquivo))}
                    />
                ))}
            </div>

            {modalFoto && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        cursor: 'pointer'
                    }}
                    onClick={() => setModalFoto(null)}
                >
                    <img 
                        src={modalFoto} 
                        alt="Zoom" 
                        style={{ 
                            maxWidth: '90%', 
                            maxHeight: '90%', 
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                        }} 
                    />
                    <button
                        onClick={() => setModalFoto(null)}
                        style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            fontSize: 20,
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

export default UploadFotos;