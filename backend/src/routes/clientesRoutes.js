const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { nome, telefone, email, endereco } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clientes (nome, telefone, email, endereco) VALUES ($1,$2,$3,$4) RETURNING *',
            [nome, telefone, email, endereco]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { nome, telefone, email, endereco } = req.body;
    try {
        const result = await pool.query(
            `UPDATE clientes SET nome=$1, telefone=$2, email=$3, endereco=$4 WHERE id=$5 RETURNING *`,
            [nome, telefone, email, endereco, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;