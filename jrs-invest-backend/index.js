require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', (req, res) => {
  res.send('API JRS Invest está no ar!');
});

app.get('/api/operations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operations ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar operações:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/operations', async (req, res) => {
  const { date, type, asset, quantity, price } = req.body;
  const total = Number(quantity) * Number(price);
  try {
    const newOperation = await pool.query(
      'INSERT INTO operations (date, type, asset, quantity, price, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [date, type, asset, quantity, price, total]
    );
    res.status(201).json(newOperation.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/operations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, asset, quantity, price } = req.body;
    const total = Number(quantity) * Number(price);
    const updatedOp = await pool.query(
      'UPDATE operations SET date = $1, type = $2, asset = $3, quantity = $4, price = $5, total = $6 WHERE id = $7 RETURNING *',
      [date, type, asset, quantity, price, total, id]
    );
    if (updatedOp.rowCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada' });
    }
    res.json(updatedOp.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/operations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query('DELETE FROM operations WHERE id = $1', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao excluir operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor back-end rodando em http://localhost:${port}`);
});