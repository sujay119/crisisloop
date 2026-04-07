# Stage 1: Build Frontend
FROM node:20 AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM python:3.10

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy python backend requirements
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend context
COPY --chown=user . /app

# Copy the built frontend from Stage 1
COPY --from=frontend-builder --chown=user /app/frontend/out /app/frontend/out

# Fast API serves the out/ directory.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]

