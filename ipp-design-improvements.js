(function(){'use 
function fixNav(){
  var nav=document.querySelector('nav ul,nav .nav-links,.nav-menu,nav ol');
  if(!nav)return;
  var items=Array.from(nav.querySelectorAll('li'));
  if(!items.length)return;
  // Build desired order map by matching link text
  var order=[
    'what we do',
    'structurereview',
    'incomearc',
    'ipp retirement tool',
    'about us',
    'contact us',
    'architecture of retirement',
    'begin your review',
    'advisor portal'
  ];
  // Sort items according to desired order
  items.sort(function(a,b){
    var ta=a.textContent.toLowerCase().trim();
    var tb=b.textContent.toLowerCase().trim();
    var ia=order.findIndex(function(o){return ta.includes(o);});
    var ib=order.findIndex(function(o){return tb.includes(o);});
    if(ia===-1)ia=99;
    if(ib===-1)ib=99;
    return ia-ib;
  });
  // Re-append in sorted order
  items.forEach(function(li){nav.appendChild(li);});
  // Also add IPP Retirement Tool if missing
  var hasIPP=items.some(function(li){return li.textContent.toLowerCase().includes('ipp retirement');});
  if(!hasIPP){
    var li=document.createElement('li');
    var isHome=window.location.pathname==='/'||window.location.pathname.endsWith('index.html');
    li.innerHTML='<a href="ipp-retirement-tool.html">IPP Retirement Tool</a>';
    // Insert after IncomeArc
    var arcLi=items.find(function(li){return li.textContent.toLowerCase().includes('incomearc');});
    if(arcLi&&arcLi.nextSibling)nav.insertBefore(li,arcLi.nextSibling);
    else nav.appendChild(li);
  }
  // Add Architecture of Retirement if missing  
  var hasArch=items.some(function(li){return li.textContent.toLowerCase().includes('architecture');});
  if(!hasArch){
    var li2=document.createElement('li');
    li2.innerHTML='<a href="index.html#book">Architecture of Retirement</a>';
    // Insert before Begin Your Review
    var beginLi=items.find(function(li){return li.textContent.toLowerCase().includes('begin');});
    if(beginLi)nav.insertBefore(li2,beginLi);
    else nav.appendChild(li2);
  }
}

function fixLayers(){
  var items=Array.from(document.querySelectorAll('.layer-item'));
  if(items.length!==4)return;
  var parent=items[0].parentNode;
  // Map current content: find each layer by keyword
  var guaranteed=items.find(function(el){return el.innerText.includes('GUARANTEED')||el.innerText.includes('Guaranteed');});
  var ltc=items.find(function(el){return el.innerText.includes('LONG-TERM')||el.innerText.includes('Long-Term Care');});
  var tax=items.find(function(el){return el.innerText.includes('TAX ELIM')||el.innerText.includes('Tax Elimination');});
  var growth=items.find(function(el){return el.innerText.includes('PROTECTED')||el.innerText.includes('Protected Growth');});
  if(!guaranteed||!ltc||!tax||!growth)return;
  // Update numbering
  function setNum(el,n){var numEl=el.querySelector('.layer-num');if(numEl)numEl.textContent='0'+n;}
  setNum(guaranteed,1);
  setNum(ltc,2);
  setNum(tax,3);
  setNum(growth,4);
  // Re-order in DOM
  parent.appendChild(guaranteed);
  parent.appendChild(ltc);
  parent.appendChild(tax);
  parent.appendChild(growth);
}

function fixFooter(){
  var footerNav=document.querySelector('footer nav ul,footer .footer-links,.footer-nav ul,.footer ul');
  if(!footerNav)return;
  var existing=Array.from(footerNav.querySelectorAll('a')).map(function(a){return a.textContent.toLowerCase();});
  var links=[
    {text:'What We Do',href:'index.html#what-we-do'},
    {text:'StructureReview™',href:'https://structurereview.integratedplanningpartners.com/structurereview.html'},
    {text:'IncomeArc™',href:'incomearc.html'},
    {text:'IPP Retirement Tool',href:'ipp-retirement-tool.html'},
    {text:'Architecture of Retirement',href:'index.html#book'},
    {text:'About Us',href:'about.html'},
    {text:'Contact Us',href:'index.html#contact'},
    {text:'Advisor Portal',href:'advisor-portal.html'}
  ];
  // Check which are missing and add them
  links.forEach(function(link){
    var found=existing.some(function(e){return e.includes(link.text.toLowerCase().slice(0,8));});
    if(!found){
      var li=document.createElement('li');
      li.innerHTML='<a href="'+link.href+'">'+link.text+'</a>';
      footerNav.appendChild(li);
    }
  });
}

function fixStructureReview(){
  if(!window.location.hostname.includes('structurereview'))return;
  // Remove/hide the advisor report button - look for common patterns
  var btns=Array.from(document.querySelectorAll('button,a,.btn,[class*=btn],[class*=button]'));
  btns.forEach(function(btn){
    var t=btn.textContent.toLowerCase();
    if(t.includes('advisor report')||t.includes('view report')||t.includes('download report')||t.includes('see report')){
      btn.style.display='none';
    }
  });
  // Remove schedule meeting buttons
  btns.forEach(function(btn){
    var t=btn.textContent.toLowerCase();
    if(t.includes('schedule')||t.includes('book a meeting')||t.includes('book meeting')||t.includes('calendly')){
      var parent=btn.closest('[class*=schedule],[class*=meeting],[class*=calendar]')||btn.parentElement;
      if(parent)parent.style.display='none';
    }
  });
  // Update completion/thank you message
  var msgs=Array.from(document.querySelectorAll('h1,h2,h3,p,[class*=complete],[class*=success],[class*=thank],[class*=confirm]'));
  msgs.forEach(function(el){
    var t=el.textContent;
    if(t.toLowerCase().includes('schedule')&&(t.toLowerCase().includes('meeting')||t.toLowerCase().includes('call'))){
      el.textContent=el.textContent.replace(/[Ss]chedule a (meeting|call|consultation)[^.]*/g,'Your advisor will be in touch with you shortly.');
    }
  });
}
strict';function fixEncoding(){
  var map=[
    // â¢ style: UTF-8 bytes of ™ (e2 84 a2) misread as Latin-1
    [/â¢/g,'™'],
    // Ã¢ÂÂ style: double-encoded UTF-8
    [/Ã¢ÂÂ¬/g,'€'],
    [/Ã¢ÂÂ¢/g,'™'],
    [/Ã¢ÂÂ/g,'—'],
    [/Ã¢ÂÂ/g,'–'],
    [/Ã¢ÂÂ/g,'“'],
    [/Ã¢ÂÂ/g,'”'],
    [/Ã¢ÂÂ/g,'’'],
    // ÃÂ style: simpler double-encoding 
    [/ÃƒÂ¢Ã‚ÂÃ‚Â¢/g,'™'],
    [/ÃƒÂ¢Ã‚ÂÃ‚Â/g,'—'],
    // String-level patterns (as they appear in DOM text)
    [/Ã¢ÂÂ¬/g,'€'],
  ];
  function fix(n){
    if(n.nodeType===3){
      var v=n.nodeValue;
      var changed=false;
      map.forEach(function(p){var n2=v.replace(p[0],p[1]);if(n2!==v){v=n2;changed=true;}});
      if(changed)n.nodeValue=v;
    }else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'){
      Array.from(n.childNodes).forEach(fix);
      // Also fix attributes like title, placeholder
      if(n.title){var t=n.title;map.forEach(function(p){t=t.replace(p[0],p[1]);});n.title=t;}
    }
  }
  if(document.body)fix(document.body);
  var t=document.title;map.forEach(function(p){t=t.replace(p[0],p[1]);});document.title=t;
}function init(){applyHeroImage();applyFrameworkIcons();if(window.Chart){injectIRAChart();}else{var _ci=setInterval(function(){if(window.Chart){clearInterval(_ci);injectIRAChart();}},100);}applyIncomeArcHero();applyAboutHero();applyAdvisorPortalHero();injectLTCHomepage();injectLTCIncomeArc();fixNav();fixLayers();fixFooter();fixStructureReview();setTimeout(fixEncoding,50);}
function applyHeroImage(){if(window.location.pathname.includes('incomearc')||window.location.pathname.includes('about')||window.location.pathname.includes('advisor'))return;var h=document.querySelector('.hero');if(!h)return;h.style.backgroundImage='linear-gradient(135deg,rgba(8,18,38,0.85) 0%,rgba(8,18,38,0.65) 50%,rgba(15,30,58,0.55) 100%), url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=80&fit=crop")';h.style.backgroundSize='cover';h.style.backgroundPosition='center 40%';h.style.backgroundRepeat='no-repeat';}
function applyIncomeArcHero(){if(!window.location.pathname.includes('incomearc'))return;var h=document.querySelector('.hero');if(!h)return;h.style.backgroundImage='linear-gradient(135deg,rgba(8,18,38,0.88) 0%,rgba(8,18,38,0.70) 55%,rgba(15,30,58,0.50) 100%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=80&fit=crop")';h.style.backgroundSize='cover';h.style.backgroundPosition='center 30%';h.style.backgroundRepeat='no-repeat';}
function applyAboutHero(){if(!window.location.pathname.includes('about'))return;var h=document.querySelector('.page-header')||document.querySelector('section');if(!h)return;h.style.backgroundImage='linear-gradient(135deg,rgba(8,18,38,0.90) 0%,rgba(8,18,38,0.72) 50%,rgba(15,30,58,0.55) 100%), url("https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1800&q=80&fit=crop")';h.style.backgroundSize='cover';h.style.backgroundPosition='center 20%';h.style.backgroundRepeat='no-repeat';}
function applyAdvisorPortalHero(){if(!window.location.pathname.includes('advisor'))return;var d=Array.from(document.querySelectorAll('div')).find(function(el){return el.textContent.includes('Planning infrastructure')&&el.offsetWidth<window.innerWidth*0.65&&el.offsetWidth>200;});if(!d)return;d.style.backgroundImage='linear-gradient(135deg,rgba(8,18,38,0.88) 0%,rgba(8,18,38,0.75) 60%,rgba(15,30,58,0.65) 100%), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop")';d.style.backgroundSize='cover';d.style.backgroundPosition='center center';d.style.backgroundRepeat='no-repeat';}
function applyFrameworkIcons(){var icons=['<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="9" stroke="#C8A96E" stroke-width="2"/><line x1="22" y1="22" x2="30" y2="30" stroke="#C8A96E" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="10" x2="15" y2="20" stroke="#C8A96E" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="15" x2="20" y2="15" stroke="#C8A96E" stroke-width="1.5" stroke-linecap="round"/></svg>','<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="4,28 12,20 20,14 28,8" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="24,8 28,8 28,12" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>','<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="6" y1="30" x2="30" y2="30" stroke="#C8A96E" stroke-width="2" stroke-linecap="round"/><polyline points="6,14 18,6 30,14" stroke="#C8A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="14" x2="10" y2="30" stroke="#C8A96E" stroke-width="2"/><line x1="18" y1="14" x2="18" y2="30" stroke="#C8A96E" stroke-width="2"/><line x1="26" y1="14" x2="26" y2="30" stroke="#C8A96E" stroke-width="2"/></svg>'];var cards=document.querySelectorAll('.process-card');cards.forEach(function(card,i){if(i>=icons.length)return;if(card.querySelector('.ipp-icon'))return;var ic=document.createElement('div');ic.className='ipp-icon';ic.style.cssText='margin-bottom:12px;';ic.innerHTML=icons[i];var n=card.querySelector('.process-number');if(n)card.insertBefore(ic,n);else card.insertBefore(ic,card.firstChild);card.style.transition='transform 0.2s ease,border-color 0.2s ease';card.style.borderTop='2px solid rgba(201,168,76,0.4)';card.addEventListener('mouseenter',function(){card.style.transform='translateY(-4px)';card.style.borderTopColor='rgba(201,168,76,0.9)';});card.addEventListener('mouseleave',function(){card.style.transform='';card.style.borderTopColor='rgba(201,168,76,0.4)';});});}
function injectIRAChart(){if(document.getElementById('iraGrowthChart'))return;var p=Array.from(document.querySelectorAll('p')).find(function(el){return el.textContent.includes('1,000,000 IRA growing');});if(!p)return;var w=document.createElement('div');w.style.cssText='margin:1.5rem 0;padding:1.5rem;background:rgba(8,18,38,0.6);border:1px solid rgba(200,169,110,0.3);border-radius:8px;';w.innerHTML='<canvas id="iraGrowthChart" style="max-height:300px"></canvas>';p.parentNode.insertBefore(w,p.nextSibling);new Chart(document.getElementById('iraGrowthChart').getContext('2d'),{type:'bar',data:{labels:['Today','Year 5','Year 10','Year 15','Year 20'],datasets:[{label:'Portfolio Value',data:[1000000,1402552,1967151,2758925,3869684],backgroundColor:'rgba(200,169,110,0.8)',borderColor:'#C8A96E',borderWidth:1},{label:'Tax Liability (36%)',data:[360000,504919,708174,993213,1393086],backgroundColor:'rgba(180,60,60,0.7)',borderColor:'#b43c3c',borderWidth:1}]},options:{responsive:true,plugins:{legend:{labels:{color:'#F5F2EC',font:{family:'Barlow'}}}},scales:{x:{ticks:{color:'#C8A96E'},grid:{color:'rgba(200,169,110,0.1)'}},y:{ticks:{color:'#C8A96E',callback:function(v){return'$'+(v/1000000).toFixed(1)+'M';}},grid:{color:'rgba(200,169,110,0.1)'}}}}})}
function injectLTCHomepage(){if(document.getElementById('ipp-ltc-section'))return;if(!document.querySelector('.processes-section'))return;var s=document.createElement('style');s.textContent='#ipp-ltc-section{background:#0E1C2E;padding:100px 0}#ipp-ltc-section .ltc-inner{max-width:1100px;margin:0 auto;padding:0 48px}#ipp-ltc-section .ltc-label{font-family:"Barlow Condensed",sans-serif;font-size:10px;letter-spacing:2.2px;color:#C8A96E;text-transform:uppercase;margin-bottom:24px}#ipp-ltc-section .ltc-headline{font-family:"Cormorant Garamond",serif;font-size:52px;font-weight:300;color:#F5F2EC;line-height:1.15;margin-bottom:32px;max-width:820px}#ipp-ltc-section .ltc-headline em{color:#C8A96E;font-style:italic}#ipp-ltc-section .ltc-body{font-family:Barlow,sans-serif;font-size:17px;color:#D8D0BC;line-height:1.8;max-width:780px;margin-bottom:20px}#ipp-ltc-section .ltc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:48px 0}#ipp-ltc-section .ltc-stat-card{background:rgb(30,46,68);padding:32px 28px;border-top:2px solid rgba(200,169,110,0.4)}#ipp-ltc-section .ltc-stat-number{font-family:"Cormorant Garamond",serif;font-size:48px;font-weight:300;color:#C8A96E;line-height:1;margin-bottom:8px}#ipp-ltc-section .ltc-stat-label{font-family:"Barlow Condensed",sans-serif;font-size:10px;letter-spacing:2px;color:#C8A96E;text-transform:uppercase;margin-bottom:12px}#ipp-ltc-section .ltc-stat-desc{font-family:Barlow,sans-serif;font-size:14px;color:#9DA8B4;line-height:1.6}#ipp-ltc-section .ltc-callout{background:rgb(30,46,68);padding:40px 44px;margin:48px 0;border-left:3px solid #C8A96E}#ipp-ltc-section .ltc-callout-title{font-family:"Cormorant Garamond",serif;font-size:28px;font-weight:400;color:#F5F2EC;margin-bottom:16px}#ipp-ltc-section .ltc-callout p{font-family:Barlow,sans-serif;font-size:16px;color:#D8D0BC;line-height:1.8;margin-bottom:14px}#ipp-ltc-section .ltc-cta-row{margin-top:40px}#ipp-ltc-section .ltc-source{font-family:Barlow,sans-serif;font-size:11px;color:#6B7885;margin-top:48px;line-height:1.6}@media(max-width:768px){#ipp-ltc-section .ltc-stats{grid-template-columns:1fr}#ipp-ltc-section .ltc-headline{font-size:36px}#ipp-ltc-section .ltc-inner{padding:0 24px}}';document.head.appendChild(s);var sec=document.createElement('section');sec.id='ipp-ltc-section';sec.innerHTML='<div class="ltc-inner"><div class="ltc-label">The Risk Even Wealth Doesn\'t Eliminate</div><h2 class="ltc-headline">Most affluent families assume they can<br>self-fund long-term care.<br><em>They\'re right. But the way they\'ll pay for it will cost far more than they realize.</em></h2><p class="ltc-body">According to the U.S. Department of Health &amp; Human Services, nearly 70% of people who reach 65 will need long-term care before they die. Annual nursing home costs now exceed $111,000&#8212;rising 7&#8211;9% annually&#8212;and none of it is covered by Medicare.</p><div class="ltc-stats"><div class="ltc-stat-card"><div class="ltc-stat-number">70%</div><div class="ltc-stat-label">Lifetime Probability</div><div class="ltc-stat-desc">Of people reaching 65 will need long-term care. Source: HHS</div></div><div class="ltc-stat-card"><div class="ltc-stat-number">$111K+</div><div class="ltc-stat-label">Annual Nursing Home Cost</div><div class="ltc-stat-desc">National median, semi-private room, 2024. Up 7&#8211;9% annually. Source: Genworth</div></div><div class="ltc-stat-card"><div class="ltc-stat-number">21%</div><div class="ltc-stat-label">Average Wealth Decline</div><div class="ltc-stat-desc">Couples with an LTC event see 21% wealth decline over 9 years. Source: Morningstar</div></div></div><div class="ltc-callout"><div class="ltc-callout-title">The Self-Funding Trap: Why the Math Works Against You</div><p>To net $100,000 from an IRA for care, you may need to withdraw $140,000&#8211;$150,000 or more after taxes. Multiply that across a multi-year event and you\'ve permanently eliminated decades of compounding. You don\'t lose your wealth&#8212;but the financial architecture you built takes a hit it never fully recovers from.</p></div><div class="ltc-callout-title" style="font-family:&quot;Cormorant Garamond&quot;,serif;font-size:28px;font-weight:400;color:#F5F2EC;margin-bottom:16px">The &#8220;Use It or Lose It&#8221; Problem No Longer Exists</div><p class="ltc-body">The protection layer in IncomeArcâ¢ uses a structure where if care is needed, tax-free benefits cover the cost while your portfolio stays intact. If care is never needed, the policy builds cash value and passes as a tax-free death benefit. A portion of your IRA or 401(k)&#8212;dollars the IRS was already going to claim&#8212;can be repositioned to fund this protection.</p><p class="ltc-body" style="color:#F5F2EC;font-weight:500">The people who built real wealth got there by making efficient decisions. This is one of them.</p><div class="ltc-cta-row"><a href="/incomearc.html" style="background:#C8A96E;color:#0E1C2E;padding:14px 32px;font-family:"Barlow Condensed",sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;display:inline-block">See How IncomeArcâ¢ Addresses This</a></div><p class="ltc-source">Sources: HHS/ACL; Genworth/CareScout 2024; Morningstar; WA Cares Fund. For informational purposes only.</p></div>';var ps=document.querySelector('.processes-section');if(ps&&ps.parentNode)ps.parentNode.insertBefore(sec,ps.nextSibling);}
function injectLTCIncomeArc(){if(document.getElementById('ipp-ltc-incomearc'))return;var ltcCard=Array.from(document.querySelectorAll('.problem-card')).find(function(el){return el.textContent.includes('long-term care');});if(!ltcCard)return;var t=ltcCard.querySelector('.problem-title');var d=ltcCard.querySelector('.problem-desc');if(t)t.textContent='What happens if I need long-term care Ã¢ÂÂ and am I handling it as efficiently as I think?';if(d)d.textContent='Nearly 70% of people reaching 65 will need long-term care. For those with significant retirement assets, the question is whether self-funding from taxable accounts is actually the smart choice when a better structure now exists.';var s=document.createElement('style');s.textContent='#ipp-ltc-incomearc{background:#0E1C2E;padding:100px 0;border-top:1px solid rgba(200,169,110,0.15)}#ipp-ltc-incomearc .ltci-inner{max-width:1100px;margin:0 auto;padding:0 48px}#ipp-ltc-incomearc .ltci-label{font-family:"Barlow Condensed",sans-serif;font-size:10px;letter-spacing:2.2px;color:#C8A96E;text-transform:uppercase;margin-bottom:24px}#ipp-ltc-incomearc .ltci-headline{font-family:"Cormorant Garamond",serif;font-size:52px;font-weight:300;color:#F5F2EC;line-height:1.15;margin-bottom:16px;max-width:820px}#ipp-ltc-incomearc .ltci-subhead{font-family:"Cormorant Garamond",serif;font-size:28px;font-weight:400;color:#C8A96E;font-style:italic;margin-bottom:36px}#ipp-ltc-incomearc .ltci-body{font-family:Barlow,sans-serif;font-size:17px;color:#D8D0BC;line-height:1.8;max-width:820px;margin-bottom:20px}#ipp-ltc-incomearc .ltci-two-col{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:48px 0}#ipp-ltc-incomearc .ltci-box{background:rgb(22,32,50);padding:36px 32px;border-top:2px solid rgba(200,169,110,0.4)}#ipp-ltc-incomearc .ltci-box-title{font-family:"Barlow Condensed",sans-serif;font-size:11px;letter-spacing:2px;color:#C8A96E;text-transform:uppercase;margin-bottom:16px}#ipp-ltc-incomearc .ltci-box p{font-family:Barlow,sans-serif;font-size:15px;color:#D8D0BC;line-height:1.75;margin-bottom:12px}#ipp-ltc-incomearc .ltci-highlight{background:rgb(30,46,68);border-left:3px solid #C8A96E;padding:36px 44px;margin:48px 0}#ipp-ltc-incomearc .ltci-highlight p{font-family:Barlow,sans-serif;font-size:17px;color:#D8D0BC;line-height:1.8;margin-bottom:14px}#ipp-ltc-incomearc .ltci-closing{font-family:"Cormorant Garamond",serif;font-size:32px;font-weight:300;color:#F5F2EC;line-height:1.4;max-width:720px;margin:48px 0 32px}#ipp-ltc-incomearc .ltci-cta-row{margin-top:40px}#ipp-ltc-incomearc .ltci-source{font-family:Barlow,sans-serif;font-size:11px;color:#6B7885;margin-top:48px;line-height:1.6}@media(max-width:768px){#ipp-ltc-incomearc .ltci-two-col{grid-template-columns:1fr}#ipp-ltc-incomearc .ltci-headline{font-size:36px}#ipp-ltc-incomearc .ltci-inner{padding:0 24px}}';document.head.appendChild(s);var sec=document.createElement('section');sec.id='ipp-ltc-incomearc';sec.innerHTML='<div class="ltci-inner"><div class="ltci-label">IncomeArcâ¢ &#8212; Layer 04 &#8212; Long-Term Care &amp; Legacy</div><h2 class="ltci-headline">The risk most affluent families assume they\'ve already solved.</h2><div class="ltci-subhead">They haven\'t. But the solution is simpler than they think.</div><p class="ltci-body">Nearly 70% of people who reach 65 will need long-term care. Women average 3.7 years of need; men 2.2 years. Annual nursing home costs exceed $111,000&#8212;rising 7&#8211;9% per year&#8212;and none is covered by Medicare.</p><div class="ltci-two-col"><div class="ltci-box"><div class="ltci-box-title">The Self-Funding Reality</div><p>Every IRA/401(k) dollar carries deferred tax liability. To net $100,000 for care you may withdraw $140,000&#8211;$150,000+. Across a multi-year event you\'ve permanently eliminated future compounding.</p><p>Morningstar: couples with an LTC event see 21% wealth decline over 9 years. They don\'t go broke&#8212;but the architecture they built never fully recovers.</p></div><div class="ltci-box"><div class="ltci-box-title">The IncomeArcâ¢ Approach</div><p>Layer 4 uses a Living Benefits IUL that works both ways.</p><p><strong style="color:#C8A96E">If care is needed:</strong> tax-free benefits cover costs; portfolio stays untouched.</p><p><strong style="color:#C8A96E">If care is never needed:</strong> cash value builds and passes tax-free to heirs. The &#8220;use it or lose it&#8221; objection no longer exists.</p></div></div><div class="ltci-highlight"><p><strong>What makes this compelling:</strong> IRA/401(k) dollars already earmarked for taxation can be repositioned to fund this protection. You\'re converting pre-tax dollars heading for a tax event into a dual-purpose asset&#8212;protected care coverage if needed, tax-free wealth transfer if not.</p></div><div class="ltci-closing">&#8220;The question is never whether you can afford long-term care. It\'s whether paying for it the hard way&#8212;with gross, taxable dollars and permanent compounding loss&#8212;is the right choice when a smarter structure is available.&#8221;</div><div class="ltci-cta-row"><a href="https://structurereview.integratedplanningpartners.com/structurereview.html" style="background:#C8A96E;color:#0E1C2E;padding:14px 32px;font-family:"Barlow Condensed",sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;display:inline-block">Begin Your StructureReviewâ¢</a></div><p class="ltci-source">Sources: HHS/ACL; ASPE; Genworth/CareScout 2024; Morningstar 2024; HHS 2022 LTSS; WA Cares Fund. For informational purposes only.</p></div>';var ls=document.querySelector('.layers-section');if(ls&&ls.parentNode)ls.parentNode.insertBefore(sec,ls.nextSibling);}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}})();