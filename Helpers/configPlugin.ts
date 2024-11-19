import { promises as fs } from 'fs';

let cachedConfig: any | null = null;

async function loadConfig(): Promise<any> {
    const data = await fs.readFile('./Helpers/data.json', 'utf-8');
    cachedConfig = JSON.parse(data); // Парсинг и сохранение в кэш
    return cachedConfig;
 }
export { loadConfig };
