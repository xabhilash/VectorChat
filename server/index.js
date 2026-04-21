import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';

const {
  OPENAI_API_KEY,
  PORT = 4000,
  QDRANT_URL = 'http://localhost:6333',
  QDRANT_COLLECTION = 'langchainjs-testing',
  REDIS_HOST = 'localhost',
  REDIS_PORT = '6379',
} = process.env;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment. Check your .env file.');
  process.exit(1);
}

const queue = new Queue('file-upload-queue', {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  return res.json({
    message: 'Hello, this is a /GET endpoint',
  });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({
    message: 'File uploaded successfully',
  });
});

app.get('/chat', async (req, res) => {
  const userQuery = req.query.message;

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: OPENAI_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: QDRANT_URL,
    collectionName: QDRANT_COLLECTION,
  });

  const ret = vectorStore.asRetriever({
    k: 2,
  });

  const result = await ret.invoke(userQuery);

  const SYSTEM_PROMPT = `You are a very helpful AI assistant who answers user's query based on available context from PDF file.
  Context: ${JSON.stringify(result)}`;

  const chatGPTresult = await client.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  res.json({
    message: chatGPTresult.choices[0].message.content,
    docs: result,
  });
});

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
