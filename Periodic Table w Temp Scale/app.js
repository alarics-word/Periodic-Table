// app.js — Periodic Table Logic

// ── State ─────────────────────────────────
let selectedN = 74;
let filterCat = null;
let currentTempK = 3186; // default: Tungsten melting point area

// ── Helpers ───────────────────────────────
function kToC(k) { return (k - 273.15).toFixed(1); }
function kToF(k) { return ((k - 273.15) * 9/5 + 32).toFixed(1); }

function getPhase(el, tempK) {
  if (el.meltK === null && el.boilK === null) return 'unknown';
  const melt = el.meltK ?? Infinity;
  const boil = el.boilK ?? Infinity;
  if (tempK < melt) return 'solid';
  if (tempK >= melt && tempK < boil) return 'liquid';
  return 'gas';
}

function phaseLabel(phase) {
  return { solid: 'SOLID', liquid: 'LIQUID', gas: 'GAS', unknown: '?' }[phase];
}

// ── Card color per category ───────────────
const CAT_COLORS = {
  hydrogen: '#5c1a1a', alkali: '#5c2d0d', alkaline: '#5c3a0a',
  transition: '#0d2240', 'post-transition': '#0e3320',
  metalloid: '#0a2e2b', nonmetal: '#4a2e08', halogen: '#0e3320',
  noble: '#0a2e38', lanthanide: '#2d0f2a', actinide: '#1e0540', unknown: '#1a1a1a'
};

// ── Build Table ───────────────────────────
function buildTable() {
  const table = document.getElementById('ptable');
  table.innerHTML = '';

  const elMap = {};
  ELEMENTS.forEach(e => elMap[`${e.row},${e.col}`] = e);

  for (let r = 1; r <= 10; r++) {
    // Row 8 = spacer row between period 7 and lanthanides
    if (r === 8) {
      for (let c = 1; c <= 18; c++) {
        const sp = document.createElement('div');
        sp.style.gridRow = r;
        sp.style.gridColumn = c;
        table.appendChild(sp);
      }
      continue;
    }

    // Map grid rows to data rows
    // r 1-7 = periods 1-7
    // r 9   = lanthanides (data row 8)
    // r 10  = actinides   (data row 9)
    let dataRow = r;
    if (r === 9) dataRow = 8;
    if (r === 10) dataRow = 9;

    for (let c = 1; c <= 18; c++) {
      // Lanthanide / Actinide reference boxes
      if (r === 6 && c === 3) {
        const ref = document.createElement('div');
        ref.className = 'ref-cell';
        ref.style.gridRow = r; ref.style.gridColumn = c;
        ref.textContent = '57–71';
        table.appendChild(ref);
        continue;
      }
      if (r === 7 && c === 3) {
        const ref = document.createElement('div');
        ref.className = 'ref-cell';
        ref.style.gridRow = r; ref.style.gridColumn = c;
        ref.textContent = '89–103';
        table.appendChild(ref);
        continue;
      }
      // Series row labels in f-block rows
      if (r === 9 && c === 1) {
        const lbl = document.createElement('div');
        lbl.className = 'series-row-label';
        lbl.style.gridRow = r; lbl.style.gridColumn = '1/3';
        lbl.textContent = 'Lanthanides';
        table.appendChild(lbl);
        continue;
      }
      if (r === 10 && c === 1) {
        const lbl = document.createElement('div');
        lbl.className = 'series-row-label';
        lbl.style.gridRow = r; lbl.style.gridColumn = '1/3';
        lbl.textContent = 'Actinides';
        table.appendChild(lbl);
        continue;
      }
      // Skip col 2 on f-block rows (used by span above)
      if ((r === 9 || r === 10) && c === 2) continue;

      const el = elMap[`${dataRow},${c}`];

      if (el) {
        const div = document.createElement('div');
        div.className = `cell cat-${el.cat}`;
        div.style.gridRow = r;
        div.style.gridColumn = c;
        div.dataset.n = el.n;
        div.innerHTML = `
          <div class="cell-num">${el.n}</div>
          <div class="cell-sym">${el.sym}</div>
          <div class="cell-name">${el.name}</div>
          <div class="cell-mass">${el.mass}</div>
          <div class="phase-dot"></div>
        `;
        div.addEventListener('click', () => selectElement(el.n));
        div.addEventListener('mouseenter', () => {
          document.getElementById('hover-bg-name').textContent = el.name;
        });
        div.addEventListener('mouseleave', () => {
          document.getElementById('hover-bg-name').textContent = '';
        });
        table.appendChild(div);
      } else {
        const empty = document.createElement('div');
        empty.style.gridRow = r;
        empty.style.gridColumn = c;
        table.appendChild(empty);
      }
    }
  }
}

