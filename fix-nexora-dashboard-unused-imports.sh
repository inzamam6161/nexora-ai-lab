#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f "package.json" ]] || ! grep -q '"name": "nexora-ai-lab"' package.json; then
  echo "Error: run this from the nexora-ai-lab project root."
  exit 1
fi

echo "==> Removing unused Dashboard imports"

python3 <<'PY'
from pathlib import Path

path = Path("src/pages/Dashboard.tsx")
text = path.read_text()

for name in [
    "  CircleDollarSign,\n",
    "  MessageSquareText,\n",
    "  TerminalSquare,\n",
]:
    text = text.replace(name, "")

path.write_text(text)
PY

echo "==> Running lint"
npm run lint

echo "==> Running tests"
npm test

echo "==> Running build"
npm run build

echo
echo "All checks passed."
echo
echo "Next:"
echo '  git add -A'
echo '  git commit -m "Fix unused imports in Nexora dashboard"'
echo '  git push'
