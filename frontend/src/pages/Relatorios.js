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

    const enviarWhatsApp = () => {
        if (resultados.length === 0) {
            alert('Nenhum dado para compartilhar. Gere o relatório primeiro.');
            return;
        }
        const totalServicos = resultados.length;
        const valorTotal = resultados.reduce((acc, r) => acc + (r.total_servico || 0), 0).toFixed(2);
        const periodo = filtros.data_inicio && filtros.data_fim ? ` de ${filtros.data_inicio} a ${filtros.data_fim}` : '';
        const clienteNome = filtros.cliente_id ? clientes.find(c => c.id === parseInt(filtros.cliente_id))?.nome : 'todos os clientes';
        let msg = `📊 *RELATÓRIO DE SERVIÇOS*%0A`;
        msg += `Cliente: ${clienteNome}%0APeríodo: ${periodo || 'todo'}%0A`;
        msg += `Total de serviços: ${totalServicos}%0AValor total: R$ ${valorTotal}%0A%0A`;
        msg += `*Detalhes:*%0A`;
        resultados.slice(0, 10).forEach(os => {
            msg += `- ${os.data_conclusao} | ${os.cliente_nome} | ${os.servico_realizado?.substring(0,30) || '—'} | R$ ${os.total_servico.toFixed(2)}%0A`;
        });
        if (resultados.length > 10) msg += `... e mais ${resultados.length - 10} serviços.%0A`;
        msg += `%0AGerado por mwrSistema.`;
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
                        <button className="btn btn-success" onClick={gerarPDF}>📄 Gerar PDF</button>
                        <button className="btn btn-success" onClick={enviarWhatsApp}>📱 Enviar WhatsApp</button>
                    </>
                )}
            </div>

            <div ref={relatorioRef} className="table-responsive" style={{ background: 'white', borderRadius: '24px', padding: '1rem' }}>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Cliente</th><th>Data</th><th>Equipamento</th><th>Serviço Realizado</th>
                            <th>Tipo</th><th>Valor Serviço</th>
                            {mostrarDeslocamento && <th>Deslocamento</th>}
                            <th>Total</th>
                            {mostrarTempo && <th>Tempo gasto</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {resultados.length === 0 ? (
                            <tr><td colSpan={mostrarDeslocamento ? 8 : 7} style={{ textAlign: 'center', padding: '40px' }}>Nenhum serviço concluído no período</td></tr>
                        ) : (
                            resultados.map(os => (
                                <tr key={os.id}>
                                    <td>{os.cliente_nome}</td>
                                    <td>{new Date(os.data_conclusao).toLocaleDateString()}</td>
                                    <td>{os.equipamento} {os.modelo}</td>
                                    <td>{os.servico_realizado || '—'}</td>
                                    <td>{os.tipo_atendimento}</td>
                                    <td>R$ {parseFloat(os.preco_final).toFixed(2)}</td>
                                    {mostrarDeslocamento && <td>R$ {parseFloat(os.valor_deslocamento).toFixed(2)}</td>}
                                    <td><strong>R$ {os.total_servico.toFixed(2)}</strong></td>
                                    {mostrarTempo && <td>{os.tempo_formatado}</td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {resultados.length > 0 && (
                        <tfoot>
                            <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                                <td colSpan={mostrarDeslocamento ? 7 : 6} style={{ textAlign: 'right' }}>Total Geral:</td>
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