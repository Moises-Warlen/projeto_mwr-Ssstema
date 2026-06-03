import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CadastroCliente() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        email: '',
        endereco: ''
    });
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');
        try {
            await api.post('/clientes', form);
            setSucesso('Cliente cadastrado com sucesso!');
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error(error);
            setErro('Erro ao cadastrar cliente. Verifique os dados.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Cadastrar Cliente</h2>
            {erro && <div style={{ color: 'red', marginBottom: '10px' }}>{erro}</div>}
            {sucesso && <div style={{ color: 'green', marginBottom: '10px' }}>{sucesso}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nome *</label><br />
                    <input type="text" name="nome" value={form.nome} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Telefone *</label><br />
                    <input type="text" name="telefone" value={form.telefone} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>E-mail</label><br />
                    <input type="email" name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Endereço</label><br />
                    <textarea name="endereco" value={form.endereco} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px' }}></textarea>
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Salvar Cliente</button>
                <button type="button" onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            </form>
        </div>
    );
}

export default CadastroCliente;