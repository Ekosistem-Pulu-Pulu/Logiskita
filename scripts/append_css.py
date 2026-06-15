css_part3 = r"""
.testimonials-section{position:relative;z-index:1;padding:100px 0;background:rgba(255,255,255,.02)}
.testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.testimonial-card-new{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all .3s}
.testimonial-card-new:hover{transform:translateY(-4px);border-color:rgba(79,124,255,.3)}
.tc-stars{margin-bottom:14px;color:#f5c542;display:flex;gap:3px;font-size:.9rem}
.testimonial-card-new p{color:rgba(255,255,255,.8);font-size:.92rem;line-height:1.75;margin-bottom:18px;font-style:italic}
.tc-author{display:flex;align-items:center;gap:12px}
.tc-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:grid;place-items:center;color:#fff;font-size:.85rem}
.tc-author strong{display:block;font-size:.9rem}
.tc-author span{font-size:.78rem;color:var(--muted)}
@media(max-width:900px){.testimonials-grid{grid-template-columns:1fr}}
.cta-section{position:relative;z-index:1;padding:80px 0}
.cta-card{background:linear-gradient(135deg,rgba(79,124,255,.15),rgba(39,194,176,.1));border:1px solid rgba(79,124,255,.2);border-radius:28px;padding:60px;text-align:center}
.cta-card h2{font-size:2.2rem;font-weight:800;margin-bottom:14px}
.cta-card p{color:var(--muted);font-size:1.05rem;margin-bottom:30px}
.cta-actions{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.site-footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:60px 0 30px}
.footer-container{max-width:1200px;margin:0 auto;padding:0 24px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
.footer-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.3rem;margin-bottom:14px}
.footer-logo i{color:var(--accent)}
.footer-brand p{color:var(--muted);font-size:.88rem;line-height:1.7}
.footer-links-group h4{font-size:.85rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;color:rgba(255,255,255,.5)}
.footer-links-group a{display:block;color:var(--muted);font-size:.88rem;padding:4px 0;transition:color .2s}
.footer-links-group a:hover{color:#fff}
.footer-bottom{border-top:1px solid var(--border);padding-top:24px;text-align:center;color:var(--muted);font-size:.82rem}
.footer-bottom p{margin-bottom:4px}
@media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr;gap:30px}}
@media(max-width:600px){.footer-grid{grid-template-columns:1fr}}
.guide-widget{position:fixed;bottom:24px;right:24px;z-index:9999}
.guide-toggle{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));border:none;color:#fff;font-size:1.4rem;cursor:pointer;box-shadow:0 8px 30px rgba(79,124,255,.4);transition:all .3s;display:grid;place-items:center}
.guide-toggle:hover{transform:scale(1.08)}
.guide-panel{position:absolute;bottom:70px;right:0;width:380px;max-height:500px;background:rgba(13,18,32,.97);border:1px solid var(--border);border-radius:20px;backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden}
.guide-panel.open{display:flex}
.guide-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--border)}
.guide-header h3{font-size:1rem;display:flex;align-items:center;gap:8px}
.guide-header h3 i{color:var(--accent)}
.guide-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:1rem;padding:4px}
.guide-body{padding:16px 22px 22px;overflow-y:auto;max-height:400px}
.guide-step{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.guide-step:last-of-type{border-bottom:none}
.gs-number{width:32px;height:32px;border-radius:10px;background:rgba(79,124,255,.15);color:var(--primary);display:grid;place-items:center;font-weight:800;font-size:.85rem;flex-shrink:0}
.gs-content h4{font-size:.9rem;margin-bottom:4px;font-weight:700}
.gs-content p{font-size:.8rem;color:var(--muted);line-height:1.6}
.guide-footer{margin-top:14px}
.guide-tip{display:flex;gap:10px;padding:14px;background:rgba(243,156,18,.08);border:1px solid rgba(243,156,18,.15);border-radius:12px;font-size:.8rem;color:rgba(255,255,255,.75)}
.guide-tip i{color:#f5c542;margin-top:2px}
.reveal-on-scroll{opacity:0;transform:translateY(30px);transition:all .6s ease}
.reveal-on-scroll.revealed{opacity:1;transform:translateY(0)}
"""

