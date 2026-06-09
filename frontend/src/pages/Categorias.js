import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState({ id: null, nome: '', preco_sugerido: '', tempo_estimado_minutos: '' });
    const [editando, setEditando] = useState(false);
    const [modalExcluir, setModalExcluir] = useState({ show: false, id: null, nome: '' });
    
    // Paginação
    const [pagina, setPagina] = useState(1);
    const itensPorPagina = 5;

    const carregar = async () => {
        try {
            const res = await api.get('/categorias');
            setCategorias(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setCategorias([]);
        }
    };
    
    useEffect(() => { carregar(); }, []);

    // Calcular categorias da página atual
    const totalPaginas = Math.ceil(categorias.length / itensPorPagina);
    const categoriasPagina = categorias.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                nome: form.nome, 
                preco_sugerido: form.preco_sugerido ? parseFloat(form.preco_sugerido) : null, 
                tempo_estimado_minutos: form.tempo_estimado_minutos ? parseInt(form.tempo_estimado_minutos) : null 
            };
            if (editando) await api.put(`/categorias/${form.id}`, payload);
            else await api.post('/categorias', payload);
            setForm({ id: null, nome: '', preco_sugerido: '', tempo_estimado_minutos: '' });
            setEditando(false);
            await carregar();
            // Voltar para a primeira página após cadastrar
            setPagina(1);
        } catch (err) { 
            console.error(err);
            alert('Erro ao salvar'); 
        }
    };

    const handleEdit = (c) => { 
        setForm({ 
            id: c.id, 
            nome: c.nome, 
            preco_sugerido: c.preco_sugerido || '', 
            tempo_estimado_minutos: c.tempo_estimado_minutos || '' 
        }); 
        setEditando(true); 
    };
    
    const confirmarExclusao = (id, nome) => setModalExcluir({ show: true, id, nome });
    
    const executarExclusao = async () => {
        try { 
            await api.delete(`/categorias/${modalExcluir.id}`); 
            await carregar();
            // Se após excluir a página ficou sem itens e não é a primeira, volta uma página
            const novasCategorias = categorias.filter(c => c.id !== modalExcluir.id);
            const novasPaginas = Math.ceil(novasCategorias.length / itensPorPagina);
            if (pagina > novasPaginas && pagina > 1) {
                setPagina(pagina - 1);
            }
        } catch (err) { 
            console.error(err);
            alert('Erro ao excluir categoria'); 
        } finally { 
            setModalExcluir({ show: false, id: null, nome: '' }); 
        }
    };
    
    const cancelarExclusao = () => setModalExcluir({ show: false, id: null, nome: '' });

    return (
        <div className="card">
            <h2>Categorias de Serviço</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Nome" 
                    value={form.nome} 
                    onChange={e => setForm({...form, nome: e.target.value})} 
                    required 
                />
                <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Preço sugerido" 
                    value={form.preco_sugerido} 
                    onChange={e => setForm({...form, preco_sugerido: e.target.value})} 
                />
                <input 
                    type="number" 
                    placeholder="Tempo (min)" 
                    value={form.tempo_estimado_minutos} 
                    onChange={e => setForm({...form, tempo_estimado_minutos: e.target.value})} 
                />
                <button type="submit" className="btn btn-primary">
                    {editando ? 'Atualizar' : 'Cadastrar'}
                </button>
                {editando && (
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => { 
                            setForm({ id: null, nome: '', preco_sugerido: '', tempo_estimado_minutos: '' }); 
                            setEditando(false); 
                        }}
                    >
                        Cancelar
                    </button>
                )}
            </form>
            
            <div className="table-responsive">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Preço sugerido</th>
                            <th>Tempo (min)</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoriasPagina.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                Nenhuma categoria cadastrada
                            </td></tr>
                        ) : (
                            categoriasPagina.map(c => (
                                <tr key={c.id}>
                                    <td>{c.nome}</td>
                                    <td>R$ {c.preco_sugerido}</td>
                                    <td>{c.tempo_estimado_minutos}</td>
                                    <td>
                                        <button 
                                            className="btn btn-warning" 
                                            onClick={() => handleEdit(c)}
                                            style={{ marginRight: '5px' }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={() => confirmarExclusao(c.id, c.nome)}
                                        >
                                            Excluir
                                        </button>
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
            
            {/* Modal de confirmação de exclusão */}
            {modalExcluir.show && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        background: 'rgba(0,0,0,0.5)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 2000 
                    }} 
                    onClick={cancelarExclusao}
                >
                    <div 
                        style={{ 
                            background: 'white', 
                            padding: '24px', 
                            borderRadius: '16px', 
                            minWidth: '280px', 
                            textAlign: 'center' 
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>Confirmar exclusão</h3>
                        <p>Tem certeza que deseja excluir a categoria <strong>{modalExcluir.nome}</strong>?</p>
                        <p style={{ fontSize: '0.85rem', color: '#dc3545' }}>
                            As OS que usam esta categoria perderão a referência.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                            <button className="btn btn-secondary" onClick={cancelarExclusao}>
                                Cancelar
                            </button>
                            <button className="btn btn-danger" onClick={executarExclusao}>
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Categorias;