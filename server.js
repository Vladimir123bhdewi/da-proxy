const express = require('express');
const app = express();

const PORT = process.env.PORT || 10000;
const SECRET = process.env.PROXY_SECRET || '';
const DA_TARGET = 'https://www.donationalerts.com/api/v1/user/gelyandwagen/donationpagesettings';

app.get('/proxy/da', async (req, res) => {
  // Проверка секрета
  if (!SECRET) {
    return res.status(500).json({ error: 'PROXY_SECRET not configured' });
  }
  const incoming = req.headers['x-proxy-secret'];
  if (incoming !== SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const resp = await fetch(DA_TARGET, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ru,en;q=0.9',
        'Referer': 'https://www.donationalerts.com/',
        'Origin': 'https://www.donationalerts.com',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    const text = await resp.text();
    res.status(resp.status).set('Content-Type', 'application/json').send(text);
  } catch (err) {
    console.error('Proxy fetch error:', err.message);
    res.status(502).json({ error: 'Upstream failed', details: err.message });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`DA proxy listening on port ${PORT}`);
});