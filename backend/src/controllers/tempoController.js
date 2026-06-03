const pool = require('../config/db');

async function getTempoStatus(req, res) {
    const { os_id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT tempo_acumulado_segundos, status_tempo, inicio_real 
             FROM os WHERE id = $1`,
            [os_id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function iniciarTempo(req, res) {
    const { os_id } = req.params;
    try {
        await pool.query(
            `UPDATE os 
             SET inicio_real = NOW(), 
                 status_tempo = 'em_andamento' 
             WHERE id = $1 AND status_tempo = 'nao_iniciado'`,
            [os_id]
        );
        res.json({ success: true, message: 'Cronômetro iniciado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function pausarTempo(req, res) {
    const { os_id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT inicio_real, tempo_acumulado_segundos, status_tempo 
             FROM os WHERE id = $1`,
            [os_id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
        const os = rows[0];
        if (os.status_tempo !== 'em_andamento') return res.status(400).json({ error: 'Não está em andamento' });

        const agora = new Date();
        const inicio = new Date(os.inicio_real);
        const diffSegundos = Math.floor((agora - inicio) / 1000);
        const novoAcumulado = os.tempo_acumulado_segundos + diffSegundos;

        await pool.query(
            `UPDATE os 
             SET pausado_em = NOW(),
                 tempo_acumulado_segundos = $1,
                 status_tempo = 'pausado',
                 inicio_real = NULL
             WHERE id = $2`,
            [novoAcumulado, os_id]
        );
        res.json({ success: true, acumulado: novoAcumulado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function retomarTempo(req, res) {
    const { os_id } = req.params;
    try {
        await pool.query(
            `UPDATE os 
             SET inicio_real = NOW(),
                 status_tempo = 'em_andamento',
                 pausado_em = NULL
             WHERE id = $1 AND status_tempo = 'pausado'`,
            [os_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function finalizarTempo(req, res) {
    const { os_id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT inicio_real, tempo_acumulado_segundos, status_tempo 
             FROM os WHERE id = $1`,
            [os_id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
        const os = rows[0];
        let acumuladoFinal = os.tempo_acumulado_segundos;
        if (os.status_tempo === 'em_andamento') {
            const agora = new Date();
            const inicio = new Date(os.inicio_real);
            const diff = Math.floor((agora - inicio) / 1000);
            acumuladoFinal += diff;
        }
        await pool.query(
            `UPDATE os 
             SET tempo_acumulado_segundos = $1,
                 status_tempo = 'finalizado',
                 inicio_real = NULL,
                 pausado_em = NULL,
                 data_conclusao = CURRENT_DATE
             WHERE id = $2`,
            [acumuladoFinal, os_id]
        );
        res.json({ success: true, totalSegundos: acumuladoFinal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getTempoStatus, iniciarTempo, pausarTempo, retomarTempo, finalizarTempo };