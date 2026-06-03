const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const osRoutes = require('./routes/osRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const tempoRoutes = require('./routes/tempoRoutes');
const fotoRoutes = require('./routes/fotoRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/os', osRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/os', tempoRoutes);       // para /:id/tempo
app.use('/api/fotos', fotoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));