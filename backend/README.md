# AI Social Intelligence Platform

## Project Overview
This is the backend for the AI Social Intelligence Platform, built with FastAPI, PostgreSQL, and async SQLAlchemy.

## Prerequisites
- Python 3.10+
- Docker and Docker Compose (for database)

## Setup Instructions

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd ai-social-platform
   ```

2. **Start the PostgreSQL database using Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   # On Windows use:
   venv\Scripts\activate
   # On macOS/Linux use:
   # source venv/bin/activate
   
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure your database settings if necessary.
   ```bash
   cp .env.example .env
   ```

5. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

The API documentation will be available at `http://127.0.0.1:8000/docs`.
