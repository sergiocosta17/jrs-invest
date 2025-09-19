require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csv = require('fast-csv');
const PDFDocument = require('pdfkit');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3001;

const quotesCache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000;

app.use(cors());
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rowCount > 0) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({
        errors: { email: 'Nenhum usuário encontrado com este e-mail.' }
      });
    }
    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        errors: { password: 'Senha incorreta.' }
      });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    delete user.password;
    res.json({
      message: 'Login bem-sucedido!',
      token: token,
      user: user
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/profile', auth, async (req, res) => {
  try {
    const userProfile = await pool.query('SELECT id, email, name, birth_date, phone FROM users WHERE id = $1', [req.user.userId]);
    if (userProfile.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(userProfile.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/profile', auth, async (req, res) => {
  const { name, birth_date, phone } = req.body;
  try {
    const updatedUser = await pool.query(
      'UPDATE users SET name = $1, birth_date = $2, phone = $3 WHERE id = $4 RETURNING id, email, name, birth_date, phone',
      [name, birth_date, phone, req.user.userId]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/profile/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ error: 'A senha atual está incorreta.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/operations', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operations WHERE user_id = $1 ORDER BY date DESC', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar operações:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/operations', auth, async (req, res) => {
  const { date, type, asset, quantity, price } = req.body;
  const total = Number(quantity) * Number(price);
  try {
    const newOperation = await pool.query(
      'INSERT INTO operations (date, type, asset, quantity, price, total, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [date, type, asset, quantity, price, total, req.user.userId]
    );
    res.status(201).json(newOperation.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/operations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, asset, quantity, price } = req.body;
    const total = Number(quantity) * Number(price);
    const updatedOp = await pool.query(
      'UPDATE operations SET date = $1, type = $2, asset = $3, quantity = $4, price = $5, total = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [date, type, asset, quantity, price, total, id, req.user.userId]
    );
    if (updatedOp.rowCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada ou não pertence a este usuário.' });
    }
    res.json(updatedOp.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/operations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query('DELETE FROM operations WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: 'Operação não encontrada ou não pertence a este usuário.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao excluir operação:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/portfolio/detailed', auth, async (req, res) => {
  try {
    const detailedQuery = `
      WITH portfolio_summary AS (
        SELECT
          asset,
          SUM(CASE WHEN type = 'Compra' THEN quantity ELSE -quantity END) as quantity,
          SUM(CASE WHEN type = 'Compra' THEN total END) as total_buy_value,
          SUM(CASE WHEN type = 'Compra' THEN quantity END) as total_buy_quantity
        FROM operations
        WHERE user_id = $1
        GROUP BY asset
      )
      SELECT
        asset,
        quantity,
        total_buy_value / NULLIF(total_buy_quantity, 0) as average_price,
        (total_buy_value / NULLIF(total_buy_quantity, 0)) * quantity as total_invested
      FROM portfolio_summary
      WHERE quantity > 0;
    `;
    const result = await pool.query(detailedQuery, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar carteira detalhada:", err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/reports', auth, async (req, res) => {
  const { format, startDate, endDate } = req.query;
  if (!format || !startDate || !endDate) {
    return res.status(400).json({ error: 'Parâmetros format, startDate e endDate são obrigatórios.' });
  }
  try {
    const operationsResult = await pool.query(
      'SELECT id, date, type, asset, quantity, price, total FROM operations WHERE user_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date ASC',
      [req.user.userId, startDate, endDate]
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
      doc.text('Data', 50, tableTop); doc.text('Tipo', 120, tableTop); doc.text('Ativo', 170, tableTop); doc.text('Qtd.', 240, tableTop, { width: 50, align: 'right' }); doc.text('Preço', 300, tableTop, { width: 70, align: 'right' }); doc.text('Total', 380, tableTop, { width: 80, align: 'right' });
      doc.moveDown();
      doc.font('Helvetica');
      operations.forEach(op => {
        const y = doc.y;
        doc.text(new Date(op.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), 50, y); doc.text(op.type, 120, y); doc.text(op.asset, 170, y); doc.text(op.quantity.toString(), 240, y, { width: 50, align: 'right' }); doc.text(Number(op.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 300, y, { width: 70, align: 'right' }); doc.text(Number(op.total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 380, y, { width: 80, align: 'right' });
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

app.get('/api/chart/:ticker', auth, async (req, res) => {
  const { ticker } = req.params;
  const token = process.env.BRAPI_API_TOKEN;
  const cacheKey = `chart-${ticker}`;
  if (quotesCache[cacheKey] && (Date.now() - quotesCache[cacheKey].timestamp < 60 * 60 * 1000)) {
    return res.json(quotesCache[cacheKey].data);
  }
  const apiUrl = `https://brapi.dev/api/quote/${ticker}?range=3mo&interval=1d&token=${token}`;
  try {
    const response = await axios.get(apiUrl);
    const chartData = response.data.results[0];
    if (chartData) {
      quotesCache[cacheKey] = {
        timestamp: Date.now(),
        data: chartData
      };
      res.json(chartData);
    } else {
      res.status(404).json({ error: 'Dados para o ticker não encontrados.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Não foi possível buscar os dados do gráfico.' });
  }
});

app.get('/api/quotes/:tickers', auth, async (req, res) => {
  const { tickers } = req.params;
  const token = process.env.BRAPI_API_TOKEN;
  const canonicalKey = tickers.split(',').sort().join(',');
  if (quotesCache[canonicalKey] && (Date.now() - quotesCache[canonicalKey].timestamp < CACHE_DURATION_MS)) {
    return res.json(quotesCache[canonicalKey].data);
  }
  if (!tickers) {
    return res.status(400).json({ error: 'Nenhum ticker fornecido' });
  }
  const apiUrl = `https://brapi.dev/api/quote/${tickers}?token=${token}`;
  try {
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