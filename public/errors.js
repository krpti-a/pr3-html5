// Collects page errors before the game loads (read by the headless test harnesses).
window.__errs = [];
addEventListener('error', e => __errs.push(e.message + ' @' + ((e.error && e.error.stack) || '').split('\n').slice(0, 4).join(' | ')));
addEventListener('unhandledrejection', e => __errs.push('rej: ' + ((e.reason && e.reason.stack) || e.reason)));
