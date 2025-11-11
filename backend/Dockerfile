# manim-docker/Dockerfile
FROM python:3.11-slim

# =========================================================
# 1️⃣ Install system packages required by Manim rendering
# =========================================================
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libcairo2-dev \
    pkg-config \
    libpango1.0-dev \
    libgirepository1.0-dev \
    gir1.2-pango-1.0 \
    python3-dev \
    git \
    wget \
    # === Added minimal LaTeX toolchain ===
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-xetex \
    latexmk \
    dvisvgm \
    cm-super \
    ghostscript \
  && rm -rf /var/lib/apt/lists/*

# =========================================================
# 2️⃣ Upgrade pip & install Manim
# =========================================================
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir "manim>=0.19.0"

# =========================================================
# 3️⃣ Create a non-root user and working directory
# =========================================================
RUN useradd -m -u 1000 manimuser \
 && mkdir -p /work \
 && chown -R manimuser:manimuser /work

WORKDIR /work
USER manimuser

# =========================================================
# 4️⃣ Set default entrypoint to Manim CLI
# =========================================================
ENTRYPOINT ["manim"]
