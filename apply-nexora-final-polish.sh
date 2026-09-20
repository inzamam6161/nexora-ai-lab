#!/usr/bin/env bash
set -euo pipefail

# Nexora AI Lab — final visual polish
# Run from the nexora-ai-lab project root:
#   bash apply-nexora-final-polish.sh

if [[ ! -f "package.json" ]] || ! grep -q '"name": "nexora-ai-lab"' package.json; then
  echo "Error: run this from the nexora-ai-lab project root."
  exit 1
fi

echo "==> Applying final Nexora polish"

# Add a stable data attribute to each tool card so individual icons can be
# tuned without changing tool logic.
python3 <<'PY'
from pathlib import Path

path = Path("src/pages/Dashboard.tsx")
text = path.read_text()

old = '<article className="tool-card" key={tool.id}>'
new = (
    '<article\n'
    '                className="tool-card"\n'
    '                data-tool={tool.id}\n'
    '                key={tool.id}\n'
    '              >'
)

if old in text:
    text = text.replace(old, new)

path.write_text(text)
PY

# Remove an earlier polish block if the script is rerun, then append a fresh one.
python3 <<'PY'
from pathlib import Path

path = Path("src/index.css")
text = path.read_text()

marker = "/* ===== NEXORA FINAL POLISH ===== */"
if marker in text:
    text = text.split(marker)[0].rstrip() + "\n"

