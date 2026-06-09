import React, { useState, useEffect, useRef } from 'react';
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
  const [fotos, setFotos] = useState([]);
  const printRef = useRef();

  // Dados do PIX (fixos)
  const pixData = {
    nome: "MOISES WARLEN",
    chave: "moisesreisnub@hotmail.com",
    cidade: "FRANCA SP"
  };

  useEffect(() => { 
    carregarOS(); 
    carregarFotos();
  }, [id]);

  const carregarOS = async () => {
    try {
      const res = await api.get(`/os/${id}`);
      console.log('OS detalhada:', res.data);
      setOs(res.data);
      setServicoRealizado(res.data.servico_realizado || '');
      setStatus(res.data.status_os);
    } catch (err) {
      mostrarModal('Erro ao carregar detalhes', () => navigate('/'));
    }
  };

  const carregarFotos = async () => {
    try {
      const res = await api.get(`/fotos/${id}/fotos`);
      setFotos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setFotos([]);
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

  // Verificar se é celular (baseado no equipamento)
  const isCelular = () => {
    if (!os?.equipamento) return false;
    const eq = os.equipamento.toLowerCase();
    return eq.includes('celular') || eq.includes('iphone') || eq.includes('smartphone') || eq.includes('samsung') || eq.includes('motorola') || eq.includes('xiaomi');
  };

  const obterUrlFotoImpressao = (caminho) => {
    if (!caminho) return '';
    if (caminho.startsWith('http')) return caminho;
    const nomeArquivo = caminho.split('\\').pop();
    return `https://projeto-mwr-ssstema-1.onrender.com/uploads/${nomeArquivo}`;
  };

  const imprimirOS = () => {
    const originalTitle = document.title;
    document.title = `OS_${os.numero_os}_${os.cliente_nome}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço #${os.numero_os}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 15px; 
            background: white; 
            font-size: 12px;
          }
          .print-container { 
            max-width: 1000px; 
            margin: 0 auto; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            padding-bottom: 10px; 
            border-bottom: 2px solid #007bff; 
          }
          .header h1 { 
            color: #1e3c72; 
            margin-bottom: 5px; 
            font-size: 18px;
          }
          .header p { 
            color: #666; 
            font-size: 10px; 
          }
          .info-section { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
            margin-bottom: 15px; 
          }
          .info-card { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 8px; 
            border-left: 3px solid #007bff; 
          }
          .info-card h3 { 
            margin-bottom: 8px; 
            color: #007bff; 
            font-size: 12px; 
          }
          .info-card p { 
            margin: 3px 0; 
            font-size: 11px; 
          }
          .servico-section { 
            background: #fff3cd; 
            padding: 10px; 
            border-radius: 8px; 
            margin-bottom: 15px; 
            border-left: 3px solid #ffc107; 
          }
          .servico-section h3 { 
            color: #856404; 
            margin-bottom: 8px; 
            font-size: 12px;
          }
          .servico-section p { 
            margin: 3px 0; 
            line-height: 1.4; 
            font-size: 11px;
          }
          .fotos-section { 
            margin-bottom: 15px; 
          }
          .fotos-section h3 { 
            margin-bottom: 10px; 
            color: #28a745; 
            font-size: 12px;
          }
          .fotos-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); 
            gap: 8px; 
          }
          .foto-item { 
            border: 1px solid #ddd; 
            border-radius: 6px; 
            overflow: hidden; 
          }
          .foto-item img { 
            width: 100%; 
            height: 70px; 
            object-fit: cover; 
          }
          .pix-section { 
            background: #e8f4fd; 
            padding: 10px; 
            border-radius: 8px; 
            margin-bottom: 15px; 
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .pix-section h3 { 
            color: #0056b3; 
            margin-bottom: 5px; 
            font-size: 12px;
          }
          .pix-section p { 
            font-size: 10px; 
            margin: 3px 0;
          }
          .pix-info {
            text-align: left;
            flex: 2;
          }
          .pix-qr {
            text-align: center;
            flex: 1;
          }
          .pix-qr img { 
            width: 80px; 
            height: 80px; 
          }
          .footer { 
            text-align: center; 
            margin-top: 15px; 
            padding-top: 10px; 
            border-top: 1px solid #ddd; 
            font-size: 10px; 
            color: #666; 
          }
          .status-badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 15px; 
            font-size: 10px; 
            font-weight: bold; 
          }
          .status-concluido { 
            background: #28a745; 
            color: white; 
          }
          .status-aberto { 
            background: #ffc107; 
            color: black; 
          }
          @media print {
            body { 
              padding: 0; 
              margin: 0; 
            }
            .no-print { 
              display: none; 
            }
            .pix-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .info-card, .servico-section, .fotos-section {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>MWR SISTEMA - ORDEM DE SERVIÇO</h1>
            <p>Documento gerado eletronicamente - Data: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="info-section">
            <div class="info-card">
              <h3>📋 INFORMAÇÕES GERAIS</h3>
              <p><strong>Nº OS:</strong> ${os.numero_os}</p>
              <p><strong>Cliente:</strong> ${os.cliente_nome}</p>
              <p><strong>Data Abertura:</strong> ${new Date(os.data_abertura).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span class="status-badge ${os.status_os === 'concluido' ? 'status-concluido' : 'status-aberto'}">${os.status_os === 'concluido' ? 'CONCLUÍDO' : 'ABERTO'}</span></p>
              <p><strong>Tipo:</strong> ${os.tipo_atendimento === 'presencial' ? 'Presencial' : 'Remoto'}</p>
            </div>
            <div class="info-card">
              <h3>🛠️ EQUIPAMENTO</h3>
              <p><strong>Equipamento:</strong> ${os.equipamento || '—'}</p>
              <p><strong>Modelo:</strong> ${os.modelo || '—'}</p>
              ${isCelular() && os.imei ? `<p><strong>IMEI:</strong> ${os.imei}</p>` : ''}
              <p><strong>Defeito:</strong> ${os.defeito || '—'}</p>
            </div>
            <div class="info-card">
              <h3>💰 VALORES</h3>
              <p><strong>Preço Serviço:</strong> R$ ${precoServico.toFixed(2)}</p>
              <p><strong>Deslocamento:</strong> R$ ${valorDeslocamento.toFixed(2)}</p>
              <p><strong>TOTAL:</strong> <strong style="color: #28a745;">R$ ${total.toFixed(2)}</strong></p>
            </div>
          </div>
          
          <div class="servico-section">
            <h3>🔧 SERVIÇO REALIZADO</h3>
            <p>${servicoRealizado || 'Nenhum serviço registrado ainda.'}</p>
          </div>
          
          <div class="fotos-section">
            <h3>📸 FOTOS (${fotos.length})</h3>
            <div class="fotos-grid">
              ${fotos.map(foto => `
                <div class="foto-item">
                  <img src="${obterUrlFotoImpressao(foto.caminho_arquivo)}" alt="Foto" />
                </div>
              `).join('')}
            </div>
            ${fotos.length === 0 ? '<p style="color: #666; font-size: 10px;">Nenhuma foto anexada.</p>' : ''}
          </div>
          
          <div class="pix-section">
            <div class="pix-info">
              <h3>💳 PAGAMENTO VIA PIX</h3>
              <p><strong>Chave (Email):</strong> ${pixData.chave}</p>
              <p><strong>Valor:</strong> <strong style="color: #28a745;">R$ ${total.toFixed(2)}</strong></p>
              <p style="font-size: 9px;">Copie a chave ou use o QR Code ao lado</p>
            </div>
            <div class="pix-qr">
              <img src="/pix.png" alt="QR Code PIX" style="width: 80px; height: 80px;" />
            </div>
          </div>
          
          <div class="footer">
            <p>Assinatura do Cliente: ______________________________</p>
            <p style="margin-top: 5px;">Gerado por mwrSistema</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 10px;" class="no-print">
          <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Imprimir</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    document.title = originalTitle;
  };

  if (!os) return <div style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</div>;

  const valorDeslocamento = parseFloat(os.valor_deslocamento) || 0;
  const precoServico = parseFloat(os.preco_final) || 0;
  const total = precoServico + valorDeslocamento;

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div ref={printRef} style={{ display: 'none' }}></div>
      
      <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        Detalhes da OS #{os.numero_os}
        <button className="btn btn-primary" onClick={imprimirOS} style={{ background: '#17a2b8' }}>
          🖨️ Imprimir OS
        </button>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 15, margin: '20px 0' }}>
        <div><strong>Cliente:</strong> {os.cliente_nome}</div>
        <div><strong>Equipamento:</strong> {os.equipamento} {os.modelo}</div>
        {isCelular() && os.imei && (
          <div><strong>IMEI:</strong> {os.imei}</div>
        )}
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

      {/* Seção PIX com QR Code fixo (imagem PNG) */}
      <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '10px', margin: '20px 0', textAlign: 'center' }}>
        <h3 style={{ color: '#0056b3' }}>💳 Pagamento via PIX</h3>
        <p><strong>Chave PIX (Email):</strong> {pixData.chave}</p>
        <p><strong>Valor:</strong> R$ {total.toFixed(2)}</p>
        <img 
          src="/pix.png" 
          alt="QR Code PIX" 
          style={{ width: '150px', height: '150px', marginTop: '10px', cursor: 'pointer' }}
          onClick={() => navigator.clipboard.writeText(pixData.chave) && alert('Chave PIX copiada!')}
          onError={(e) => {
            console.error('Erro ao carregar imagem PIX');
            e.target.style.display = 'none';
            alert('QR Code não encontrado. Clique para copiar a chave PIX.');
          }}
        />
        <p style={{ fontSize: '12px', marginTop: '10px' }}>
          Escaneie o QR Code com o app do seu banco ou clique para copiar a chave
        </p>
      </div>

      <Cronometro osId={id} />
      <UploadFotos osId={id} />

      <div style={{ marginTop: 20 }}>
        <label><strong>Serviço realizado (editável):</strong></label>
        <textarea rows="5" value={servicoRealizado} onChange={e => setServicoRealizado(e.target.value)} style={{ width: '100%', marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 25, display: 'flex', gap: 15, flexWrap: 'wrap' }}>
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