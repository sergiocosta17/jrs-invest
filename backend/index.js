require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csv = require('fast-csv');
const PDFDocument = require('pdfkit');
const auth = require('./middleware/auth');
const yahooFinance = require('yahoo-finance2').default;
const nodemailer = require('nodemailer');

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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/google-login', async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ error: 'Dados do Google incompletos.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    let user;

    if (userResult.rowCount > 0) {
      user = userResult.rows[0];
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
        [name, email, hashedPassword]
      );
      user = newUser.rows[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login com Google realizado com sucesso!',
      token: token,
      user: { id: user.id, email: user.email, name: user.name }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao processar login com Google.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'E-mail não encontrado.' });
    }

    const user = userResult.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha - JRS Invest',
      html: `<p>Você solicitou a recuperação de senha.</p><p>Clique no link para redefinir: <a href="${resetLink}">Redefinir Senha</a></p>`
    });

    res.json({ message: 'E-mail de recuperação enviado com sucesso.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação.' });
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/operations', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operations WHERE user_id = $1 ORDER BY date DESC', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao gerar o relatório.' });
  }
});

app.get('/api/chart/:ticker', auth, async (req, res) => {
  const { ticker } = req.params;
  const cacheKey = `chart-yahoo-${ticker}`;

  if (quotesCache[cacheKey] && (Date.now() - quotesCache[cacheKey].timestamp < 60 * 60 * 1000)) {
      return res.json(quotesCache[cacheKey].data);
  }

  let yahooTicker = ticker.toUpperCase();
  if (!yahooTicker.startsWith('^') && !yahooTicker.endsWith('.SA')) {
    yahooTicker = `${yahooTicker}.SA`;
  }

  try {
      const [historicalData, quoteData] = await Promise.all([
          yahooFinance.historical(yahooTicker, { period1: new Date(new Date().setMonth(new Date().getMonth() - 3)), interval: '1d' }),
          yahooFinance.quote(yahooTicker)
      ]);
      
      const formattedResult = {
          symbol: ticker.toUpperCase(),
          regularMarketPrice: quoteData.regularMarketPrice || 0,
          regularMarketChange: quoteData.regularMarketChange || 0,
          historicalDataPrice: historicalData.map(data => ({
              date: Math.floor(new Date(data.date).getTime() / 1000),
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
          }))
      };

      quotesCache[cacheKey] = {
          timestamp: Date.now(),
          data: formattedResult
      };
      res.json(formattedResult);

  } catch (err) {
      console.warn(`Aviso: Dados do gráfico não encontrados para o ticker "${ticker}".`);
      res.json({
          symbol: ticker.toUpperCase(),
          regularMarketPrice: 0,
          regularMarketChange: 0,
          historicalDataPrice: []
      });
  }
});

app.get('/api/quotes/:tickers', auth, async (req, res) => {
  const { tickers } = req.params;
  if (!tickers || tickers.trim() === '') {
    return res.json([]);
  }

  const tickerList = tickers.split(',');
  const canonicalKey = `quotes-yahoo-${tickerList.sort().join(',')}`;

  if (quotesCache[canonicalKey] && (Date.now() - quotesCache[canonicalKey].timestamp < CACHE_DURATION_MS)) {
    return res.json(quotesCache[canonicalKey].data);
  }

  const yahooTickerList = tickerList.map(t => {
    const upperT = t.toUpperCase();
    if (!upperT.startsWith('^') && !upperT.endsWith('.SA')) {
      return `${upperT}.SA`;
    }
    return upperT;
  });

  try {
    const results = await yahooFinance.quote(yahooTickerList);
    
    const resultsMap = new Map();
    if (Array.isArray(results)) {
      results.forEach(r => r && r.symbol && resultsMap.set(r.symbol, r));
    } else if (results && results.symbol) {
      resultsMap.set(results.symbol, results);
    }

    const finalResults = yahooTickerList.map(yahooTicker => {
      const originalTicker = yahooTicker.replace('.SA', '');
      const quote = resultsMap.get(yahooTicker);

      if (quote && quote.regularMarketPrice != null) {
        return {
          symbol: originalTicker,
          shortName: quote.shortName || '',
          longName: quote.longName || '',
          regularMarketPrice: quote.regularMarketPrice || 0,
          regularMarketChange: quote.regularMarketChange || 0,
          regularMarketChangePercent: quote.regularMarketChangePercent || 0,
          regularMarketTime: quote.regularMarketTime || new Date(),
        };
      }
      
      console.warn(`Aviso: Cotação não encontrada para o ticker "${originalTicker}".`);
      return {
        symbol: originalTicker,
        shortName: `${originalTicker} (Inválido)`,
        longName: 'Ativo não encontrado',
        regularMarketPrice: 0,
        regularMarketChange: 0,
        regularMarketChangePercent: 0,
        regularMarketTime: new Date(),
      };
    });

    quotesCache[canonicalKey] = {
      timestamp: Date.now(),
      data: finalResults
    };
    res.json(finalResults);
    
  } catch (err) {
    console.error(err);
    const errorResults = tickerList.map(originalTicker => ({
      symbol: originalTicker.toUpperCase(),
      shortName: `${originalTicker.toUpperCase()} (Erro)`,
      longName: 'Erro ao buscar dados',
      regularMarketPrice: 0,
      regularMarketChange: 0,
      regularMarketChangePercent: 0,
      regularMarketTime: new Date(),
    }));
    res.json(errorResults);
  }
});

app.get('/api/search/stocks', auth, async (req, res) => {
  const { q } = req.query; 
  if (!q) {
    return res.status(400).json({ error: 'Um termo de busca é obrigatório.' });
  }

  const searchTerm = q.toUpperCase();
  const cacheKey = `search-yahoo-${searchTerm}`;
  
  if (quotesCache[cacheKey] && (Date.now() - quotesCache[cacheKey].timestamp < CACHE_DURATION_MS)) {
    return res.json(quotesCache[cacheKey].data);
  }

  try {
    const response = await yahooFinance.search(searchTerm);

    const searchData = response.quotes.map(item => ({
      stock: item.symbol,
      name: item.longname || item.shortname,
    })).filter(item => 
      item.stock.includes('.SA')
    );

    quotesCache[cacheKey] = {
      timestamp: Date.now(),
      data: searchData
    };
      
    res.json(searchData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Não foi possível realizar a busca pelas ações.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor back-end rodando em http://localhost:${port}`);
});