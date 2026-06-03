import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Cronometro({ osId }) {
    const [tempoDecorrido, setTempoDecorrido] = useState(0);
    const [status, setStatus] = useState('nao_iniciado');
    const [intervalId, setIntervalId] = useState(null);
    const [acumuladoInicial, setAcumuladoInicial] = useState(0);

    useEffect(() => {
        const fetchTempo = async () => {
            try {
                const res = await api.get(`/os/${osId}/tempo`);
                setAcumuladoInicial(res.data.tempo_acumulado_segundos || 0);
                setStatus(res.data.status_tempo || 'nao_iniciado');
                if (res.data.status_tempo === 'em_andamento') {
                    iniciarAtualizacao(res.data.tempo_acumulado_segundos || 0);
                } else {
                    setTempoDecorrido(res.data.tempo_acumulado_segundos || 0);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTempo();
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [osId]);

    const iniciarAtualizacao = (acumuladoBase) => {
        const inicio = Date.now();
        const id = setInterval(() => {
            const diff = Math.floor((Date.now() - inicio) / 1000);
            setTempoDecorrido(acumuladoBase + diff);
        }, 1000);
        setIntervalId(id);
    };

    const handleIniciar = async () => {
        await api.post(`/os/${osId}/iniciar`);
        setStatus('em_andamento');
        iniciarAtualizacao(acumuladoInicial);
    };

    const handlePausar = async () => {
        const res = await api.post(`/os/${osId}/pausar`);
        clearInterval(intervalId);
        setStatus('pausado');
        setTempoDecorrido(res.data.acumulado);
        setAcumuladoInicial(res.data.acumulado);
        setIntervalId(null);
    };

    const handleRetomar = async () => {
        await api.post(`/os/${osId}/retomar`);
        setStatus('em_andamento');
        iniciarAtualizacao(tempoDecorrido);
    };

    const handleFinalizar = async () => {
        await api.post(`/os/${osId}/finalizar`);
        if (intervalId) clearInterval(intervalId);
        setStatus('finalizado');
        const res = await api.get(`/os/${osId}/tempo`);
        setTempoDecorrido(res.data.tempo_acumulado_segundos);
        setIntervalId(null);
    };

    const formatarTempo = (segundos) => {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = segundos % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card" style={{ padding: '1rem', margin: '15px 0' }}>
            <h3 style={{ marginBottom: '10px' }}>⏱️ Cronômetro: {formatarTempo(tempoDecorrido)}</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {status === 'nao_iniciado' && (
                    <button className="btn btn-success" onClick={handleIniciar}>▶ Iniciar</button>
                )}
                {status === 'em_andamento' && (
                    <button className="btn btn-warning" onClick={handlePausar}>⏸ Pausar</button>
                )}
                {status === 'pausado' && (
                    <>
                        <button className="btn btn-success" onClick={handleRetomar}>⏵ Retomar</button>
                        <button className="btn btn-danger" onClick={handleFinalizar}>⏹ Finalizar</button>
                    </>
                )}
                {(status === 'em_andamento' || status === 'pausado') && status !== 'pausado' && (
                    <button className="btn btn-danger" onClick={handleFinalizar}>⏹ Finalizar</button>
                )}
                {status === 'finalizado' && <span className="badge" style={{ background: '#28a745', color: 'white', padding: '6px 12px', borderRadius: '20px' }}>✅ Finalizado</span>}
            </div>
        </div>
    );
}

export default Cronometro;