// ── Update all cell states from temperature ──
function updatePhaseColors(tempK) {
  document.querySelectorAll('.cell[data-n]').forEach(cell => {
    const el = ELEMENTS.find(e => e.n === parseInt(cell.dataset.n));
    if (!el) return;
    cell.classList.remove('state-solid', 'state-liquid', 'state-gas', 'state-unknown-phase');
    const phase = getPhase(el, tempK);
    if (phase === 'unknown') cell.classList.add('state-unknown-phase');
    else cell.classList.add(`state-${phase}`);
  });
}

// ── Select Element ────────────────────────
function selectElement(n) {
  const el = ELEMENTS.find(e => e.n === n);
  if (!el) return;
  selectedN = n;

  // Card background
  document.getElementById('element-card').style.background = CAT_COLORS[el.cat] || '#1a1a1a';

  // Fields
  document.getElementById('el-number').textContent = el.n;
  document.getElementById('el-symbol').textContent = el.sym;
  document.getElementById('el-name').textContent = el.name;
  document.getElementById('el-mass').textContent = el.mass;
  document.getElementById('el-electrons').innerHTML = el.levels.split(',').join('<br>');

  document.getElementById('p-series').textContent = el.series;
  document.getElementById('p-melt').textContent = el.melt;
  document.getElementById('p-boil').textContent = el.boil;
  document.getElementById('p-state').textContent = el.state;
  document.getElementById('p-density').textContent = el.density;
  document.getElementById('p-ea').textContent = el.ea;
  document.getElementById('p-conduct').textContent = el.conduct;
  document.getElementById('p-heat').textContent = el.heat;
  document.getElementById('p-weight').textContent = el.mass + ' u';
  document.getElementById('p-levels').textContent = el.levels;
  document.getElementById('p-ion').textContent = el.ion;
  document.getElementById('p-en').textContent = el.en;
  document.getElementById('p-radius').textContent = el.radius;
  document.getElementById('p-disc').textContent = el.disc;
  document.getElementById('p-abund').textContent = el.abund;

  // Current phase badge
  const phase = getPhase(el, currentTempK);
  const badge = document.getElementById('el-state-badge');
  badge.textContent = phaseLabel(phase);
  badge.className = phase === 'unknown' ? '' : phase;

  // Highlight cell
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('selected', 'dimmed');
  });
  if (filterCat) {
    document.querySelectorAll('.cell[data-n]').forEach(c => {
      const e = ELEMENTS.find(el => el.n === parseInt(c.dataset.n));
      if (e && e.cat !== filterCat) c.classList.add('dimmed');
    });
  }
  const sel = document.querySelector(`.cell[data-n="${n}"]`);
  if (sel) sel.classList.add('selected');
}

// ── Temperature Slider ────────────────────
function initSlider() {
  const slider = document.getElementById('temp-slider');
  const dispK  = document.getElementById('disp-k');
  const dispC  = document.getElementById('disp-c');
  const dispF  = document.getElementById('disp-f');

  function applyTemp(k) {
    currentTempK = k;
    slider.value = k;
    dispK.textContent = Math.round(k);
    dispC.textContent = kToC(k);
    dispF.textContent = kToF(k);
    updatePhaseColors(k);
    // refresh selected badge
    selectElement(selectedN);
  }

  slider.addEventListener('input', () => applyTemp(parseFloat(slider.value)));

  document.getElementById('btn-minus').addEventListener('click', () => {
    applyTemp(Math.max(0, currentTempK - 100));
  });
  document.getElementById('btn-plus').addEventListener('click', () => {
    applyTemp(Math.min(6000, currentTempK + 100));
  });

  applyTemp(currentTempK);
}

// ── Legend Filter ─────────────────────────
function initLegend() {
  document.querySelectorAll('.legend-item[data-cat]').forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.dataset.cat;
      if (filterCat === cat) {
        filterCat = null;
        item.classList.remove('active');
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('dimmed'));
      } else {
        filterCat = cat;
        document.querySelectorAll('.legend-item').forEach(l => l.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.cell[data-n]').forEach(c => {
          const el = ELEMENTS.find(e => e.n === parseInt(c.dataset.n));
          if (el && el.cat !== cat) c.classList.add('dimmed');
          else c.classList.remove('dimmed');
        });
      }
    });
  });
}

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildTable();
  initSlider();
  initLegend();
  selectElement(74);
});
