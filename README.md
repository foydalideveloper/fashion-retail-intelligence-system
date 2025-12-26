# 🛍️ FRIS: Fashion Retail Intelligence System
# Author:  Karimov Shakhzod

![PyTorch](https://img.shields.io/badge/AI-PyTorch_Forecasting-EE4C2C?style=flat&logo=pytorch)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=flat&logo=react)
![Groq](https://img.shields.io/badge/GenAI-Groq_Llama3-orange?style=flat)

**FRIS** is an enterprise-grade AI platform designed to modernize retail operations. It solves the "Big Three" challenges in retail—**Inventory Optimization**, **Visual Discovery**, and **Fraud Detection**—using state-of-the-art Deep Learning architectures.

> **Dataset:** H&M Personalized Fashion Recommendations (31M+ transactions, 105k images).
> **Status:** Production-Ready Full Stack Application.

---

##  Core AI Engines

### 1.  Demand Intelligence (The Forecasting Engine)
**The Problem:** Traditional models (ARIMA) fail to capture complex dependencies like "Item Color" or "Department" when predicting sales for thousands of items simultaneously.
**The Solution:** Developed a **Temporal Fusion Transformer (TFT)** model using PyTorch Forecasting.
*   **Architecture:** Attention-based Deep Learning model that weighs the importance of different features over time.
*   **Performance:** Predicts daily sales for the next **28 days** with **90% Confidence Intervals** (Quantile Regression).
*   **Feature Engineering:**
    *   **Temporal:** 7-day Lags, Rolling Means, Day-of-week, Month.
    *   **Static Covariates:** Embedding `product_group` and `color` to allow the model to learn trends across similar categories (Global Modeling).

### 2.  Conversational AI Stylist (Hybrid RAG)
**The Problem:** Keyword search fails when users have complex intent (e.g., *"Show me blue dresses under $30"*).
**The Solution:** A **Hybrid RAG (Retrieval-Augmented Generation)** pipeline.
*   **Pipeline:** Regex Filter Extraction $\to$ Semantic Vector Search (FAISS) $\to$ Context Injection $\to$ Llama 3 Generation.
*   **Innovation:** Solved "Gender Blindness" by implementing strict logic gates that filter inventory partitions (Men/Women) before the AI sees the data.

### 3.  Visual Discovery (Computer Vision)
**The Problem:** Text search cannot describe style.
**The Solution:** "Shazam for Clothes" using **OpenAI CLIP**.
*   **Tech:** Processed 100k+ images through a ViT-B/32 encoder to generate 512-dimensional embeddings.
*   **Retrieval:** Stored vectors in a **FAISS Index** (Facebook AI Similarity Search) for sub-millisecond retrieval of visually similar items.

### 4.  Anomaly Sentinel (Unsupervised Learning)
**The Problem:** Detecting fraud or system glitches in millions of transactions.
**The Solution:** An **Autoencoder Neural Network**.
*   **Logic:** Trained on "Normal" transaction patterns. When the model encounters a spike (e.g., 5,000 items sold in 1 second), the **Reconstruction Error** spikes, triggering an immediate alert.

---

##  Data Science & Engineering Workflow

This project required significant Data Engineering before any modeling could begin.

### Phase I: Big Data ETL Strategy
The raw dataset (3.5GB CSV) was too large for standard RAM.
*   **Chunking & Serialization:** Processed data in 1M-row batches and converted to **Parquet** format (Columnar Storage), reducing file size by 60% and speeding up I/O by 10x.
*   **Optimization:** Downcasted numerical precision (`float64` $\to$ `float32`) to minimize memory footprint.
*   **Pareto Analysis:** Filtered for the **Top 1,000 High-Volume Items** (The "Critical Few" driving 80% of revenue) to ensure the TFT model focused on actionable inventory.

### Phase II: Model Development (TFT)
*   **Training:** Trained on NVIDIA Tesla T4 GPUs using PyTorch Lightning.
*   **Hyperparameters:** Optimized Learning Rate, Attention Heads (4), and Hidden Sizes (64) to balance model complexity with inference speed.
*   **Validation:** Used a time-based split (Train on past, Validate on future) to prevent data leakage.


###  Installation
     Prerequisites
*    Python 3.10+
*    Node.js 18+
*    Groq API Key (Free)
###  1. Backend
    cd fashion-retail-backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    pip install "numpy<2" "scikit-learn==1.2.2" # Binary compatibility fixes
    uvicorn app.main:app
###  2. Frontend
   cd fashion-retail-frontend/fashion-retail-frontend
   npm install
   npm run dev
    
---

##  Technical Architecture

```mermaid
graph TD
    User[Store Manager] -->|Interacts| UI[React + Tailwind UI]
    UI -->|JSON/HTTP| API[FastAPI Backend]
    
    subgraph "Inference Orchestration Layer"
        API -->|Sales Data| TS["Forecasting Engine (TFT)"]
        API -->|Text Query| RAG[Hybrid RAG Engine]
        API -->|Image Upload| CV[Visual Search Engine]
        API -->|Transactions| AD[Anomaly Engine]
    end
    
    subgraph "Model Artifacts & Storage"
        TS -->|Weights| CKPT["TFT Model .ckpt"]
        RAG -->|Vector Index| FAISS[FAISS Index]
        RAG -->|Inference| Groq[Groq Llama-3 API]
        CV -->|Embeddings| CLIP[OpenAI CLIP]
    end


