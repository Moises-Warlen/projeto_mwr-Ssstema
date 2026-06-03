import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Cronometro from '../components/Cronometro';
import UploadFotos from '../components/UploadFotos';

function DetalhesOS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState(null);
  const [servicoRealizado, setServicoRealizado] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState({ visible: false, message: '', callback: null });

  useEffect(() => { carregarOS(); }, [id]);

  const carregarOS = async () => {
    try {
      const res = await api.get(`/os/${id}`);
      console.log('OS detalhada:', res.data); // debug
      setOs(res.data);
      setServicoRealizado(res.data.servico_realizado || '');
      setStatus(res.data.status_os);
    } catch (err) {
      mostrarModal('Erro ao carregar detalhes', () => navigate('/'));
    }
  };

  const mostrarModal = (msg, callback) => {
    setModal({ visible: true, message: msg, callback });
  };
  const fecharModal = () => {
    if (modal.callback) modal.callback();
    setModal({ visible: false, message: '', callback: null });
  };

  const salvar = async () => {
    try {
      await api.put(`/os/${id}`, { servico_realizado: servicoRealizado, status_os: status });
      mostrarModal('Alterações salvas!', () => navigate('/'));
    } catch (err) {
      mostrarModal('Erro ao salvar');
    }
  };

  if (!os) return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</div>;

  const valorDeslocamento = parseFloat(os.valor_deslocamento) || 0;
  const precoServico = parseFloat(os.preco_final) || 0;
  const total = precoServico + valorDeslocamento;

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: 15 }}>Detalhes da OS #{os.numero_os}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 15, margin: '20px 0' }}>
        <div><strong>Cliente:</strong> {os.cliente_nome}</div>
        <div><strong>Equipamento:</strong> {os.equipamento} {os.modelo}</div>
        <div><strong>IMEI:</strong> {os.imei || '—'}</div>
        <div><strong>Defeito:</strong> {os.defeito}</div>
        <div><strong>Preço serviço:</strong> R$ {precoServico.toFixed(2)}</div>
        <div><strong>Deslocamento:</strong> R$ {valorDeslocamento.toFixed(2)}</div>
        <div><strong>Total a receber:</strong> <span style={{ fontWeight: 'bold', color: '#28a745' }}>R$ {total.toFixed(2)}</span></div>
        <div><strong>Data abertura:</strong> {new Date(os.data_abertura).toLocaleDateString()}</div>
        <div><strong>Tipo:</strong> {os.tipo_atendimento === 'presencial' ? 'Presencial' : 'Remoto'}</div>
        <div><strong>Status:</strong>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ marginLeft: 10 }}>
            <option value="aberto">Aberto</option>
            <option value="analise">Em análise</option>
            <option value="aguardando_peca">Aguardando peça</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      <Cronometro osId={id} />
      <UploadFotos osId={id} />

      <div style={{ marginTop: 20 }}>
        <label><strong>Serviço realizado (editável):</strong></label>
        <textarea rows="5" value={servicoRealizado} onChange={e => setServicoRealizado(e.target.value)} style={{ width: '100%', marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 25, display: 'flex', gap: 15 }}>
        <button className="btn btn-success" onClick={salvar}>💾 Salvar e voltar</button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>← Voltar</button>
      </div>

      {modal.visible && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={fecharModal}>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, minWidth: 250, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <p>{modal.message}</p>
            <button className="btn btn-primary" onClick={fecharModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalhesOS;