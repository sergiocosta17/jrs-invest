require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

const quotesCache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000;

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

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const summaryQuery = `
      SELECT
        SUM(CASE WHEN type = 'Compra' THEN total ELSE 0 END) AS total_investido
      FROM operations;
    `;
    const result = await pool.query(summaryQuery);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao calcular o resumo do dashboard:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolioQuery = `
      SELECT
        asset,
        SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) AS quantity
      FROM operations
      GROUP BY asset
      HAVING SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) > 0;
    `;
    const result = await pool.query(portfolioQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar portfolio:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/portfolio/detailed', async (req, res) => {
  try {
    const detailedQuery = `
      SELECT
        asset,
        SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) as quantity,
        SUM(CASE WHEN type = 'Compra' THEN total END) / NULLIF(SUM(CASE WHEN type = 'Compra' THEN quantity END), 0) as average_price,
        (SUM(CASE WHEN type = 'Compra' THEN total END) / NULLIF(SUM(CASE WHEN type = 'Compra' THEN quantity END), 0)) * SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) as total_invested
      FROM
        operations
      GROUP BY
        asset
      HAVING
        SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) > 0;
    `;
    const result = await pool.query(detailedQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar carteira detalhada:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/quotes/:tickers', async (req, res) => {
  const { tickers } = req.params;
  const token = process.env.BRAPI_API_TOKEN;
  const canonicalKey = tickers.split(',').sort().join(',');

  if (quotesCache[canonicalKey] && (Date.now() - quotesCache[canonicalKey].timestamp < CACHE_DURATION_MS)) {
    console.log(`Servindo cotações de '${canonicalKey}' a partir do cache.`);
    return res.json(quotesCache[canonicalKey].data);
  }

  if (!tickers) {
    return res.status(400).json({ error: 'Nenhum ticker fornecido' });
  }

  const apiUrl = `https://brapi.dev/api/quote/${tickers}?token=${token}`;

  try {
    console.log(`Buscando cotações de '${canonicalKey}' na API da Brapi...`);
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.results) {
      const responseData = response.data.results;
      quotesCache[canonicalKey] = {
        timestamp: Date.now(),
        data: responseData
      };
      res.json(responseData);
    } else {
      res.status(404).json({ error: 'Ativos não encontrados ou erro na API externa.' });
    }
  } catch (err) {
    console.error('Erro ao buscar dados da Brapi:', err.message);
    res.status(500).json({ error: 'Não foi possível buscar as cotações' });
  }
});

app.listen(port, () => {
  console.log(`Servidor back-end rodando em http://localhost:${port}`);
});