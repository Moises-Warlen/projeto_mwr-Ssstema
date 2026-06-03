const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Listar todas as OS
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT os.*, c.nome as cliente_nome 
            FROM os 
            JOIN clientes c ON os.cliente_id = c.id 
            ORDER BY os.id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar OS por ID
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT os.*, c.nome as cliente_nome, c.telefone, c.email
            FROM os 
            JOIN clientes c ON os.cliente_id = c.id 
            WHERE os.id = $1
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Criar nova OS (inclui valor_deslocamento)
router.post('/', async (req, res) => {
    const { 
        numero_os, cliente_id, categoria_id, equipamento, modelo, imei, defeito,
        tipo_atendimento, estimativa_horas, preco_final, valor_deslocamento 
    } = req.body;
    try {
        const { rows } = await pool.query(`
            INSERT INTO os (
                numero_os, cliente_id, categoria_id, equipamento, modelo, imei, defeito,
                tipo_atendimento, estimativa_horas, preco_final, valor_deslocamento
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            numero_os, cliente_id, categoria_id || null, equipamento || null,
            modelo || null, imei || null, defeito || null,
            tipo_atendimento || 'presencial',
            estimativa_horas || null, preco_final || 0,
            valor_deslocamento || 0
        ]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Atualizar OS (inclui valor_deslocamento)
router.put('/:id', async (req, res) => {
    const {
        servico_realizado, preco_final, status_os, data_entrega, equipamento, modelo,
        imei, defeito, tipo_atendimento, estimativa_horas, valor_deslocamento
    } = req.body;
    try {
        // Primeiro busca os dados atuais
        const { rows: currentRows } = await pool.query('SELECT * FROM os WHERE id = $1', [req.params.id]);
        if (currentRows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
        const current = currentRows[0];

        const { rows } = await pool.query(`
            UPDATE os SET
                servico_realizado = COALESCE($1, servico_realizado),
                preco_final = COALESCE($2, preco_final),
                status_os = COALESCE($3, status_os),
                data_entrega = COALESCE($4, data_entrega),
                equipamento = COALESCE($5, equipamento),
                modelo = COALESCE($6, modelo),
                imei = COALESCE($7, imei),
                defeito = COALESCE($8, defeito),
                tipo_atendimento = COALESCE($9, tipo_atendimento),
                estimativa_horas = COALESCE($10, estimativa_horas),
                valor_deslocamento = COALESCE($11, valor_deslocamento),
                updated_at = NOW()
            WHERE id = $12
            RETURNING *
        `, [
            servico_realizado ?? current.servico_realizado,
            preco_final ?? current.preco_final,
            status_os ?? current.status_os,
            data_entrega ?? current.data_entrega,
            equipamento ?? current.equipamento,
            modelo ?? current.modelo,
            imei ?? current.imei,
            defeito ?? current.defeito,
            tipo_atendimento ?? current.tipo_atendimento,
            estimativa_horas ?? current.estimativa_horas,
            valor_deslocamento ?? current.valor_deslocamento,
            req.params.id
        ]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;