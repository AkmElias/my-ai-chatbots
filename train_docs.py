import argparse
import logging
import sys
from typing import List
from tqdm import tqdm
import requests
from urllib.parse import urlparse

from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('train_docs.log')
    ]
)

logger = logging.getLogger(__name__)

def validate_url(url: str) -> bool:
    """Validate URL and check if it's accessible."""
    try:
        parsed = urlparse(url)
        if not all([parsed.scheme, parsed.netloc]):
            return False
        response = requests.head(url, allow_redirects=True, timeout=5)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Error validating URL {url}: {e}")
        return False

def load_documents(urls: List[str]) -> List:
    """Load documents from URLs with progress bar and validation."""
    valid_urls = []
    logger.info("Validating URLs...")
    for url in tqdm(urls, desc="Validating URLs"):
        if validate_url(url):
            valid_urls.append(url)
            logger.info(f"Valid URL: {url}")
        else:
            logger.warning(f"Invalid or inaccessible URL: {url}")

    if not valid_urls:
        logger.error("No valid URLs provided")
        sys.exit(1)

    logger.info("Loading documents from URLs...")
    loader = WebBaseLoader(valid_urls)
    try:
        documents = loader.load()
        logger.info(f"Successfully loaded {len(documents)} documents")
        return documents
    except Exception as e:
        logger.error(f"Error loading documents: {e}")
        sys.exit(1)

def process_documents(documents: List):
    """Process documents and create vector store."""
    try:
        logger.info("Splitting documents into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        splits = text_splitter.split_documents(documents)
        logger.info(f"Created {len(splits)} document chunks")

        logger.info("Creating embeddings using Ollama...")
        embeddings = OllamaEmbeddings(model="mistral")
        
        logger.info("Creating and persisting vector store...")
        with tqdm(total=1, desc="Creating vector store") as pbar:
            vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=embeddings,
                persist_directory="./docs_db"
            )
            pbar.update(1)
        
        vectorstore.persist()
        logger.info("Vector store created and persisted successfully")
        return vectorstore
    except Exception as e:
        logger.error(f"Error processing documents: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Train documentation chatbot with URLs")
    parser.add_argument(
        '--urls',
        nargs='+',
        help='List of URLs to documentation pages',
        required=True
    )
    args = parser.parse_args()

    logger.info("Starting documentation training process...")
    documents = load_documents(args.urls)
    vectorstore = process_documents(documents)
    logger.info("Training completed successfully!")

if __name__ == "__main__":
    main()

from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

# List your documentation URLs
urls = [
    "https://your-docs-url.com/page1",
    "https://your-docs-url.com/page2"
]

# Load and process the documents
loader = WebBaseLoader(urls)
documents = loader.load()

# Split documents into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(documents)

# Create embeddings and store them
embeddings = OllamaEmbeddings(model="mistral")
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    persist_directory="./docs_db"
)