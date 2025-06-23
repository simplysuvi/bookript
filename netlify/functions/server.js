const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

const BASE_URL = "https://libgen.gs";
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?maxResults=31&q=";
const USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko";

const session = axios.create({
    headers: { 'User-Agent': USER_AGENT }
});

router.use(express.static('public'));
router.use(express.json());

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

router.post('/api/books', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = await axios.get(GOOGLE_BOOKS_API + encodeURIComponent(query));
        const books = [];
        if (response.status === 200) {
            const data = response.data;
            if (data.items) {
                for (const item of data.items.slice(0, 30)) {
                    const book = item.volumeInfo;
                    const details = {
                        title: book.title || "Unknown",
                        authors: book.authors ? book.authors.join(', ') : "Unknown",
                        publishedDate: book.publishedDate || "Unknown",
                        description: book.description || "No description available.",
                        pageCount: book.pageCount || "N/A",
                        thumbnail: book.imageLinks ? book.imageLinks.thumbnail : null,
                    };
                    books.push(details);
                }
            }
        }
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book details' });
    }
});

router.post('/api/download-links', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const search_url = `${BASE_URL}/index.php?req=${encodeURIComponent(query)}&res=10&filesuns=all&covers=on&curtab=f`;
        const response = await session.get(search_url);
        const $ = cheerio.load(response.data);
        const links = [];
        $('table.table-striped tbody tr').slice(0, 5).each((i, el) => {
            const detailLink = $(el).find('td:last-child a').attr('href');
            if (detailLink) {
                links.push(BASE_URL + '/' + detailLink);
            }
        });
        res.json({ links });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch download links' });
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
