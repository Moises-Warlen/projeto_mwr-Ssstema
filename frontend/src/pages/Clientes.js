import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ id: null, nome: '', telefone: '', email: '', endereco: '' });
    const [editando, setEditando] = useState(false);
    const [modalExcluir, setModalExcluir] = useState({ show: false, id: null, nome: '' });
    
    // Paginação
    const [pagina, setPagina] = useState(1);
    const itensPorPagina = 5;

    const carregar = async () => {
        try {
            const res = await api.get('/clientes');
            setClientes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setClientes([]);
        }
    };

    useEffect(() => { carregar(); }, []);

    // Calcular clientes da página atual
    const totalPaginas = Math.ceil(clientes.length / itensPorPagina);
    const clientesPagina = clientes.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) await api.put(`/clientes/${form.id}`, form);
            else await api.post('/clientes', form);
            setForm({ id: null, nome: '', telefone: '', email: '', endereco: '' });
            setEditando(false);
            await carregar();
            // Voltar para a primeira página após cadastrar
            setPagina(1);
        } catch (err) { alert('Erro ao salvar'); }
    };

    const handleEdit = (c) => { setForm(c); setEditando(true); };
    
    const confirmarExclusao = (id, nome) => setModalExcluir({ show: true, id, nome });
    const executarExclusao = async () => {
        try {
            await api.delete(`/clientes/${modalExcluir.id}`);
            await carregar();
            // Se a página atual ficou vazia, volta uma página
            if (clientesPagina.length === 1 && pagina > 1) {
                setPagina(pagina - 1);
            }
        } catch (err) { alert('Erro ao excluir cliente'); }
        finally { setModalExcluir({ show: false, id: null, nome: '' }); }
    };
    const cancelarExclusao = () => setModalExcluir({ show: false, id: null, nome: '' });

    return (
        <div className="card">
            <h2>Clientes</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input type="text" placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                <input type="text" placeholder="Telefone" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input type="text" placeholder="Endereço" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
                <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Cadastrar'}</button>
                {editando && <button type="button" className="btn btn-secondary" onClick={() => { setForm({ id: null, nome: '', telefone: '', email: '', endereco: '' }); setEditando(false); }}>Cancelar</button>}
            </form>
            
            <div className="table-responsive">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Endereço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesPagina.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Nenhum cliente cadastrado</td></tr>
                        ) : (
                            clientesPagina.map(c => (
                                <tr key={c.id}>
                                    <td>{c.nome}</td>
                                    <td>{c.telefone}</td>
                                    <td>{c.email}</td>
                                    <td>{c.endereco}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={() => handleEdit(c)}>Editar</button>
                                        <button className="btn btn-danger" onClick={() => confirmarExclusao(c.id, c.nome)}>Excluir</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Paginação */}
            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setPagina(p => Math.max(1, p - 1))} 
                        disabled={pagina === 1}
                    >
                        ◀ Anterior
                    </button>
                    <span style={{ padding: '8px 16px', background: '#f0f0f0', borderRadius: '20px' }}>
                        Página {pagina} de {totalPaginas}
                    </span>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} 
                        disabled={pagina === totalPaginas}
                    >
                        Próxima ▶
                    </button>
                </div>
            )}
            
            {modalExcluir.show && (
                <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }} onClick={cancelarExclusao}>
                    <div style={{ background:'white', padding:'24px', borderRadius:'16px', minWidth:'280px', textAlign:'center' }} onClick={e => e.stopPropagation()}>
                        <h3>Confirmar exclusão</h3>
                        <p>Tem certeza que deseja excluir o cliente <strong>{modalExcluir.nome}</strong>?</p>
                        <p style={{ fontSize:'0.85rem', color:'#dc3545' }}>Todas as OS associadas serão removidas.</p>
                        <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginTop:'24px' }}>
                            <button className="btn btn-secondary" onClick={cancelarExclusao}>Cancelar</button>
                            <button className="btn btn-danger" onClick={executarExclusao}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clientes;