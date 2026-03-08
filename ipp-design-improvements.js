/**
 * Integrated Planning Partners — Design Improvements
 * =====================================================
 * Three enhancements:
 *   1. Hero section background image (Chicago skyline, dark overlay)
 *   2. Framework cards — custom SVG icons + hover polish
 *   3. IRA Growth Chart (Chart.js bar visualization)
 *
 * HOW TO USE (you don't need to read this — your helper will do it!):
 *   Add these two lines just before </body> in index.html:
 *
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
 *   <script src="ipp-design-improvements.js"></script>
 */

(function () {

  const GOLD = '#C9A84C';

  /* ================================================================
   * 1. HERO SECTION — Chicago skyline with dark gradient overlay
   * ================================================================ */
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.backgroundImage = `
      linear-gradient(135deg, rgba(8, 18, 38, 0.85) 0%, rgba(8, 18, 38, 0.65) 50%, rgba(15, 30, 58, 0.55) 100%),
      url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=80&fit=crop')
    `;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center 40%';
    hero.style.backgroundRepeat = 'no-repeat';
  }


  /* ================================================================
   * 2. FRAMEWORK CARDS — SVG icons + hover animation
   * ================================================================ */
  const icons = [
    // 01 StructureReview — Magnifying glass with crosshair
    `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="11" stroke="${GOLD}" stroke-width="2"/>
      <line x1="25.5" y1="25.5" x2="35" y2="35" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="13" y1="17" x2="21" y2="17" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="17" y1="13" x2="17" y2="21" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

    // 02 IncomeArc — Rising curve with arrow
    `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 32 Q12 20 20 16 Q28 12 36 6" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <polyline points="28,6 36,6 36,14" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="4" y1="36" x2="36" y2="36" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
    </svg>`,

    // 03 Architecture of Retirement — Classical columns
    `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="33" width="32" height="3" rx="1" fill="${GOLD}" opacity="0.6"/>
      <rect x="7" y="14" width="4" height="19" rx="1" fill="${GOLD}"/>
      <rect x="18" y="10" width="4" height="23" rx="1" fill="${GOLD}"/>
      <rect x="29" y="14" width="4" height="19" rx="1" fill="${GOLD}"/>
      <path d="M4 14 L20 4 L36 14" stroke="${GOLD}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  ];

  const cards = document.querySelectorAll('.process-card');
  cards.forEach((card, i) => {
    if (i >= 3) return;
    const numEl = card.querySelector('.process-number');
    if (numEl) {
      const iconWrap = document.createElement('div');
      iconWrap.innerHTML = icons[i];
      iconWrap.style.cssText = 'margin-bottom: 8px; opacity: 0.9;';
      card.insertBefore(iconWrap, numEl);
    }
    card.style.cssText += `
      border-top: 2px solid rgba(201, 168, 76, 0.4);
      transition: border-color 0.3s ease, transform 0.3s ease;
    `;
    card.addEventListener('mouseenter', () => {
      card.style.borderTopColor = 'rgba(201, 168, 76, 0.9)';
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderTopColor = 'rgba(201, 168, 76, 0.4)';
      card.style.transform = 'translateY(0)';
    });
  });


  /* ================================================================
   * 3. IRA GROWTH CHART — Chart.js bar chart
   * ================================================================ */
  function injectGrowthChart() {
    const allParas = Array.from(document.querySelectorAll('p, .section-body'));
    const targetPara = allParas.find(p => p.textContent.includes('$1,000,000 IRA growing'));
    if (!targetPara) return;

    const targetSection = targetPara.closest('section') || targetPara.closest('.section-inner');
    if (!targetSection) return;

    const chartWrap = document.createElement('div');
    chartWrap.style.cssText = `
      margin: 32px auto 0;
      max-width: 640px;
      padding: 28px 32px 20px;
      background: rgba(201, 168, 76, 0.05);
      border: 1px solid rgba(201, 168, 76, 0.2);
      border-radius: 4px;
    `;
    chartWrap.innerHTML = `
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};margin-bottom:16px;opacity:0.8;">
        IRA Growth Projection — $1M at 7% over 20 Years
      </div>
      <canvas id="ira-growth-chart" height="180"></canvas>
      <div style="display:flex;gap:24px;margin-top:14px;font-size:11px;color:rgba(245,242,236,0.5);letter-spacing:0.06em;">
        <span><span style="display:inline-block;width:10px;height:10px;background:${GOLD};border-radius:2px;margin-right:6px;opacity:0.8;"></span>Portfolio Value</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:rgba(180,50,50,0.7);border-radius:2px;margin-right:6px;"></span>Potential Tax Liability (est. 36%)</span>
      </div>
    `;

    const ctaEl = targetSection.querySelector('a, button, [class*="cta"]');
    targetSection.insertBefore(chartWrap, ctaEl || null);

    const years = [0, 5, 10, 15, 20];
    const labels = years.map(y => y === 0 ? 'Today' : 'Year ' + y);
    const portfolioValues = years.map(y => Math.round(1000000 * Math.pow(1.07, y)));
    const taxValues = portfolioValues.map(v => Math.round(v * 0.36));

    const ctx = document.getElementById('ira-growth-chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: portfolioValues,
            backgroundColor: 'rgba(201, 168, 76, 0.75)',
            borderColor: 'rgba(201, 168, 76, 1)',
            borderWidth: 1,
            borderRadius: 3,
          },
          {
            label: 'Tax Liability',
            data: taxValues,
            backgroundColor: 'rgba(180, 50, 50, 0.6)',
            borderColor: 'rgba(200, 60, 60, 0.8)',
            borderWidth: 1,
            borderRadius: 3,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ' $' + ctx.raw.toLocaleString() },
            backgroundColor: 'rgba(8, 18, 38, 0.95)',
            borderColor: 'rgba(201, 168, 76, 0.3)',
            borderWidth: 1,
            titleColor: GOLD,
            bodyColor: '#F5F2EC',
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(245,242,236,0.6)', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { color: 'rgba(255,255,255,0.1)' }
          },
          y: {
            ticks: {
              color: 'rgba(245,242,236,0.5)',
              font: { size: 10 },
              callback: v => '$' + (v / 1000000).toFixed(1) + 'M'
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    });
  }

  if (typeof Chart !== 'undefined') {
    injectGrowthChart();
  } else {
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    chartScript.onload = injectGrowthChart;
    document.head.appendChild(chartScript);
  }

})();
