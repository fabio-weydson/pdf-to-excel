import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

// i18n configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18next.init({
  fallbackLng: 'pt-BR',
  preload: ['pt-BR', 'en'],
  resources: {
    'pt-BR': {
      translation: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'pt-BR', 'translation.json'), 'utf8'))
    },
    en: {
      translation: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'en', 'translation.json'), 'utf8'))
    }
  }
});

const app = express();
const port = process.env.PORT || 3000;

import converterRoutes from './routes/converterRoutes.js';

app.use(cors());
app.use(express.json());
// i18next middleware to handle language detection via Accept-Language header
app.use(middleware.handle(i18next));

app.use('/api', converterRoutes);

app.get('/', (req, res) => {
  res.send('PDF Bank Statement Converter API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
