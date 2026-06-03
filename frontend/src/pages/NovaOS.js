import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function NovaOS() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState({
        cliente_id: '', categoria_id: '', equipamento: '', modelo: '', imei: '',
        defeito: '', tipo_atendimento: 'presencial', estimativa_horas: '',
        preco_final: '', valor_deslocamento: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [clientesRes, catRes] = await Promise.all([api.get('/clientes'), api.get('/categorias')]);
            setClientes(clientesRes.data);
            setCategorias(catRes.data);
        };
        load();
    }, []);

    useEffect(() => {
        if (form.categoria_id) {
            const cat = categorias.find(c => c.id === parseInt(form.categoria_id));
            if (cat) {
                setForm(prev => ({
                    ...prev,
                    preco_final: cat.preco_sugerido || '',
                    estimativa_horas: cat.tempo_estimado_minutos ? (cat.tempo_estimado_minutos / 60).toFixed(2) : ''
                }));
            }
        }
    }, [form.categoria_id, categorias]);

    const isCelular = () => {
        const eq = (form.equipamento || '').toLowerCase();
        return eq.includes('celular') || eq.includes('iphone') || eq.includes('smartphone');
    };

    const gerarNumeroOS = () => {
        const ano = new Date().getFullYear();
        return `${ano}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.cliente_id) return alert('Selecione um cliente');
        setLoading(true);
        try {
            const payload = {
                ...form,
                numero_os: gerarNumeroOS(),
                estimativa_horas: form.estimativa_horas ? parseFloat(form.estimativa_horas) : null,
                preco_final: form.preco_final ? parseFloat(form.preco_final) : 0,
                valor_deslocamento: form.tipo_atendimento === 'presencial' ? (parseFloat(form.valor_deslocamento) || 0) : 0
            };
            const res = await api.post('/os', payload);
            navigate(`/os/${res.data.id}`);
        } catch (err) {
            alert('Erro ao criar OS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2>Nova Ordem de Serviço</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <select value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})} required>
                        <option value="">Cliente *</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})}>
                        <option value="">Categoria</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <input type="text" placeholder="Equipamento" value={form.equipamento} onChange={e => setForm({...form, equipamento: e.target.value})} />
                    <input type="text" placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
                    {isCelular() && (
                        <input type="text" placeholder="IMEI (celular)" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} />
                    )}
                    <textarea placeholder="Defeito relatado" rows="2" value={form.defeito} onChange={e => setForm({...form, defeito: e.target.value})} />
                    <select value={form.tipo_atendimento} onChange={e => setForm({...form, tipo_atendimento: e.target.value})}>
                        <option value="presencial">Presencial</option>
                        <option value="remoto">Remoto</option>
                    </select>
                    {form.tipo_atendimento === 'presencial' && (
                        <input type="number" step="0.01" placeholder="Valor de deslocamento (R$)" value={form.valor_deslocamento} onChange={e => setForm({...form, valor_deslocamento: e.target.value})} />
                    )}
                    <input type="number" step="0.5" placeholder="Estimativa (horas)" value={form.estimativa_horas} onChange={e => setForm({...form, estimativa_horas: e.target.value})} />
                    <input type="number" step="0.01" placeholder="Preço final (R$)" value={form.preco_final} onChange={e => setForm({...form, preco_final: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Criando...' : 'Criar OS'}</button>
            </form>
        </div>
    );
}

export default NovaOS;