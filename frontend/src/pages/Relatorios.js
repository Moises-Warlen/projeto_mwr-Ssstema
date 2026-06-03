import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Relatorios() {
    const [filtros, setFiltros] = useState({ cliente_id: '', data_inicio: '', data_fim: '', categoria_id: '' });
    const [mostrarTempo, setMostrarTempo] = useState(false);
    const [mostrarDeslocamento, setMostrarDeslocamento] = useState(false);
    const [resultados, setResultados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [clienteSelecionadoNome, setClienteSelecionadoNome] = useState('');
    const relatorioRef = useRef();

    useEffect(() => {
        const load = async () => {
            const [cli, cat] = await Promise.all([api.get('/clientes'), api.get('/categorias')]);
            setClientes(cli.data);
            setCategorias(cat.data);
        };
        load();
    }, []);

    // Atualizar nome do cliente quando o filtro mudar
    useEffect(() => {
        if (filtros.cliente_id) {
            const cliente = clientes.find(c => c.id == filtros.cliente_id);
            setClienteSelecionadoNome(cliente ? cliente.nome : '');
        } else {
            setClienteSelecionadoNome('Todos os clientes');
        }
    }, [filtros.cliente_id, clientes]);

    const gerarRelatorio = async () => {
        const res = await api.get('/relatorios', { params: filtros });
        setResultados(res.data.dados || []);
    };

    const gerarPDFBlob = async () => {
        const element = relatorioRef.current;
        if (!element) return null;
        // Clonar para não interferir na exibição
        const clone = element.cloneNode(true);
        clone.style.width = '100%';
        clone.style.backgroundColor = 'white';
        clone.style.padding = '20px';
        document.body.appendChild(clone);
        const canvas = await html2canvas(clone, { scale: 2, backgroundColor: '#ffffff' });
        document.body.removeChild(clone);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgWidth = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        return pdf.output('blob');
    };

    const enviarWhatsAppComPDF = async () => {
        if (resultados.length === 0) {
            alert('Nenhum dado para compartilhar. Gere o relatório primeiro.');
            return;
        }

        // Gerar PDF
        const pdfBlob = await gerarPDFBlob();
        if (!pdfBlob) {
            alert('Erro ao gerar PDF');
            return;
        }

        const file = new File([pdfBlob], 'relatorio_servicos.pdf', { type: 'application/pdf' });

        // Verificar se o navegador suporta compartilhamento de arquivos
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Relatório de Serviços',
                    text: `Relatório gerado em ${new Date().toLocaleString()}`,
                    files: [file]
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    alert('Erro ao compartilhar: ' + err.message);
                }
            }
        } else {
            // Fallback: baixar o PDF e instruir o usuário
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_servicos.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('PDF salvo. Envie-o manualmente pelo WhatsApp.');
        }
    };

    const totalGeral = () => resultados.reduce((acc, r) => acc + (r.total_servico || 0), 0).toFixed(2);
    const totalTempo = () => {
        if (!mostrarTempo) return null;
        const seg = resultados.reduce((acc, r) => acc + (r.tempo_acumulado_segundos || 0), 0);
        return `${Math.floor(seg/3600)}h ${Math.floor((seg%3600)/60)}min`;
    };

    // Formatar período para exibição no cabeçalho do relatório
    const periodoTexto = () => {
        if (filtros.data_inicio && filtros.data_fim) {
            return `${filtros.data_inicio} até ${filtros.data_fim}`;
        }
        return 'Todo período';
    };

    return (
        <div>
            <h2>Relatórios de Serviços Concluídos</h2>
            <div className="filtros-container">
                <select onChange={e => setFiltros({...filtros, cliente_id: e.target.value})}>
                    <option value="">Todos clientes</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <input type="date" onChange={e => setFiltros({...filtros, data_inicio: e.target.value})} />
                <input type="date" onChange={e => setFiltros({...filtros, data_fim: e.target.value})} />
                <select onChange={e => setFiltros({...filtros, categoria_id: e.target.value})}>
                    <option value="">Todos serviços</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <label><input type="checkbox" checked={mostrarTempo} onChange={e => setMostrarTempo(e.target.checked)} /> Mostrar tempo</label>
                <label><input type="checkbox" checked={mostrarDeslocamento} onChange={e => setMostrarDeslocamento(e.target.checked)} /> Mostrar deslocamento</label>
                <button className="btn btn-primary" onClick={gerarRelatorio}>Filtrar</button>
                {resultados.length > 0 && (
                    <>
                        <button className="btn btn-success" onClick={() => gerarPDFBlob().then(blob => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'relatorio.pdf'; a.click(); URL.revokeObjectURL(url); })}>📄 Salvar PDF</button>
                        <button className="btn btn-success" onClick={enviarWhatsAppComPDF}>📱 Enviar PDF via WhatsApp</button>
                    </>
                )}
            </div>

            <div ref={relatorioRef} className="table-responsive" style={{ background: 'white', borderRadius: '24px', padding: '1rem' }}>
                {/* Cabeçalho personalizado do relatório */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2>RELATÓRIO DE SERVIÇOS</h2>
                    <p><strong>Cliente:</strong> {clienteSelecionadoNome}</p>
                    <p><strong>Período:</strong> {periodoTexto()}</p>
                    <p><strong>Valor total:</strong> R$ {totalGeral()}</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Cliente</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Data</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Equipamento</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Serviço</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tipo</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Valor Serviço</th>
                            {mostrarDeslocamento && <th style={{ border: '1px solid #ddd', padding: '8px' }}>Deslocamento</th>}
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total</th>
                            {mostrarTempo && <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tempo</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.map(os => (
                            <tr key={os.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{os.cliente_nome}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(os.data_conclusao).toLocaleDateString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{os.equipamento} {os.modelo}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{os.servico_realizado || '—'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{os.tipo_atendimento}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>R$ {parseFloat(os.preco_final).toFixed(2)}</td>
                                {mostrarDeslocamento && <td style={{ border: '1px solid #ddd', padding: '8px' }}>R$ {parseFloat(os.valor_deslocamento).toFixed(2)}</td>}
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><strong>R$ {os.total_servico.toFixed(2)}</strong></td>
                                {mostrarTempo && <td style={{ border: '1px solid #ddd', padding: '8px' }}>{os.tempo_formatado}</td>}
                            </tr>
                        ))}
                    </tbody>
                    {resultados.length > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan={mostrarDeslocamento ? 7 : 6} style={{ textAlign: 'right', border: '1px solid #ddd', padding: '8px' }}><strong>Total Geral:</strong></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><strong>R$ {totalGeral()}</strong></td>
                                {mostrarTempo && <td style={{ border: '1px solid #ddd', padding: '8px' }}><strong>{totalTempo()}</strong></td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
                {resultados.length === 0 && <p style={{ textAlign: 'center', padding: 30 }}>Nenhum serviço concluído no período.</p>}
            </div>
        </div>
    );
}

export default Relatorios;