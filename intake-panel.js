/*
 * Application Intake panel for the advisor dashboard.
 * Adds an "Application Intake" section to each client's detail screen:
 *   - create a secure link (life intake or annuity supplement) and copy it
 *   - re-copy, revoke, and track each link (sent, opened, submitted)
 *   - open submitted answers in intake-view.html
 * Load it once, after the dashboard's own script:   <script src="intake-panel.js"></script>
 */
(function () {
  var U = 'https://piixgvxrasddphklgazh.supabase.co';
  var K = 'sb_publishable_acvdk0hBniaB6qOD8_k8XQ_9R6FNbP_';
  var API = U + '/functions/v1/intake-advisor';
  var VIEW = 'intake-view.html';

  var FORMS = {
    life:        { label: 'Application Intake (life insurance)', body: { form: 'life' }, intro: 'application intake' },
    annuity_new: { label: 'Annuity Supplement (client has not done the Application Intake)', body: { form: 'annuity', annuity_mode: 'none' }, intro: 'annuity supplement' },
    annuity_done:{ label: 'Annuity Supplement (client already did the Application Intake)', body: { form: 'annuity', annuity_mode: 'done' }, intro: 'annuity supplement' }
  };
  var STATUS = { sent: 'Sent', opened: 'Opened', submitted: 'Submitted', revoked: 'Revoked', expired: 'Expired' };
  var COLORS = { sent: '#C8A96E', opened: '#E0A94A', submitted: '#4caf7d', revoked: '#8a9ab0', expired: '#8a9ab0' };

  function session() { try { return JSON.parse(localStorage.getItem('ipp_sb_session') || 'null'); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }

  function call(body) {
    var s = session();
    if (!s || !s.access_token) return Promise.resolve({ ok: false, error: 'signed_out' });
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': K, 'Authorization': 'Bearer ' + s.access_token },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return r.ok && d.ok ? d : { ok: false, error: d.error || (r.status === 401 ? 'signed_out' : 'failed'), detail: d.detail }; });
    }).catch(function () { return { ok: false, error: 'offline' }; });
  }
  var ERR = {
    signed_out: 'Your session has expired. Reload the portal and sign in again.',
    offline: 'Could not reach the server. Check your connection.',
    not_configured: 'The encryption key has not been added to Supabase yet. Add INTAKE_ENCRYPTION_KEY and try again.',
    not_found: 'That client could not be found, or you do not have access to it.',
    inactive: 'That link is no longer active.',
    failed: 'Something went wrong. Please try again.'
  };

  function msg(r) {
    if (r.error === 'not_configured') {
      var d = String(r.detail || '');
      if (d === 'missing') return 'The server cannot find a secret named INTAKE_ENCRYPTION_KEY. Check the name is spelled exactly like that and was saved in the ipp-advisor-portal project, then try again.';
      if (d === 'not_base64') return 'The encryption key was found but has characters it cannot use, often quotation marks or a copied label. Create a new one with  openssl rand -base64 32  and paste only that result.';
      var m = d.match(/^length_(\d+)$/);
      if (m) return 'The encryption key decodes to ' + m[1] + ' bytes, but it must be exactly 32. Create a new one with  openssl rand -base64 32  (not -hex) and paste only that result.';
    }
    return ERR[r.error] || ERR.failed;
  }

  function copy(text, done) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  var CSS = '#intake-panel .ip-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}' +
    '#intake-panel select,#intake-panel input.ip-link{background:var(--navy3,#162032);color:var(--white,#F5F2EC);border:1px solid var(--border,rgba(255,255,255,.12));border-radius:4px;padding:8px 10px;font-size:13px;font-family:inherit;min-width:0}' +
    '#intake-panel select{flex:1 1 260px}#intake-panel input.ip-link{flex:1 1 260px}' +
    '#intake-panel button.ip-btn{background:var(--gold,#C8A96E);color:var(--navy,#0E1824);border:0;border-radius:4px;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;font-family:inherit}' +
    '#intake-panel button.ip-btn.ghost{background:transparent;color:var(--gold,#C8A96E);border:1px solid var(--gold,#C8A96E)}' +
    '#intake-panel button.ip-btn:disabled{opacity:.55;cursor:default}' +
    '#intake-panel .ip-item{background:var(--navy3,#162032);border:1px solid var(--border,rgba(255,255,255,.12));border-radius:4px;padding:10px 12px;margin-bottom:8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '#intake-panel .ip-item .ip-main{flex:1 1 220px;min-width:0;font-size:13px}' +
    '#intake-panel .ip-sub{font-size:11.5px;color:var(--gray,#8a9ab0)}' +
    '#intake-panel .ip-chip{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;border-radius:20px;padding:2px 8px;margin-left:6px}' +
    '#intake-panel .ip-msg{font-size:12.5px;margin:6px 0 10px}' +
    '#intake-panel a.ip-btn{display:inline-block;text-decoration:none;background:transparent;color:var(--gold,#C8A96E);border:1px solid var(--gold,#C8A96E);border-radius:4px;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:.04em}';

  function shell(clientId) {
    var wrap = document.createElement('div');
    wrap.className = 'detail-section'; wrap.id = 'intake-panel'; wrap.setAttribute('data-client', clientId);
    wrap.innerHTML = '<style>' + CSS + '</style><div class="detail-section-title">Application Intake</div><div class="ip-body"><div class="ip-sub">Loading…</div></div>';
    return wrap;
  }

  function place(panel) {
    var old = document.getElementById('intake-panel'); if (old && old.parentNode) old.parentNode.removeChild(old);
    var body = document.getElementById('detail-body'); if (!body) return;
    var titles = body.querySelectorAll('.detail-section-title'), anchor = null;
    for (var i = 0; i < titles.length; i++) { if (/Pipeline/i.test(titles[i].textContent)) { anchor = titles[i].parentNode; break; } }
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor); else body.appendChild(panel);
  }

  function render(clientId, firstName) {
    var panel = shell(clientId); place(panel);
    var body = panel.querySelector('.ip-body');

    function draw(data, note) {
      var subs = {}; (data.submissions || []).forEach(function (s) { subs[s.invite_id] = s; });
      var html = '<div class="ip-row"><select id="ip-form">' +
        Object.keys(FORMS).map(function (k) { return '<option value="' + k + '">' + esc(FORMS[k].label) + '</option>'; }).join('') +
        '</select><button class="ip-btn" id="ip-create">Create link</button></div>' +
        '<div id="ip-new"></div>' + (note ? '<div class="ip-msg" style="color:var(--error,#e05757)">' + esc(note) + '</div>' : '');
      if (!(data.invites || []).length) html += '<div class="ip-sub" style="font-style:italic">No links created yet.</div>';
      (data.invites || []).forEach(function (i) {
        var st = i.status === 'submitted' ? 'submitted' : i.status === 'revoked' ? 'revoked' : i.expired ? 'expired' : i.status;
        var sub = subs[i.id], live = st === 'sent' || st === 'opened';
        html += '<div class="ip-item"><div class="ip-main"><strong>' + (i.form === 'annuity' ? 'Annuity Supplement' : 'Application Intake') + '</strong>' +
          '<span class="ip-chip" style="color:' + COLORS[st] + '">' + STATUS[st] + '</span>' +
          '<div class="ip-sub">Created ' + fmt(i.created_at) + (i.submitted_at ? ' · Submitted ' + fmt(i.submitted_at) : i.opened_at ? ' · Opened ' + fmt(i.opened_at) : '') + (live ? ' · Expires ' + fmt(i.expires_at) : '') + '</div>' + (sub ? '<div class="ip-sub">' + (sub.last_viewed_at ? 'Last viewed ' + fmt(sub.last_viewed_at) + ' by ' + esc(sub.last_viewed_by || 'Unknown') : 'Not viewed yet') + '</div>' : '') + '</div>' +
          (live ? '<button class="ip-btn ghost" data-copy="' + i.id + '">Copy link</button><button class="ip-btn ghost" data-revoke="' + i.id + '">Revoke</button>' : '') +
          (sub ? '<a class="ip-btn" target="_blank" rel="noopener" href="' + VIEW + '?s=' + encodeURIComponent(sub.id) + '">View answers</a>' : '') + '</div>';
      });
      body.innerHTML = html;
    }

    function load(note, then) {
      call({ action: 'list', client_id: clientId }).then(function (r) {
        if (!r.ok) { body.innerHTML = '<div class="ip-msg" style="color:var(--error,#e05757)">' + esc(msg(r)) + '</div>'; return; }
        draw(r, note);
        if (then) then();
      });
    }

    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'ip-create') {
        var kind = FORMS[document.getElementById('ip-form').value];
        b.disabled = true; b.textContent = 'Creating…';
        call(Object.assign({ action: 'create_invite', client_id: clientId }, kind.body)).then(function (r) {
          if (!r.ok) { load(msg(r)); return; }
          load('', function () { showNew(r.link, kind); });
        });
      } else if (b.hasAttribute('data-copy')) {
        b.disabled = true;
        call({ action: 'get_link', invite_id: b.getAttribute('data-copy') }).then(function (r) {
          if (!r.ok) { b.disabled = false; alert(msg(r)); return; }
          copy(r.link, function (ok) { b.disabled = false; b.textContent = ok ? 'Copied ✓' : 'Copy failed'; setTimeout(function () { b.textContent = 'Copy link'; }, 1800); });
        });
      } else if (b.hasAttribute('data-revoke')) {
        if (!confirm('Turn this link off? The client will no longer be able to open it.')) return;
        call({ action: 'revoke', invite_id: b.getAttribute('data-revoke') }).then(function (r) { load(r.ok ? '' : (msg(r))); });
      } else if (b.hasAttribute('data-copylink')) {
        copy(b.getAttribute('data-copylink'), function (ok) { b.textContent = ok ? 'Copied ✓' : 'Copy failed'; setTimeout(function () { b.textContent = 'Copy link'; }, 1800); });
      } else if (b.hasAttribute('data-copymsg')) {
        copy(b.getAttribute('data-copymsg'), function (ok) { b.textContent = ok ? 'Copied ✓' : 'Copy failed'; setTimeout(function () { b.textContent = 'Copy with a short message'; }, 1800); });
      }
    });

    function showNew(link, kind) {
      var box = document.getElementById('ip-new'); if (!box) return;
      var hi = firstName ? 'Hi ' + firstName + ', ' : 'Hi, ';
      var msg = hi + 'here is your secure link for the ' + kind.intro + ': ' + link + ' Questions? Call our office at 773-318-9608 or send us an email at support@integratedplanningpartners.com.';
      box.innerHTML = '<div class="ip-item" style="border-color:var(--gold,#C8A96E)"><div class="ip-main"><div class="ip-sub" style="margin-bottom:6px">New link ready. Paste it into an email or text message.</div>' +
        '<div class="ip-row" style="margin:0"><input class="ip-link" readonly value="' + esc(link) + '" onclick="this.select()">' +
        '<button class="ip-btn" data-copylink="' + esc(link) + '">Copy link</button>' +
        '<button class="ip-btn ghost" data-copymsg="' + esc(msg) + '">Copy with a short message</button></div></div></div>';
    }

    load();
  }

  function wrap() {
    if (typeof window.openClientDetail !== 'function' || window.openClientDetail.__intakeWrapped) return false;
    var orig = window.openClientDetail;
    var w = function (id) {
      var result = orig.apply(this, arguments);
      return Promise.resolve(result).then(function (v) {
        var first = '';
        try { var h = document.getElementById('detail-client-name'); first = (h && h.textContent || '').trim().split(/\s+/)[0] || ''; } catch (e) {}
        try { render(id, first); } catch (e) {}
        return v;
      });
    };
    w.__intakeWrapped = true; window.openClientDetail = w; return true;
  }
  if (!wrap()) { window.addEventListener('load', wrap); }
})();