polish = r'''
/* ===== NEXORA FINAL POLISH ===== */

/* Softer product framing */
:root {
  --line: rgba(119, 146, 213, 0.135);
  --line-strong: rgba(139, 166, 239, 0.24);
  --shadow: 0 14px 38px rgba(2, 7, 20, 0.38);
}

.shell__header {
  margin-top: 20px;
  margin-bottom: 10px;
}

.shell__content {
  margin-bottom: 22px;
  padding-bottom: 18px;
}

/* Tighter vertical rhythm so more content appears in the first viewport */
.dashboard {
  gap: 18px;
  padding-top: 4px;
}

.hero,
.quick-examples,
.tools-section {
  padding: 24px;
}

.hero {
  gap: 24px;
  align-items: stretch;
}

.hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero__content h1 {
  font-size: clamp(2.55rem, 4.55vw, 4.55rem);
  line-height: 0.98;
}

.hero__lead {
  margin-top: 16px;
  font-size: 1.03rem;
  line-height: 1.62;
}

.hero__features {
  margin-top: 22px;
  gap: 12px;
}

.hero__feature {
  min-height: 104px;
  padding: 14px;
  border-color: rgba(119, 146, 213, 0.13);
  background: rgba(10, 21, 41, 0.66);
}

.hero__feature strong {
  font-size: 0.92rem;
}

.hero__feature small {
  font-size: 0.84rem;
}

.hero__command {
  gap: 14px;
  padding: 22px;
  border-color: rgba(119, 146, 213, 0.15);
}

.hero__command-head h3 {
  font-size: 1.55rem;
}

.command-input {
  padding: 15px 17px;
}

.command-chips,
.status-pills {
  gap: 8px;
}

.command-chips button,
.status-pills span {
  padding: 8px 12px;
}

.status-pills span {
  font-size: 0.82rem;
}

/* Quick examples: less empty vertical area */
.quick-examples {
  padding-top: 22px;
  padding-bottom: 22px;
}

.quick-examples .section-header {
  margin-bottom: 14px;
}

.quick-examples .eyebrow {
  margin-bottom: 8px;
}

.quick-examples__grid {
  gap: 14px;
}

.quick-card {
  min-height: 94px;
  padding: 16px;
  border-color: rgba(119, 146, 213, 0.13);
}

.quick-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
}

/* Force tools title to the left and filters to the right */
.tools-section .section-header--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  justify-content: initial;
  gap: 24px;
  width: 100%;
  margin-bottom: 16px;
}

.tools-section .section-header--split > div:first-child {
  justify-self: start;
  align-self: end;
  margin: 0;
  text-align: left;
  max-width: 620px;
}

.tools-section .section-header--split > div:first-child h2,
.tools-section .section-header--split > div:first-child p {
  text-align: left;
}

.tools-section .filter-bar {
  justify-self: end;
  align-self: end;
}

.tools-section {
  padding-top: 24px;
}

/* Tool cards: consistent heights, clearer icons, calmer borders */
.tool-grid {
  gap: 14px;
  grid-auto-rows: 1fr;
}

.tool-card {
  min-height: 198px;
  height: 100%;
  padding: 17px;
  gap: 16px;
  border-color: rgba(119, 146, 213, 0.13);
  background:
    linear-gradient(
      180deg,
      rgba(11, 22, 43, 0.78),
      rgba(8, 17, 34, 0.78)
    );
  box-shadow: 0 10px 26px rgba(2, 7, 20, 0.18);
}

.tool-card:hover {
  transform: translateY(-3px);
  border-color: rgba(143, 137, 255, 0.28);
  background:
    linear-gradient(
      180deg,
      rgba(13, 26, 50, 0.92),
      rgba(9, 19, 38, 0.92)
    );
  box-shadow: 0 14px 30px rgba(2, 7, 20, 0.28);
}

.tool-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  color: #aeb8ff;
  background:
    linear-gradient(
      145deg,
      rgba(122, 108, 255, 0.24),
      rgba(63, 184, 255, 0.12)
    );
  border-color: rgba(145, 152, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 8px 18px rgba(4, 10, 24, 0.22);
}

.tool-card__icon svg,
.quick-card__icon svg {
  display: block;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  opacity: 1;
}

/* Extra assurance for the Data Analyst icon shown too dark on desktop */
.tool-card[data-tool="data-analyst"] .tool-card__icon {
  color: #65b9ff;
  background:
    linear-gradient(
      145deg,
      rgba(44, 115, 219, 0.28),
      rgba(69, 171, 255, 0.14)
    );
}

.tool-card[data-tool="data-analyst"] .tool-card__icon svg {
  color: #75c2ff;
  stroke: #75c2ff;
}

.tool-card__body {
  gap: 11px;
}

.tool-card__head {
  align-items: flex-start;
}

.tool-card__head h3 {
  font-size: 1.06rem;
  line-height: 1.25;
}

.tool-card p {
  line-height: 1.55;
  font-size: 0.94rem;
}

.tool-tag {
  padding: 5px 8px;
  font-size: 0.65rem;
  letter-spacing: 0.07em;
  opacity: 0.82;
  border-color: rgba(127, 150, 214, 0.18);
  background: rgba(12, 22, 42, 0.72);
}

.tool-card__footer {
  margin-top: auto;
  min-height: 28px;
  align-items: center;
}

.tool-card__meta {
  font-size: 0.86rem;
  opacity: 0.9;
}

.tool-card__open {
  margin-left: auto;
  min-width: 66px;
  justify-content: flex-end;
  font-size: 0.95rem;
}

.filter-bar {
  gap: 8px;
}

.filter-bar button {
  padding: 8px 13px;
  font-size: 0.91rem;
}

/* Footer less dominant than product content */
.dashboard-footer {
  padding: 18px 22px;
  border-color: rgba(119, 146, 213, 0.11);
}

/* Workspace pages inherit the same quieter premium treatment */
.work-hero,
.tool-intro,
.work-card,
.input-panel,
.result-panel,
.insight-view,
.social-input,
.social-preview-card,
.social-insights,
.result-section,
.dataset-preview,
[class*="chart"],
[class*="trend"],
[class*="anomaly"],
[class*="statistics"] {
  border-color: rgba(119, 146, 213, 0.13);
  box-shadow: 0 12px 32px rgba(2, 7, 20, 0.28);
}

.work-page,
.tool-workspace {
  gap: 18px;
}

.work-grid,
.tool-workspace__grid,
.social-layout {
  gap: 18px;
}

/* Tablet */
@media (max-width: 1180px) {
  .tools-section .section-header--split {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .tools-section .filter-bar {
    justify-self: start;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .tool-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-examples__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Small tablet */
@media (max-width: 820px) {
  .quick-examples__grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .tool-card {
    min-height: 0;
  }

  .hero__features {
    grid-template-columns: 1fr;
  }

  .tools-section .filter-bar {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }

  .tools-section .filter-bar::-webkit-scrollbar {
    display: none;
  }

  .tools-section .filter-bar button {
    flex: 0 0 auto;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .dashboard {
    gap: 14px;
  }

  .hero,
  .quick-examples,
  .tools-section {
    padding: 18px;
  }

  .hero__content h1 {
    font-size: 2.45rem;
  }

  .hero__lead {
    font-size: 0.98rem;
  }

  .hero__command {
    padding: 18px;
  }

  .quick-card {
    min-height: 82px;
  }

  .tool-card {
    grid-template-columns: auto 1fr;
    padding: 15px;
  }

  .tool-card__icon {
    width: 48px;
    height: 48px;
  }

  .tool-card__head {
    gap: 8px;
  }

  .tool-tag {
    display: none;
  }

  .tool-card__footer {
    flex-direction: row;
    align-items: center;
  }
}
'''

path.write_text(text.rstrip() + "\n\n" + marker + "\n" + polish.strip() + "\n")
PY

echo "==> Running lint"
npm run lint

echo "==> Running tests"
npm test

echo "==> Running production build"
npm run build

echo
echo "============================================================"
echo "Nexora final visual polish applied successfully."
echo
echo "Review locally:"
echo "  npm run dev"
echo
echo "Then:"
echo "  git status"
echo "  git diff"
echo
echo "If satisfied:"
echo '  git add -A'
echo '  git commit -m "Polish Nexora dashboard spacing and tool cards"'
echo '  git push'
echo "============================================================"
