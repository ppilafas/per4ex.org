#!/usr/bin/env bash
set -e

# ---------------------------------------------------------
# Bootstrap script for per4ex.org Streamlit environment
# ---------------------------------------------------------

# Use script location as project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo ">> Project root: $PROJECT_ROOT"

# Allow override: PYTHON_BIN=python3.11 ./bootstrap.sh
PYTHON_BIN="${PYTHON_BIN:-python3}"

echo ">> Using Python binary: $PYTHON_BIN"

# ---------------------------------------------------------
# 1. Create virtual environment
# ---------------------------------------------------------
if [ ! -d ".venv" ]; then
  echo ">> Creating virtual environment in .venv"
  "$PYTHON_BIN" -m venv .venv
else
  echo ">> Virtual environment .venv already exists, skipping creation"
fi

# Activate venv
# shellcheck disable=SC1091
source .venv/bin/activate

echo ">> Virtual environment activated."

# ---------------------------------------------------------
# 2. Upgrade pip
# ---------------------------------------------------------
echo ">> Upgrading pip..."
"$PYTHON_BIN" -m pip install --upgrade pip --break-system-packages

# ---------------------------------------------------------
# 3. Install core dependencies
# ---------------------------------------------------------
echo ">> Installing core Python packages..."

"$PYTHON_BIN" -m pip install --break-system-packages \
  streamlit \
  python-dotenv \
  pandas \
  requests \
  watchdog

# ---------------------------------------------------------
# 4. Freeze requirements
# ---------------------------------------------------------
echo ">> Writing requirements.txt"
"$PYTHON_BIN" -m pip freeze > requirements.txt

echo ">> Bootstrap completed."
echo
echo ">> Launching app.py..."
streamlit run app.py