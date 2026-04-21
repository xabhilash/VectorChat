import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

const {
  OPENAI_API_KEY,
  QDRANT_URL = 'http://localhost:6333',
  QDRANT_COLLECTION = 'langchainjs-testing',
  REDIS_HOST = 'localhost',
  REDIS_PORT = '6379',
} = process.env;

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment. Check your .env file.');
  process.exit(1);
}

const worker = new Worker(
  'file-upload-queue',
  async job => {
    console.log(job.data);
    const data = JSON.parse(job.data);
    console.log('data: ', data);

    /* path: data.path
    read the pdf from the path --> pdf
    chunk the pdf
    call OpenAI embedding model on every chunks
    store the vector embedding in qdrantDB 
    */

    // load the pdf
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    console.log('length/no of chunks: ', docs.length);
    console.log(docs);

    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      apiKey: OPENAI_API_KEY,
    });

    try {
      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: QDRANT_URL,
        collectionName: QDRANT_COLLECTION,
      });

      await vectorStore.addDocuments(docs);
      console.log('All docs are added to vector store');
    } catch (err) {
      console.log(err);
    }
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  }
);