css_part4 = r"""
.header{background:linear-gradient(135deg,#1a2a45,#132d55);color:#fff;padding:48px 24px 36px;border-bottom:1px solid var(--border);position:relative;overflow:hidden;text-align:center}
.header-content{max-width:1200px;margin:0 auto;position:relative;z-index:1}
.logo-section{display:inline-flex;align-items:center;gap:14px;margin-bottom:10px;padding:12px 24px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--border);backdrop-filter:blur(14px)}
.logo-section i{font-size:1.5rem;color:var(--accent)}
.header h1{font-size:clamp(2.8rem,3.6vw,4.4rem);letter-spacing:-.05em;line-height:1.05;margin-bottom:18px}
.tagline{font-size:1.05rem;line-height:1.8;color:rgba(255,255,255,.78);max-width:760px;margin:0 auto}
.panel-actions{display:flex;justify-content:flex-start;gap:16px;flex-wrap:wrap;margin:20px auto 0;max-width:1200px;padding:0 24px}
.panel-button{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:#f3f7fb;font-weight:700;transition:all .25s;cursor:pointer}
.panel-button:hover{transform:translateY(-3px);background:rgba(255,255,255,.14)}
.panel-button.admin{background:linear-gradient(135deg,rgba(79,124,255,.9),rgba(39,194,176,.9));border-color:transparent}
.logout-button{border:1px solid var(--border);background:var(--surface)}
.login-card{max-width:520px;margin:0 auto}
body.login-screen{min-height:100vh}
body.login-screen .main-container{display:flex;flex-direction:column;justify-content:center;min-height:100vh}
body.login-screen .content-wrapper.login-page{display:flex;justify-content:center;align-items:center;min-height:calc(100vh - 180px)}
.content-wrapper{flex:1;max-width:900px;width:100%;margin:0 auto;padding:40px 24px 60px;display:grid;gap:32px}
.form-card,.info-card,.order-info-card,.feature-card{background:rgba(13,25,44,.9);border:1px solid var(--border);backdrop-filter:blur(18px);box-shadow:var(--shadow)}
.form-card{border-radius:32px;padding:42px;width:100%;max-width:760px;margin:0 auto;transition:all .35s}
.form-card:hover{transform:translateY(-6px);border-color:rgba(79,124,255,.35)}
.card-header{margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.06)}
.card-header h2{color:#fff;font-size:2rem;margin-bottom:12px;display:flex;align-items:center;gap:14px}
.card-header h2 i{color:var(--accent);font-size:1.2rem}
.card-subtitle{color:rgba(255,255,255,.72);font-size:.98rem}
.modern-form{display:flex;flex-direction:column;gap:22px}
.form-group label{color:rgba(255,255,255,.85);font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:10px;font-size:.94rem}
.form-group label i{color:var(--accent);width:18px}
.form-group input,.form-group select{width:100%;padding:16px 20px;border:1px solid var(--border);border-radius:18px;font-size:.98rem;color:var(--text);background:rgba(255,255,255,.04);transition:all .3s}
.form-group input::placeholder{color:rgba(255,255,255,.5)}
.form-group input:focus,.form-group select:focus{outline:none;border-color:rgba(79,124,255,.55);box-shadow:0 0 0 6px rgba(79,124,255,.1);background:rgba(255,255,255,.08)}
.input-with-unit{position:relative}
.input-with-unit input{padding-right:72px}
.unit{position:absolute;top:50%;transform:translateY(-50%);right:20px;color:rgba(255,255,255,.65);font-size:.95rem;pointer-events:none}
.input-hint{font-size:.85rem;color:rgba(255,255,255,.55);margin-top:8px}
.submit-btn{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;padding:18px 24px;border:none;border-radius:20px;font-size:1rem;font-weight:700;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;justify-content:center;gap:12px}
.submit-btn:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(79,124,255,.25)}
.alert-message{margin-top:20px;padding:18px 20px;border-radius:18px;display:none;font-size:.98rem;font-weight:600;line-height:1.5}
.alert-message.success{display:block;background:rgba(39,194,176,.12);color:#b8f3e8;border:1px solid rgba(39,194,176,.3)}
.alert-message.error{display:block;background:rgba(255,107,107,.12);color:#ffc7c7;border:1px solid rgba(255,107,107,.3)}
.login-note{margin-top:24px;color:rgba(255,255,255,.76);text-align:center;display:grid;gap:14px}
.login-note a{justify-self:center;font-weight:700}
"""

