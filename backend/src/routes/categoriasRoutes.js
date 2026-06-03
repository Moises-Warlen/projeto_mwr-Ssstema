const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { nome, preco_sugerido, tempo_estimado_minutos } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categorias (nome, preco_sugerido, tempo_estimado_minutos) VALUES ($1,$2,$3) RETURNING *',
            [nome, preco_sugerido, tempo_estimado_minutos]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { nome, preco_sugerido, tempo_estimado_minutos } = req.body;
    try {
        const result = await pool.query(
            `UPDATE categorias SET nome=$1, preco_sugerido=$2, tempo_estimado_minutos=$3 WHERE id=$4 RETURNING *`,
            [nome, preco_sugerido, tempo_estimado_minutos, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;