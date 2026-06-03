import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EditarOS() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        equipamento: '', modelo: '', imei: '', defeito: '',
        preco_final: '', tipo_atendimento: 'presencial', valor_deslocamento: ''
    });

    useEffect(() => {
        const carregar = async () => {
            try {
                const res = await api.get(`/os/${id}`);
                setForm(res.data);
            } catch (err) {
                alert('Erro ao carregar OS');
                navigate('/');
            }
        };
        carregar();
    }, [id]);

    const isCelular = () => {
        const eq = (form.equipamento || '').toLowerCase();
        return eq.includes('celular') || eq.includes('iphone') || eq.includes('smartphone');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                preco_final: parseFloat(form.preco_final) || 0,
                valor_deslocamento: form.tipo_atendimento === 'presencial' ? (parseFloat(form.valor_deslocamento) || 0) : 0
            };
            await api.put(`/os/${id}`, payload);
            alert('OS atualizada com sucesso!');
            navigate(`/os/${id}`);
        } catch (err) {
            alert('Erro ao atualizar');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2>Editar OS #{id}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <input type="text" placeholder="Equipamento" value={form.equipamento || ''} onChange={e => setForm({...form, equipamento: e.target.value})} />
                    <input type="text" placeholder="Modelo" value={form.modelo || ''} onChange={e => setForm({...form, modelo: e.target.value})} />
                    {isCelular() && (
                        <input type="text" placeholder="IMEI" value={form.imei || ''} onChange={e => setForm({...form, imei: e.target.value})} />
                    )}
                    <textarea placeholder="Defeito relatado" rows="3" value={form.defeito || ''} onChange={e => setForm({...form, defeito: e.target.value})} />
                    <select value={form.tipo_atendimento} onChange={e => setForm({...form, tipo_atendimento: e.target.value})}>
                        <option value="presencial">Presencial</option>
                        <option value="remoto">Remoto</option>
                    </select>
                    {form.tipo_atendimento === 'presencial' && (
                        <input type="number" step="0.01" placeholder="Valor de deslocamento (R$)" value={form.valor_deslocamento || ''} onChange={e => setForm({...form, valor_deslocamento: e.target.value})} />
                    )}
                    <input type="number" step="0.01" placeholder="Preço final (R$)" value={form.preco_final || ''} onChange={e => setForm({...form, preco_final: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Salvar alterações</button>
            </form>
        </div>
    );
}

export default EditarOS;