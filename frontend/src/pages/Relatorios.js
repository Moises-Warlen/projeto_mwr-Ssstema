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
    const relatorioRef = useRef();

    useEffect(() => {
        const load = async () => {
            try {
                const [cli, cat] = await Promise.all([api.get('/clientes'), api.get('/categorias')]);
                setClientes(Array.isArray(cli.data) ? cli.data : []);
                setCategorias(Array.isArray(cat.data) ? cat.data : []);
            } catch (err) {
                console.error(err);
                setClientes([]);
                setCategorias([]);
            }
        };
        load();
    }, []);

    const gerarRelatorio = async () => {
        try {
            const res = await api.get('/relatorios', { params: filtros });
            setResultados(Array.isArray(res.data.dados) ? res.data.dados : []);
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar relatório');
        }
    };

    const gerarPDF = async () => {
        const element = relatorioRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgWidth = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('relatorio_servicos.pdf');
    };

    // Formatar data apenas (sem hora)
    const formatarData = (dataString) => {
        if (!dataString) return '—';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const enviarWhatsApp = () => {
        if (resultados.length === 0) {
            alert('Nenhum dado para compartilhar. Gere o relatório primeiro.');
            return;
        }
        
        const totalServicos = resultados.length;
        const valorTotal = resultados.reduce((acc, r) => acc + (r.total_servico || 0), 0).toFixed(2);
        const periodo = filtros.data_inicio && filtros.data_fim ? ` de ${formatarData(filtros.data_inicio)} a ${formatarData(filtros.data_fim)}` : ' (todo período)';
        const clienteNome = filtros.cliente_id ? clientes.find(c => c.id === parseInt(filtros.cliente_id))?.nome : 'TODOS OS CLIENTES';
        
        let msg = `📊 *RELATÓRIO DE SERVIÇOS - MWR SISTEMA* 📊%0A`;
        msg += `═══════════════════════════════════════%0A`;
        msg += `📅 *Período:* ${periodo}%0A`;
        msg += `👤 *Cliente:* ${clienteNome}%0A`;
        msg += `📦 *Total de serviços:* ${totalServicos}%0A`;
        msg += `💰 *Valor total:* R$ ${valorTotal}%0A`;
        msg += `═══════════════════════════════════════%0A%0A`;
        
        msg += `📋 *DETALHES DOS SERVIÇOS:*%0A`;
        msg += `─────────────────────────────────%0A`;
        
        resultados.forEach((os, index) => {
            msg += `${index + 1}. 🗓️ *Data:* ${formatarData(os.data_conclusao)}%0A`;
            msg += `   👤 *Cliente:* ${os.cliente_nome}%0A`;
            msg += `   🔧 *Equipamento:* ${os.equipamento} ${os.modelo}%0A`;
            msg += `   ⚠️ *Defeito:* ${os.defeito?.substring(0, 50) || '—'}%0A`;
            msg += `   📝 *Serviço:* ${os.servico_realizado?.substring(0, 40) || '—'}%0A`;
            msg += `   🏷️ *Tipo:* ${os.tipo_atendimento === 'presencial' ? 'Presencial' : 'Remoto'}%0A`;
            msg += `   💰 *Valor serviço:* R$ ${parseFloat(os.preco_final).toFixed(2)}%0A`;
            if (mostrarDeslocamento && os.valor_deslocamento > 0) {
                msg += `   🚗 *Deslocamento:* R$ ${parseFloat(os.valor_deslocamento).toFixed(2)}%0A`;
            }
            msg += `   ✅ *Total:* R$ ${os.total_servico.toFixed(2)}%0A`;
            if (mostrarTempo && os.tempo_formatado) {
                msg += `   ⏱️ *Tempo gasto:* ${os.tempo_formatado}%0A`;
            }
            msg += `─────────────────────────────────%0A`;
        });
        
        msg += `%0A📊 *RESUMO FINAL*%0A`;
        msg += `═══════════════════════════════════════%0A`;
        msg += `📦 Total de serviços: ${totalServicos}%0A`;
        msg += `💰 Valor total: R$ ${valorTotal}%0A`;
        if (mostrarTempo) {
            const totalSeg = resultados.reduce((acc, r) => acc + (r.tempo_acumulado_segundos || 0), 0);
            msg += `⏱️ Tempo total: ${Math.floor(totalSeg/3600)}h ${Math.floor((totalSeg%3600)/60)}min%0A`;
        }
        msg += `%0A✨ Gerado por mwrSistema - Gestão de OS ✨`;
        
        const url = `https://wa.me/5516993250660?text=${msg}`;
        window.open(url, '_blank');
    };

    const totalGeral = () => resultados.reduce((acc, r) => acc + (r.total_servico || 0), 0).toFixed(2);
    const totalTempo = () => {
        if (!mostrarTempo) return null;
        const seg = resultados.reduce((acc, r) => acc + (r.tempo_acumulado_segundos || 0), 0);
        return `${Math.floor(seg/3600)}h ${Math.floor((seg%3600)/60)}min`;
    };

    return (
        <div>
            {/* Cabeçalho do Relatório */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ 
                    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '50px',
                    display: 'inline-block',
                    fontSize: '1.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    📊 RELATÓRIO DE SERVIÇOS
                </h1>
                <p style={{ color: '#666', marginTop: '10px' }}>
                    Sistema de Gestão de Ordens de Serviço - mwrSistema
                </p>
            </div>

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
                <button className="btn btn-primary" onClick={gerarRelatorio}>🔍 Filtrar</button>
                {resultados.length > 0 && (
                    <>
                        <button className="btn btn-success" onClick={gerarPDF}>📄 Gerar PDF</button>
                        <button className="btn btn-success" onClick={enviarWhatsApp}>📱 Enviar WhatsApp</button>
                    </>
                )}
            </div>

            <div ref={relatorioRef} className="table-responsive" style={{ background: 'white', borderRadius: '24px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* Cabeçalho da tabela */}
                <div style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #007bff' }}>
                    <h3 style={{ margin: 0, color: '#1e3c72' }}>MWR SISTEMA - RELATÓRIO DE SERVIÇOS</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>
                        Gerado em: {new Date().toLocaleString('pt-BR')}
                    </p>
                </div>
                
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Equipamento</th>
                            <th>Defeito</th>
                            <th>Serviço Realizado</th>
                            <th>Tipo</th>
                            <th>Valor Serviço</th>
                            {mostrarDeslocamento && <th>Deslocamento</th>}
                            <th>Total</th>
                            {mostrarTempo && <th>Tempo gasto</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.length === 0 ? (
                            <tr><td colSpan={mostrarDeslocamento ? 9 : 8} style={{ textAlign: 'center', padding: '40px' }}>
                                Nenhum serviço concluído no período
                            </td</tr>
                        ) : (
                            resultados.map(os => (
                                <tr key={os.id}>
                                    <td>{os.cliente_nome}</td>
                                    <td>{formatarData(os.data_conclusao)}</td>
                                    <td>{os.equipamento} {os.modelo}</td>
                                    <td>{os.defeito || '—'}</td>
                                    <td>{os.servico_realizado || '—'}</td>
                                    <td>{os.tipo_atendimento === 'presencial' ? 'Presencial' : 'Remoto'}</td>
                                    <td>R$ {parseFloat(os.preco_final).toFixed(2)}</td>
                                    {mostrarDeslocamento && <td>R$ {parseFloat(os.valor_deslocamento).toFixed(2)}</td>}
                                    <td><strong>R$ {os.total_servico.toFixed(2)}</strong></td>
                                    {mostrarTempo && <td>{os.tempo_formatado || '—'}</td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {resultados.length > 0 && (
                        <tfoot>
                            <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                                <td colSpan={mostrarDeslocamento ? 8 : 7} style={{ textAlign: 'right' }}>Total Geral:</td>
                                <td>R$ {totalGeral()}</td>
                                {mostrarTempo && <td>{totalTempo()}</td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

export default Relatorios;