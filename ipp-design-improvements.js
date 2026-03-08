(function() {
  'use strict';

  function init() {
    applyHeroImage();
    applyFrameworkIcons();
    injectIRAChart();
    injectLTCHomepage();
    injectLTCIncomeArc();
  }

  // 1. Chicago skyline hero background
  function applyHeroImage() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    hero.style.backgroundImage = [
      'linear-gradient(135deg, rgba(8,18,38,0.85) 0%, rgba(8,18,38,0.65) 50%, rgba(15,30,58,0.55) 100%)',
      'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=80&fit=crop")'
    ].join(', ');
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center 40%';
    hero.style.backgroundRepeat = 'no-repeat';
  }

  // 2. Framework card SVG icons + hover
  function applyFrameworkIcons() {
    var icons = [
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="9" stroke="#C8A96E" stroke-width="2"/><line x1="22" y1="22" x2="30" y2="30" stroke="#C8A96E" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="10" x2="15" y2="20" stroke="#C8A96E" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="15" x2="20" y2="15" stroke="#C8A96E" stroke-width="1.5" stroke-linecap="round"/></svg>',
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="4,28 12,20 20,14 28,8" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="24,8 28,8 28,12" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="30" x2="30" y2="30" stroke="#C8A96E" stroke-width="2" stroke-linecap="round"/><polyline points="6,14 18,6 30,14" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="14" x2="10" y2="30" stroke="#C8A96E" stroke-width="2"/><line x1="18" y1="14" x2="18" y2="30" stroke="#C8A96E" stroke-width="2"/><line x1="26" y1="14" x2="26" y2="30" stroke="#C8A96E" stroke-width="2"/></svg>'
    ];
    var cards = document.querySelectorAll('.process-card');
    cards.forEach(function(card, i) {
      if (i >= icons.length) return;
      if (card.querySelector('.ipp-icon')) return;
      var iconEl = document.createElement('div');
      iconEl.className = 'ipp-icon';
      iconEl.style.cssText = 'margin-bottom:12px;';
      iconEl.innerHTML = icons[i];
      var numEl = card.querySelector('.process-number');
      if (numEl) card.insertBefore(iconEl, numEl);
      else card.insertBefore(iconEl, card.firstChild);
      card.style.transition = 'transform 0.2s ease, border-color 0.2s ease';
      card.style.borderTop = '2px solid rgba(201,168,76,0.4)';
      card.addEventListener('mouseenter', function() {
        card.style.transform = 'translateY(-4px)';
        card.style.borderTopColor = 'rgba(201,168,76,0.9)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.borderTopColor = 'rgba(201,168,76,0.4)';
      });
    });
  }

  // 3. IRA Growth Chart
  function injectIRAChart() {
    if (document.getElementById('iraGrowthChart')) return;
    var paras = Array.from(document.querySelectorAll('p'));
    var targetPara = paras.find(function(p) { return p.textContent.includes('1,000,000 IRA growing'); });
    if (!targetPara) return;
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin:1.5rem 0;padding:1.5rem;background:rgba(8,18,38,0.6);border:1px solid rgba(200,169,110,0.3);border-radius:8px;';
    wrapper.innerHTML = '<canvas id="iraGrowthChart" style="max-height:300px"></canvas>';
    targetPara.parentNode.insertBefore(wrapper, targetPara.nextSibling);
    var ctx = document.getElementById('iraGrowthChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Today', 'Year 5', 'Year 10', 'Year 15', 'Year 20'],
        datasets: [
          { label: 'Portfolio Value', data: [1000000,1402552,1967151,2758925,3869684], backgroundColor: 'rgba(200,169,110,0.8)', borderColor: '#C8A96E', borderWidth: 1 },
          { label: 'Tax Liability (36%)', data: [360000,504919,708174,993213,1393086], backgroundColor: 'rgba(180,60,60,0.7)', borderColor: '#b43c3c', borderWidth: 1 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#F5F2EC', font: { family: 'Barlow' } } } },
        scales: {
          x: { ticks: { color: '#C8A96E' }, grid: { color: 'rgba(200,169,110,0.1)' } },
          y: { ticks: { color: '#C8A96E', callback: function(v) { return '$' + (v/1000000).toFixed(1) + 'M'; } }, grid: { color: 'rgba(200,169,110,0.1)' } }
        }
      }
    });
  }