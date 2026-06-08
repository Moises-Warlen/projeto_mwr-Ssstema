import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const [osList, setOsList] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [filtroNumero, setFiltroNumero] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroClienteNome, setFiltroClienteNome] = useState('');
    const [pagina, setPagina] = useState(1);
    const itensPorPagina = 5;

    const [totalAbertas, setTotalAbertas] = useState(0);
    const [totalConcluidas, setTotalConcluidas] = useState(0);
    const [faturamentoMesAtual, setFaturamentoMesAtual] = useState(0);

    const [tipoFiltroFaturamento, setTipoFiltroFaturamento] = useState('geral');
    const [dataDia, setDataDia] = useState(new Date().toISOString().slice(0, 10));
    const [mesAno, setMesAno] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [clienteIdFiltro, setClienteIdFiltro] = useState('');
    const [clientePeriodo, setClientePeriodo] = useState('total');
    const [clienteDataDia, setClienteDataDia] = useState(new Date().toISOString().slice(0, 10));
    const [clienteMesAno, setClienteMesAno] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [faturamentoFiltrado, setFaturamentoFiltrado] = useState(0);

    const carregarDados = async () => {
        try {
            const [osRes, clientesRes] = await Promise.all([
                api.get('/os'),
                api.get('/clientes')
            ]);
            
            // Garantir que os dados são arrays
            const osData = Array.isArray(osRes.data) ? osRes.data : [];
            const clientesData = Array.isArray(clientesRes.data) ? clientesRes.data : [];
            
            setOsList(osData);
            setClientes(clientesData);
            calcularEstatisticas(osData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setOsList([]);
            setClientes([]);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const calcularEstatisticas = (data) => {
        const abertas = Array.isArray(data) ? data.filter(os => os.status_os !== 'concluido').length : 0;
        const concluidas = Array.isArray(data) ? data.filter(os => os.status_os === 'concluido').length : 0;
        setTotalAbertas(abertas);
        setTotalConcluidas(concluidas);

        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const fatMes = Array.isArray(data) ? data.reduce((acc, os) => {
            if (os.status_os === 'concluido' && os.data_conclusao) {
                const dataConc = new Date(os.data_conclusao);
                if (dataConc.getMonth() === mesAtual && dataConc.getFullYear() === anoAtual) {
                    const total = (parseFloat(os.preco_final) || 0) + (parseFloat(os.valor_deslocamento) || 0);
                    return acc + total;
                }
            }
            return acc;
        }, 0) : 0;
        setFaturamentoMesAtual(fatMes);
    };

    useEffect(() => {
        if (!Array.isArray(osList) || osList.length === 0) return;
        
        let base = osList.filter(os => os.status_os === 'concluido');

        if (tipoFiltroFaturamento === 'dia') {
            base = base.filter(os => os.data_conclusao === dataDia);
        } else if (tipoFiltroFaturamento === 'mes') {
            const [ano, mes] = mesAno.split('-');
            base = base.filter(os => {
                if (!os.data_conclusao) return false;
                const d = new Date(os.data_conclusao);
                return d.getFullYear() === parseInt(ano) && (d.getMonth() + 1) === parseInt(mes);
            });
        } else if (tipoFiltroFaturamento === 'cliente') {
            if (!clienteIdFiltro) {
                base = [];
            } else {
                base = base.filter(os => os.cliente_id === parseInt(clienteIdFiltro));
                if (clientePeriodo === 'dia') {
                    base = base.filter(os => os.data_conclusao === clienteDataDia);
                } else if (clientePeriodo === 'mes') {
                    const [ano, mes] = clienteMesAno.split('-');
                    base = base.filter(os => {
                        if (!os.data_conclusao) return false;
                        const d = new Date(os.data_conclusao);
                        return d.getFullYear() === parseInt(ano) && (d.getMonth() + 1) === parseInt(mes);
                    });
                }
            }
        }

        const total = base.reduce((acc, os) => {
            const valor = (parseFloat(os.preco_final) || 0) + (parseFloat(os.valor_deslocamento) || 0);
            return acc + valor;
        }, 0);
        setFaturamentoFiltrado(total);
    }, [osList, tipoFiltroFaturamento, dataDia, mesAno, clienteIdFiltro, clientePeriodo, clienteDataDia, clienteMesAno]);

    const limparFiltrosFaturamento = () => {
        setTipoFiltroFaturamento('geral');
        setClienteIdFiltro('');
        setClientePeriodo('total');
        setDataDia(new Date().toISOString().slice(0, 10));
        setMesAno(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
        setClienteDataDia(new Date().toISOString().slice(0, 10));
        setClienteMesAno(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    };

    const osFiltradas = Array.isArray(osList) ? osList.filter(os => {
        if (filtroNumero && !os.numero_os?.toLowerCase().includes(filtroNumero.toLowerCase())) return false;
        if (filtroStatus === 'abertos' && os.status_os === 'concluido') return false;
        if (filtroStatus === 'concluidos' && os.status_os !== 'concluido') return false;
        if (filtroClienteNome && !os.cliente_nome?.toLowerCase().includes(filtroClienteNome.toLowerCase())) return false;
        return true;
    }) : [];

    const totalPaginas = Math.ceil(osFiltradas.length / itensPorPagina);
    const osExibidas = osFiltradas.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="card" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e3c72, #2a5298)', color: 'white', padding: '12px 28px', borderRadius: '60px', fontSize: '1.8rem' }}>
                    📊 DASHBOARD - MWR SISTEMA
                </h1>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div className="card" style={{ width: '200px', textAlign: 'center', borderTop: '5px solid #ffc107' }}>
                    <div style={{ fontSize: '2.2rem' }}>🟠</div>
                    <div><strong>OS Abertas</strong></div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalAbertas}</div>
                </div>
                <div className="card" style={{ width: '200px', textAlign: 'center', borderTop: '5px solid #28a745' }}>
                    <div style={{ fontSize: '2.2rem' }}>✅</div>
                    <div><strong>OS Concluídas</strong></div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalConcluidas}</div>
                </div>
                <div className="card" style={{ width: '200px', textAlign: 'center', borderTop: '5px solid #007bff' }}>
                    <div style={{ fontSize: '2.2rem' }}>💰</div>
                    <div><strong>Faturamento do mês</strong></div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>R$ {faturamentoMesAtual.toFixed(2)}</div>
                </div>
            </div>

            <div className="card">
                <h3>🔍 Consultar faturamento</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <button className="btn btn-primary" onClick={() => setTipoFiltroFaturamento('geral')}>📊 Total acumulado</button>
                    <div>
                        <button className="btn btn-primary" onClick={() => setTipoFiltroFaturamento('dia')}>📅 Por dia</button>
                        {tipoFiltroFaturamento === 'dia' && <input type="date" value={dataDia} onChange={e => setDataDia(e.target.value)} style={{ marginLeft: '8px' }} />}
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={() => setTipoFiltroFaturamento('mes')}>📆 Por mês</button>
                        {tipoFiltroFaturamento === 'mes' && <input type="month" value={mesAno} onChange={e => setMesAno(e.target.value)} style={{ marginLeft: '8px' }} />}
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={() => setTipoFiltroFaturamento('cliente')}>👤 Por cliente</button>
                        {tipoFiltroFaturamento === 'cliente' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                                <select value={clienteIdFiltro} onChange={e => setClienteIdFiltro(e.target.value)}>
                                    <option value="">Selecione um cliente</option>
                                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                                <label><input type="radio" name="cp" value="total" checked={clientePeriodo === 'total'} onChange={() => setClientePeriodo('total')} /> Total</label>
                                <label><input type="radio" name="cp" value="dia" checked={clientePeriodo === 'dia'} onChange={() => setClientePeriodo('dia')} /> Dia</label>
                                {clientePeriodo === 'dia' && <input type="date" value={clienteDataDia} onChange={e => setClienteDataDia(e.target.value)} />}
                                <label><input type="radio" name="cp" value="mes" checked={clientePeriodo === 'mes'} onChange={() => setClientePeriodo('mes')} /> Mês</label>
                                {clientePeriodo === 'mes' && <input type="month" value={clienteMesAno} onChange={e => setClienteMesAno(e.target.value)} />}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={limparFiltrosFaturamento}>🗑️ Limpar</button>
                </div>
                <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '12px' }}>
                    <strong>Valor total:</strong> R$ {faturamentoFiltrado.toFixed(2)}
                </div>
            </div>

            <div className="filtros-container">
                <input type="text" placeholder="🔍 Nº da OS" value={filtroNumero} onChange={e => setFiltroNumero(e.target.value)} style={{ flex: 1 }} />
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                    <option value="todos">Todos status</option>
                    <option value="abertos">Somente abertos</option>
                    <option value="concluidos">Somente concluídos</option>
                </select>
                <input type="text" placeholder="👤 Nome do cliente" value={filtroClienteNome} onChange={e => setFiltroClienteNome(e.target.value)} style={{ flex: 1 }} />
            </div>

            <div className="table-responsive">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr><th>Nº OS</th><th>Cliente</th><th>Equipamento</th><th>Status</th><th>Valor Total (R$)</th><th>Ações</th></tr>
                    </thead>
                    
                       <tbody>
    {osExibidas.length === 0 ? (
        <tr>
            <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Nenhuma OS encontrada</td>
        </tr>
    ) : (
        osExibidas.map(os => {
            const totalValor = (parseFloat(os.preco_final) || 0) + (parseFloat(os.valor_deslocamento) || 0);
            return (
                <tr key={os.id}>
                    <td>{os.numero_os}</td>
                    <td>{os.cliente_nome}</td>
                    <td>{os.equipamento} {os.modelo}</td>
                    <td><span style={{ backgroundColor: os.status_os === 'concluido' ? '#28a745' : '#ffc107', padding: '4px 10px', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold' }}>
                        {os.status_os === 'concluido' ? 'CONCLUÍDO' : 'ABERTO'}
                    </span></td>
                    <td>R$ {totalValor.toFixed(2)}</td>
                    <td>
                        <Link to={`/os/${os.id}`}><button className="btn btn-primary" style={{ marginRight: '5px' }}>Ver</button></Link>
                        <Link to={`/os/editar/${os.id}`}><button className="btn btn-warning">Editar</button></Link>
                    </td>
                </tr>
            );
        })
    )}
</tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>Anterior</button>
                    <span>Página {pagina} de {totalPaginas}</span>
                    <button className="btn btn-secondary" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>Próxima</button>
                </div>
            )}
        </div>
    );
}

export default Home;