css_part5 = r"""
.dashboard-content{max-width:1180px;margin:0 auto;width:100%;padding:40px 24px 64px}
.back-button-container{margin-bottom:24px}
.back-button{display:inline-flex;align-items:center;gap:10px;padding:14px 24px;background:var(--surface);color:var(--text);border-radius:999px;border:1px solid var(--border);transition:all .25s}
.back-button:hover{transform:translateX(-3px);background:rgba(255,255,255,.12)}
.dashboard-topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:24px;padding:26px 30px;border-radius:28px;background:var(--surface);border:1px solid var(--border);backdrop-filter:blur(16px)}
.dashboard-label{color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:1px;font-size:.78rem;margin-bottom:10px}
.dashboard-heading{font-size:clamp(1.8rem,2.2vw,2.6rem);margin:0;color:#fff}
.dashboard-meta{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.sync-status{color:rgba(255,255,255,.72);font-size:.95rem;padding:10px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--border)}
.meta-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(79,124,255,.14);color:#c9e0ff;border-radius:999px;padding:10px 16px;font-size:.88rem;border:1px solid rgba(79,124,255,.2)}
.meta-pill.soft{background:rgba(39,194,176,.12);border-color:rgba(39,194,176,.24)}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:24px}
.kpi-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:22px 24px;display:flex;flex-direction:column;gap:10px}
.kpi-label{color:rgba(255,255,255,.65);font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
.kpi-card strong{color:#fff;font-size:1.8rem;font-weight:700}
.order-info-card{border-radius:32px;padding:36px;margin-bottom:36px;border-left:4px solid rgba(79,124,255,.7)}
.info-header h2{color:#fff;font-size:clamp(1.8rem,2.4vw,2.4rem)}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:18px}
.info-item{padding:18px 20px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid var(--border)}
.info-item label{color:rgba(255,255,255,.65)}
.info-item p{color:#fff;font-size:1rem;margin-top:8px}
.features-grid-dashboard{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.feature-card{border-radius:28px;padding:28px;border-top-width:4px}
.feature-header h3{color:#fff;font-size:1.05rem}
.feature-description{color:rgba(255,255,255,.62)}
.feature-body .form-group label{color:rgba(255,255,255,.76)}
.feature-body input,.feature-body select{border-radius:16px!important;padding:14px 16px!important;background:rgba(255,255,255,.06)!important;border-color:var(--border)!important;color:var(--text)!important}
.feature-btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:54px;padding:0 24px;border:none;border-radius:20px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;font-size:1rem;font-weight:700;box-shadow:0 18px 42px rgba(15,43,91,.28);cursor:pointer;transition:all .25s}
.feature-btn:hover{transform:translateY(-2px);box-shadow:0 22px 55px rgba(15,43,91,.32)}
.feature-btn.success{background:linear-gradient(135deg,#2bc29f,#1e9b71)}
.feature-btn.purple{background:linear-gradient(135deg,#9b59b6,#6c4e9e)}
.feature-result{font-size:.95rem;margin-top:12px;padding:14px;border-radius:14px;border-left:3px solid transparent}
.feature-result.success{background:rgba(39,194,176,.12);color:#d5fff6;border-left-color:rgba(39,194,176,.8)}
.feature-result.error{background:rgba(255,107,107,.12);color:#ffddd7;border-left-color:rgba(255,107,107,.8)}
.sync-btn{min-height:46px}
.admin-topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:32px;padding:24px 28px;border-radius:26px;background:var(--surface);border:1px solid var(--border)}
.last-sync-note{color:rgba(255,255,255,.75);font-size:.95rem;margin-top:8px}
.admin-panel-content{max-width:1180px;margin:0 auto;width:100%;padding:42px 24px 68px}
.admin-panel-overview{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:32px}
.admin-overview-card{background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:28px 24px}
.admin-overview-card h3{color:#fff;margin-bottom:10px;font-size:1rem;text-transform:uppercase;letter-spacing:.08em}
.admin-overview-card strong{display:block;font-size:2rem;color:#fff;margin-top:8px}
.admin-table-wrapper{overflow-x:auto;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:28px;padding:20px}
.admin-table{width:100%;border-collapse:collapse;min-width:1000px}
.admin-table th,.admin-table td{padding:16px 14px;color:rgba(255,255,255,.92)}
.admin-table th{text-align:left;color:rgba(255,255,255,.65);font-size:.85rem;letter-spacing:.09em;text-transform:uppercase;border-bottom:1px solid var(--border)}
.admin-table tbody tr{border-bottom:1px solid rgba(255,255,255,.06)}
.admin-table tbody tr:last-child{border-bottom:none}
.status-badge{display:inline-flex;align-items:center;padding:8px 14px;border-radius:999px;font-size:.85rem;font-weight:700}
.status-badge.pending{background:rgba(255,193,7,.16);color:#ffe87f}
.status-badge.proses{background:rgba(79,124,255,.14);color:#a5c9ff}
.status-badge.dalam-perjalanan{background:rgba(39,194,176,.13);color:#a8fff0}
.status-badge.tiba{background:rgba(39,194,176,.18);color:#eefff4}
.status-badge.selesai{background:rgba(103,227,170,.16);color:#dcffd9}
.table-action-group{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.status-select{width:190px;padding:10px 12px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.05);color:#f3f7fb}
.admin-action-btn{padding:10px 16px;border-radius:16px;border:none;background:linear-gradient(135deg,#27c2b0,#1e9b71);color:#fff;font-weight:700;cursor:pointer;transition:all .25s}
.admin-action-btn:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(39,194,176,.35)}
.table-empty{padding:36px;text-align:center;color:rgba(255,255,255,.75)}
.footer{background:transparent;color:rgba(255,255,255,.75);text-align:center;padding:26px 20px 42px;font-size:.95rem}
.footer i{color:var(--accent);margin:0 4px}
.main-container{display:flex;flex-direction:column;min-height:100vh}
@media(max-width:768px){.panel-actions,.dashboard-meta,.kpi-grid,.admin-panel-overview{grid-template-columns:1fr}.dashboard-topbar,.admin-topbar{flex-direction:column;align-items:stretch}.header{padding:34px 18px 28px}.info-grid{grid-template-columns:1fr}}
"""

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css_part3)
    f.write(css_part4)
    f.write(css_part5)

print("All CSS parts appended successfully!")
