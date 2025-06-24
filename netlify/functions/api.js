const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

router.get('/download-links', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const search_url = `https://libgen.gs/index.php?req=${encodeURIComponent(query)}&res=10&filesuns=all&covers=on&curtab=f`;
        const { data } = await axios.get(search_url);
        const $ = cheerio.load(data);
        const links = [];
        $('table.table-striped tbody tr').slice(0, 5).each((i, el) => {
            const detailLink = $(el).find('td:last-child a').attr('href');
            if (detailLink) {
                links.push('https://libgen.gs/' + detailLink);
            }
        });
        res.json({ links });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch download links' });
    }
});

app.use('/api/', router);

module.exports.handler = serverless(app);
