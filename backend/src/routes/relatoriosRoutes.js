const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    const { cliente_id, data_inicio, data_fim, categoria_id } = req.query;
    let sql = `
        SELECT 
            os.id, os.numero_os, os.equipamento, os.modelo, os.servico_realizado,
            os.tipo_atendimento, os.preco_final, os.valor_deslocamento,
            os.data_conclusao, os.tempo_acumulado_segundos,
            c.nome AS cliente_nome,
            cat.nome AS categoria_nome
        FROM os
        JOIN clientes c ON os.cliente_id = c.id
        LEFT JOIN categorias cat ON os.categoria_id = cat.id
        WHERE os.status_os = 'concluido'
    `;
    const params = [];
    let idx = 1;

    if (cliente_id) {
        sql += ` AND os.cliente_id = $${idx++}`;
        params.push(cliente_id);
    }
    if (data_inicio && data_fim) {
        sql += ` AND os.data_conclusao BETWEEN $${idx++} AND $${idx++}`;
        params.push(data_inicio, data_fim);
    }
    if (categoria_id) {
        sql += ` AND os.categoria_id = $${idx++}`;
        params.push(categoria_id);
    }
    sql += ` ORDER BY os.data_conclusao DESC`;

    try {
        const { rows } = await pool.query(sql, params);
        // Formata tempo e calcula total
        const dados = rows.map(row => ({
            ...row,
            tempo_formatado: formatarSegundos(row.tempo_acumulado_segundos || 0),
            total_servico: (parseFloat(row.preco_final) || 0) + (parseFloat(row.valor_deslocamento) || 0)
        }));
        res.json({ dados });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

function formatarSegundos(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

module.exports = router;