require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const csv = require('fast-csv');
const PDFDocument = require('pdfkit');

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
        SUM(CASE WHEN type = 'Compra' THEN total ELSE 0 END) AS total_investido,
        SUM(CASE WHEN type = 'Venda' THEN total ELSE 0 END) AS total_vendido
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
      WITH portfolio_summary AS (
        SELECT
          asset,
          SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) as quantity,
          SUM(CASE WHEN type = 'Compra' THEN total END) as total_buy_value,
          SUM(CASE WHEN type = 'Compra' THEN quantity END) as total_buy_quantity
        FROM
          operations
        GROUP BY
          asset
      )
      SELECT
        asset,
        quantity,
        total_buy_value / NULLIF(total_buy_quantity, 0) as average_price,
        (total_buy_value / NULLIF(total_buy_quantity, 0)) * quantity as total_invested
      FROM
        portfolio_summary
      WHERE
        quantity > 0;
    `;
    const result = await pool.query(detailedQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar carteira detalhada:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/reports', async (req, res) => {
  const { format, startDate, endDate } = req.query;

  if (!format || !startDate || !endDate) {
    return res.status(400).json({ error: 'Parâmetros format, startDate e endDate são obrigatórios.' });
  }

  try {
    const operationsResult = await pool.query(
      'SELECT * FROM operations WHERE date BETWEEN $1 AND $2 ORDER BY date ASC',
      [startDate, endDate]
    );
    const operations = operationsResult.rows;
    
    const fileName = `relatorio-operacoes-${startDate}-a-${endDate}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      csv.write(operations, { headers: true }).pipe(res);

    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(18).text('Relatório de Operações', { align: 'center' });
      doc.fontSize(12).text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} a ${new Date(endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(10).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Data', 50, tableTop);
      doc.text('Tipo', 120, tableTop);
      doc.text('Ativo', 170, tableTop);
      doc.text('Qtd.', 240, tableTop, { width: 50, align: 'right' });
      doc.text('Preço', 300, tableTop, { width: 70, align: 'right' });
      doc.text('Total', 380, tableTop, { width: 80, align: 'right' });
      doc.moveDown();
      doc.font('Helvetica');

      operations.forEach(op => {
        const y = doc.y;
        doc.text(new Date(op.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), 50, y);
        doc.text(op.type, 120, y);
        doc.text(op.asset, 170, y);
        doc.text(op.quantity.toString(), 240, y, { width: 50, align: 'right' });
        doc.text(Number(op.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 300, y, { width: 70, align: 'right' });
        doc.text(Number(op.total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 380, y, { width: 80, align: 'right' });
        doc.moveDown();
      });

      doc.end();

    } else {
      res.status(400).json({ error: 'Formato de relatório inválido. Use "pdf" ou "csv".' });
    }
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res.status(500).json({ error: 'Erro interno ao gerar o relatório.' });
  }
});

app.get('/api/quotes/:tickers', async (req, res) => {
  const { tickers } = req.params;
  const token = process.env.BRAPI_API_TOKEN ? process.env.BRAPI_API_TOKEN.trim() : null;
  
  if (!token) {
    console.error("ERRO CRÍTICO: Token da Brapi não encontrado no .env");
    return res.status(500).json({ error: 'Configuração do servidor incompleta: token da API externa ausente.' });
  }

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
    if (err.response) {
      console.error(`Erro da API Brapi: Status ${err.response.status}`, err.response.data);
      res.status(err.response.status).json({ 
        message: 'Erro ao buscar dados da API externa.', 
        errorDetails: err.response.data 
      });
    } else if (err.request) {
      console.error('Erro de rede: Nenhuma resposta da Brapi.', err.request);
      res.status(503).json({ error: 'Serviço externo indisponível (Brapi).' });
    } else {
      console.error('Erro ao configurar a requisição para a Brapi:', err.message);
      res.status(500).json({ error: 'Erro interno ao tentar buscar as cotações.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor back-end rodando em http://localhost:${port}`);
});