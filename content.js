(() => {
  'use strict';

  const CARD_SELECTOR = 'div.BFocEf';
  const INPUT_SELECTOR = 'input[type="number"][aria-label^="Score awarded for this question"]';
  const ANSWER_SELECTOR = '.vnb4ld .x8O7Bb';
  let entries = [];
  let opened = false;
  const preferences = { toasts: true, confetti: true, sound: true, graderName: 'Berlin' };
  let toastCount = 0;
  let audioContext;
  let navIndex = -1;
  let lastToastTimer;
  let pendingSave = null;
  let lastCelebrationKey = '';
  let messageIndex = 0;
  let autoFillInProgress = false;
  let forceReview = false;
  let visibleSignature = '';
  let completedMessage = '';
  let saveBarVisibleSnapshot = false;
  const completedMessages = ['Nice work. Nothing to do here! ✨', 'All caught up. Enjoy that little victory.', 'Look at that—every response scored! 💜', 'A clean slate! You crushed this batch.', 'No loose ends. Beautiful work!', 'You did the thing. Time for a tiny victory lap.'];
  const focusValue = new WeakMap();
  const seenGraded = new WeakSet();
  const debug = (event, details = {}) => console.info('[Sentence Grader]', event, details);
  const messages = {
    start: ['Nice job getting going! ✨', 'And we’re off! You’ve got this.', 'First steps, big energy.', 'Look at you showing up!'],
    middle: ['You’re cookin’ now!', 'Okay, grading legend!', 'Smooth moves, teach.', 'Keep that good groove going.', 'You’ve got the magic touch.', 'Absolute rockstar behavior.'],
    end: ['Almost done—home stretch!', 'The finish line is waving!', 'So close! You’ve got this.', 'Final lap, superstar.'],
    lull: ['One response at a time.', 'You’re making a difference.', 'Tiny wins add up.', 'Steady looks good on you.', 'Progress is progress.', 'Keep it golden.'],
    final: [
      'You’re the bee’s knees! All saved! 🐝',
      'Solid gold, baby! That’s a wrap! ✨',
      'Far out! You nailed it! ✌️',
      'Dyn-o-mite! Grading complete! 💥',
      'Totally tubular! You crushed it! 🏄',
      'Cowabunga! You did the thing! 🎉',
      'All that and a bag of chips! Saved!',
      'You’re all that! Grading: complete.',
      'You’re a rockstar! Mission complete! ⭐',
      'That was epic. You absolute legend!',
      'Slay! You ate that up. No crumbs!',
      'Main-character energy. You did it!',
      'The grading GOAT strikes again! 🐐',
      'Certified icon behavior. Well done!',
      'You understood the assignment! 🎓',
      'Great Scott! Every grade is saved!'
    ]
  };
  let finaleBag = [];
  function randomFinale() {
    if (!finaleBag.length) finaleBag = [...messages.final].sort(() => Math.random() - .5);
    return finaleBag.pop();
  }
  messages.savePrompt = [
    'You did it!! Smash that Save button! 💜',
    'All graded! Seal the deal—hit Save!',
    'Holy moly, all scored! Save that masterpiece.',
    'Boom! One click from glory. Hit Save!',
    'That’s a wrap… almost! Save those grades.',
    'You’re a grading machine! Save to lock it in.',
    'Radical work! Now make it official—Save!',
    'Look at that clean sweep! Save it, superstar.',
    'Mission almost accomplished. Punch that Save button!',
    'You’ve cooked a five-star meal. Time to Save!',
    'All done scoring! Give Save its moment in the sun.',
    'Gold star energy. Don’t forget the Save!'
  ];

  const host = document.createElement('div');
  host.id = 'sentence-grader-root';
  host.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483647';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing:border-box } .panel { width:min(470px,calc(100vw - 28px)); max-height:min(76vh,700px); background:#fff; color:#202124; border:1px solid #dadce0; border-radius:14px; box-shadow:0 7px 32px #0003; font:13px/1.45 Roboto,Arial,sans-serif; overflow:hidden }
    .head { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:#f1ecfa; border-bottom:1px solid #e1d9f3 }
    .head-actions {display:flex;align-items:center;gap:5px} .head button.icon-btn {background:transparent;color:#5c408d;padding:5px;border-radius:7px;display:grid;place-items:center} .head button.icon-btn.hidden {display:none} .head button.icon-btn:hover {background:#e3d9f3} .head button.icon-btn svg {width:19px;height:19px}
    .head strong { font-size:15px } button { cursor:pointer; background:#673ab7; border:0; border-radius:8px; color:#fff; padding:8px 11px; font:inherit; font-weight:500 } button:hover { background:#512da8 } button:disabled { background:#b7b7b7; cursor:not-allowed } button.secondary { background:#eee8f7; color:#4e318a } button.close { background:transparent; color:#403552; font-size:19px; padding:2px 7px }
    .body { padding:12px 14px; max-height:calc(76vh - 58px); overflow:auto } .actions { display:flex; gap:8px; flex-wrap:wrap; margin:10px 0 } .small { color:#5f6368; font-size:12px } .notice { padding:9px; border-radius:8px; background:#fff5de; margin:8px 0 } .ok { background:#e7f4e9 } .bad { color:#9b3d19 } .item { padding:10px 0; border-bottom:1px solid #e6e6e6 } .item:first-child { border-top:1px solid #e6e6e6 } .snippet { white-space:pre-wrap; overflow-wrap:anywhere; max-height:70px; overflow:hidden; margin:4px 0 } .tag { background:#f0edf7; border-radius:5px; padding:2px 5px } .warning { color:#9b4b16 } .trigger { box-shadow:0 2px 8px #0003 } .hidden { display:none }
    .settings-page { padding:16px; } .settings-page .checks { padding:10px 0; display:grid; gap:15px } .settings-page label { display:flex; gap:9px; align-items:center; cursor:pointer } .settings-page input { accent-color:#673ab7 } .settings-page .note { font-size:11px; color:#777; margin-top:12px }
    .trigger { width:52px;height:52px;border-radius:16px;display:grid;place-items:center;box-shadow:0 3px 12px #46337844; border:2px solid white; padding:0 } .trigger svg { width:26px;height:26px; } .trigger:hover { transform:translateY(-2px) }
    .toast { position:fixed; top:22px; left:50%; transform:translateX(-50%); z-index:2147483647; width:min(340px,calc(100vw - 30px)); background:#fffdf6; color:#372b40; box-shadow:0 8px 30px #0003; border:1px solid #eed39b; border-radius:14px; padding:10px 16px; text-align:center; font:14px/1.35 Roboto,Arial,sans-serif; pointer-events:none; animation:toast-in .22s ease-out }
    .toast .count { font-weight:bold; text-align:right; color:#87632d; font-size:12px } .toast .message { padding:4px 0 1px; font-weight:600 } .toast.final { border:2px solid #d9a53d; background:#fff8e6; font-size:17px } .item.selected { background:#fff8e5; border-left:3px solid #d4a64a; padding-left:9px; border-radius:5px } @keyframes toast-in { from { opacity:0; transform:translate(-50%,-8px) } to { opacity:1; transform:translate(-50%,0) } }
    .body {padding:0 14px 12px} .toolbar {position:sticky;top:0;background:#fff;z-index:2;padding:12px 0 9px;border-bottom:1px solid #eee8f5}
    .toolbar .actions {display:flex;flex-wrap:nowrap;gap:7px;margin:9px 0 0} .toolbar .actions button {flex:1;min-width:0;min-height:44px;padding:10px 7px;font-size:13px;line-height:1.2;white-space:nowrap}
    .toast {background:#f4effc;color:#40306f;border-color:#d8c8ef}.toast .count {color:#6741a3}.toast.final {border-color:#9473d2;background:#eee5fc}
    .complete {text-align:center;padding:28px 12px 16px;min-height:245px}.complete .symbol {font-size:40px}.complete h3 {font-size:20px;color:#54328c;margin:10px 0}.complete p {color:#625a6e;font-size:12px}.complete .celebrate {display:block;margin:16px auto 4px;font-size:16px;font-weight:700;padding:15px 23px;border-radius:12px;box-shadow:0 4px 12px #673ab733}.complete .pending-save {padding:9px;background:#f1ecfa;border-radius:9px;margin:10px auto;color:#4e318a;font-size:12px}.complete .pending-save button {margin:7px auto 0;padding:7px 15px;font-size:12px}.complete .back-link {display:block;margin:18px 0 0 auto;background:transparent;color:#8776a4;text-decoration:underline;text-underline-offset:3px;font-size:11px;padding:3px;text-align:right}.complete .back-link:hover {color:#563891;background:transparent}
    .trigger.hidden {display:none}
    .head-actions {gap:7px}.head button.icon-btn,.head button.close {width:42px;height:42px;display:grid;place-items:center;padding:0;border-radius:10px;line-height:1;font-weight:700}
    .head button.icon-btn {font-size:27px}.head button.close {font-size:30px}.head button.close:hover {background:#e3d9f3}.head button.icon-btn.hidden {display:none}
    .name-setting {display:grid;gap:6px;margin:17px 0 14px;color:#4e318a;font-weight:600}.name-setting input {width:100%;padding:10px;border:1px solid #cfc3e4;border-radius:8px;font:inherit;color:#332b40;background:#fff}.name-setting input:focus {outline:2px solid #8d68d0;outline-offset:1px}
    `;
  shadow.append(style);

  const trigger = document.createElement('button');
  trigger.className = 'trigger';
  trigger.setAttribute('aria-label', 'Open Sentence Grader');
  trigger.title = 'Sentence Grader';
  trigger.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5h16"/><path d="m5 15 8.8-8.8 3.2 3.2L8.2 18.2 4.5 19z"/><path d="m15 5 1.6-1.6a1.5 1.5 0 0 1 2.1 0l1.9 1.9a1.5 1.5 0 0 1 0 2.1L19 9"/><path d="m12.5 15.5 2.4 2.4 4.6-5"/></svg>';
  shadow.append(trigger);
  const panel = document.createElement('section');
  panel.className = 'panel hidden';
  panel.innerHTML = '<div class="head"><strong data-panel-title>Sentence Grader</strong><div class="head-actions"><button class="icon-btn" data-action="settings" aria-label="Settings" title="Settings">⚙</button><button class="close" aria-label="Close panel">×</button></div></div><div class="body" data-main><div class="toolbar" data-toolbar><div class="small">Responses → Question · review before saving.</div><div class="actions"><button data-action="fill" disabled title="Fill confident blank scores">Fill blanks</button><button data-action="next" class="secondary" title="Next ungraded answer">Next ungraded ↓</button><button data-action="save" class="secondary" title="Save all filled scores">Save grades</button></div></div><div data-summary class="small"></div><div data-results></div><p class="small">Scores are not saved until Google Forms confirms Save grades.</p></div><div class="settings-page hidden" data-settings-page><p>Make grading your kind of fun.</p><div class="checks"><label><input type="checkbox" data-setting="toasts" checked> Encouragement toasts</label><label><input type="checkbox" data-setting="confetti" checked> Finish-line confetti 🎊</label><label><input type="checkbox" data-setting="sound" checked> Celebration trumpet 🎺</label></div><button class="secondary" data-action="test-sound">▶ Test trumpet</button><div class="note">Preferences stay saved in Chrome · v0.8</div><div class="actions"><button data-action="back">← Back to grading</button></div></div>';
  shadow.append(panel);
  const summary = panel.querySelector('[data-summary]');
  const results = panel.querySelector('[data-results]');
  const fillButton = panel.querySelector('[data-action="fill"]');
  panel.querySelector('[data-toolbar]').insertAdjacentHTML('afterend', '<section class="complete hidden" data-complete><div class="symbol">💜</div><h3 data-complete-message>Nice work. Nothing to do here!</h3><p>Every visible answer has a score.</p><div class="pending-save hidden" data-pending-save>Everything is scored—save these changes to lock them in.<button data-action="complete-save">Save grades</button></div><button class="celebrate" data-action="celebrate">🎉 Launch confetti!</button><button class="back-link" data-action="review-anyway">Back to grading</button></section>');
  const completeSection = panel.querySelector('[data-complete]');
  panel.querySelector('.settings-page .checks').insertAdjacentHTML('afterend', '<label class="name-setting" for="sentence-grader-name">Grader name<input id="sentence-grader-name" data-grader-name type="text" maxlength="30" value="Berlin" autocomplete="off" placeholder="Berlin"></label>');

  trigger.addEventListener('click', () => { opened = true; trigger.classList.add('hidden'); panel.classList.remove('hidden'); scan(); });
  panel.querySelector('.close').addEventListener('click', () => { opened = false; panel.classList.add('hidden'); trigger.classList.remove('hidden'); });
  function toggleSettings(show) {
    panel.querySelector('[data-main]').classList.toggle('hidden', show);
    panel.querySelector('[data-settings-page]').classList.toggle('hidden', !show);
    panel.querySelector('[data-panel-title]').textContent = show ? 'Settings' : 'Sentence Grader';
    panel.querySelector('[data-action="settings"]').classList.toggle('hidden', show);
    if (!show) scan();
  }
  panel.querySelector('[data-action="settings"]').addEventListener('click', () => toggleSettings(true));
  panel.querySelector('[data-action="back"]').addEventListener('click', () => toggleSettings(false));
  panel.querySelector('[data-action="test-sound"]').addEventListener('click', () => trumpetFanfare(true));
  fillButton.addEventListener('click', fill);
  panel.querySelector('[data-action="next"]').addEventListener('click', nextUngraded);
  panel.querySelector('[data-action="save"]').addEventListener('click', saveFilled);
  panel.querySelector('[data-action="celebrate"]').addEventListener('click', () => {
    SentenceConfetti(); // An explicit celebration request overrides automatic confetti preference.
    unlockAudio();
    trumpetFanfare();
    showToast(randomFinale(), true);
  });
  panel.querySelector('[data-action="review-anyway"]').addEventListener('click', () => { forceReview = true; render(); });
  panel.querySelector('[data-action="complete-save"]').addEventListener('click', saveFilled);
  for (const input of panel.querySelectorAll('[data-setting]')) {
    input.addEventListener('change', () => {
      preferences[input.dataset.setting] = input.checked;
      chrome.storage.local.set({ sentenceGraderPreferences: preferences });
    });
  }
  panel.querySelector('[data-grader-name]').addEventListener('change', event => {
    preferences.graderName = event.target.value.trim().slice(0, 30) || 'Berlin';
    event.target.value = preferences.graderName;
    chrome.storage.local.set({ sentenceGraderPreferences: preferences });
    debug('grader name updated', { length: preferences.graderName.length });
  });
  chrome.storage.local.get('sentenceGraderPreferences', data => {
    const saved = data.sentenceGraderPreferences || {};
    for (const key of ['toasts', 'confetti', 'sound']) {
      if (typeof saved[key] === 'boolean') preferences[key] = saved[key];
      panel.querySelector(`[data-setting="${key}"]`).checked = preferences[key];
    }
    if (typeof saved.graderName === 'string') preferences.graderName = saved.graderName.trim().slice(0, 30) || 'Berlin';
    panel.querySelector('[data-grader-name]').value = preferences.graderName;
  });

  function scan() {
    entries = [];
    for (const card of document.querySelectorAll(CARD_SELECTOR)) {
      const input = card.querySelector(INPUT_SELECTOR);
      const answerNodes = card.querySelectorAll(ANSWER_SELECTOR);
      if (!input || answerNodes.length !== 1) continue;
      const answer = answerNodes[0].innerText || answerNodes[0].textContent || '';
      const analysis = SentenceGrader.analyze(answer);
      const blank = input.value.trim() === '';
      entries.push({ card, input, answer, analysis, blank });
    }
    visibleSignature = entries.map(e => `${e.input.value}|${e.answer}`).join('\uE001');
    render();
  }

  function progress() {
    const total = entries.length;
    const completed = entries.filter(e => e.input.value.trim() !== '').length;
    return { total, completed };
  }

  function pickMessage(p, allowFinal = false) {
    if (allowFinal && p.total && p.completed === p.total) return randomFinale();
    const ratio = p.total ? p.completed / p.total : 0;
    const group = ratio >= .85 ? 'end' : ratio <= .2 ? 'start' : (p.completed % 4 === 0 ? 'lull' : 'middle');
    const options = messages[group];
    return options[(messageIndex++ + p.completed) % options.length];
  }

  function showToast(message, isFinal = false) {
    debug('toast', { shown: preferences.toasts, final: isFinal, progress: progress() });
    if (!preferences.toasts) return;
    shadow.querySelector('.toast')?.remove();
    clearTimeout(lastToastTimer);
    const toast = document.createElement('div');
    toast.className = `toast${isFinal ? ' final' : ''}`;
    toast.setAttribute('role', 'status');
    const count = document.createElement('div'); count.className = 'count';
    const p = progress(); count.textContent = `${p.completed}/${p.total} scored`;
    const line = document.createElement('div'); line.className = 'message';
    const name = preferences.graderName.trim();
    toastCount++;
    if (name && toastCount % 4 === 1 && !/verify|could not|not saved/i.test(message)) {
      const withComma = toastCount % 8 === 1;
      line.textContent = withComma
        ? `${name}, ${message.charAt(0).toLowerCase()}${message.slice(1)}`
        : `${name}! ${message}`;
    } else line.textContent = message;
    toast.append(count, line); shadow.append(toast);
    lastToastTimer = setTimeout(() => toast.remove(), isFinal ? 6500 : 3200);
  }

  function nextUngraded({ notify = true } = {}) {
    scan();
    if (!entries.length) return;
    for (let step = 1; step <= entries.length; step++) {
      const index = (navIndex + step) % entries.length;
      const e = entries[index];
      if (e.input.value.trim() !== '') continue;
      navIndex = index;
      e.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      e.card.animate([
        { outline: '3px solid #e6bd58', outlineOffset: '3px', boxShadow: '0 0 0 8px #e6bd5820' },
        { outline: '3px solid #f6e6b2', outlineOffset: '3px', boxShadow: '0 0 0 14px #e6bd5800' },
        { outline: '3px solid #e6bd58', outlineOffset: '3px', boxShadow: '0 0 0 8px #e6bd5820' },
        { outline: '0 solid transparent', outlineOffset: '0', boxShadow: 'none' }
      ], { duration: 1850, easing: 'ease-in-out' });
      const preview = results.querySelector(`[data-row-index="${index}"]`);
      if (preview) {
        for (const old of results.querySelectorAll('.selected')) old.classList.remove('selected');
        preview.classList.add('selected');
        const scroller = panel.querySelector('[data-main]');
        scroller.scrollTo({ top: scroller.scrollTop + preview.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientHeight / 3, behavior: 'smooth' });
        debug('next ungraded preview selected', { answerIndex: index + 1, warningCount: e.analysis.warnings.length });
      }
      if (notify) showToast(`${pickMessage(progress())} ${progress().completed}/${progress().total} scored.`);
      return true;
    }
    if (notify) showToast(progress().completed === progress().total
      ? messages.savePrompt[messageIndex++ % messages.savePrompt.length]
      : 'No blank scores visible. Check the other questions!');
    return false;
  }

  function unlockAudio(force = false) {
    if (!preferences.sound && !force) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    } catch (error) { debug('audio unavailable', { reason: String(error) }); }
  }

  async function trumpetFanfare(preview = false) {
    if (!preview && !preferences.sound) return;
    unlockAudio(true);
    if (!audioContext) return;
    try { await audioContext.resume(); } catch (error) { debug('audio resume failed', { reason: String(error) }); }
    debug('trumpet audio state', { state: audioContext.state, preview });
    if (audioContext.state !== 'running') return;
    // An original three-note brass-like flourish, synthesized in-browser.
    const now = audioContext.currentTime + .03;
    const notes = [{ hz: 392, t: 0, d: .2 }, { hz: 523.25, t: .23, d: .2 }, { hz: 659.25, t: .46, d: .62 }];
    for (const { hz, t, d } of notes) {
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(.0001, now + t);
      gain.gain.exponentialRampToValueAtTime(.22, now + t + .045);
      gain.gain.exponentialRampToValueAtTime(.0001, now + t + d);
      gain.connect(audioContext.destination);
      for (const [harmonic, volume] of [[1, 1], [2, .34], [3, .14]]) {
        const osc = audioContext.createOscillator();
        const partial = audioContext.createGain();
        osc.type = 'triangle'; osc.frequency.value = hz * harmonic;
        partial.gain.value = volume / 3;
        osc.connect(partial).connect(gain);
        osc.start(now + t); osc.stop(now + t + d + .02);
      }
    }
    debug('trumpet fanfare played');
  }

  function isSaveButton(el) {
    return !!el && !host.contains(el) && /^(?:save|save grades|save scores|save changes)$/i.test((el.getAttribute('aria-label') || el.textContent || '').trim());
  }

  function findNativeSave() {
    return [...document.querySelectorAll('button,[role="button"]')]
      .filter(el => !host.contains(el) && el.getClientRects().length && !el.disabled && el.getAttribute('aria-disabled') !== 'true')
      .find(isSaveButton);
  }

  function saveFilled() {
    unlockAudio();
    scan();
    if (!entries.some(e => e.input.value.trim() !== '')) {
      render('Nothing is scored yet. Fill or enter scores first.'); return;
    }
    const button = findNativeSave();
    debug('save-all requested', { foundNativeSave: !!button, progress: progress() });
    if (!button) {
      render('The Google Forms “Save grades” button is not visible yet. Edit a score and leave the field to reveal the bottom Save bar, then try again.'); return;
    }
    button.click();
    // Google Forms sometimes provides no detectable completion signal for an
    // extension-initiated click. Celebrate the *action* with an honest status,
    // while continuing to watch for a real Save acknowledgment separately.
    setTimeout(() => {
      scan();
      const p = progress();
      if (p.total && p.completed === p.total && !hasCelebratedCurrentGrades()) {
        showToast('Save clicked! You crushed the grading—verify that Google saved it. 💜', true);
        celebrateCurrentGrades();
      }
    }, 1700);
  }

  function gradeKey() {
    return `${location.href}|${entries.map(e => e.input.value).join(',')}`;
  }

  function hasCelebratedCurrentGrades() {
    return lastCelebrationKey === gradeKey();
  }

  function celebrateCurrentGrades() {
    if (hasCelebratedCurrentGrades()) return;
    lastCelebrationKey = gradeKey();
    debug('celebration triggered', { progress: progress() });
    if (preferences.confetti) SentenceConfetti();
    trumpetFanfare();
  }

  // Detect the actual Google Forms Save grades control even when a teacher
  // clicks it manually, without using our own panel.
  document.addEventListener('click', event => {
    const button = event.composedPath().find(node => node instanceof Element && node.matches?.('button,[role="button"]')) || event.target.closest?.('button,[role="button"]');
    if (!isSaveButton(button)) return;
    unlockAudio();
    debug('native Save grades clicked', { ariaLabel: button.getAttribute('aria-label'), trusted: event.isTrusted });
    scan();
    const token = { button, started: Date.now(), goneChecks: 0 };
    pendingSave = token;
    setTimeout(() => checkSave(token), 450);
  }, true);

  function checkSave(attempt) {
    if (pendingSave !== attempt) return;
    const success = [...document.querySelectorAll('[role="status"],[role="alert"],button,[role="button"]')]
      .some(el => !host.contains(el) && el.getClientRects().length && /^(?:saved|all changes saved|grades saved|scores saved|response saved)[.!]?$/i.test((el.textContent || '').trim()));
    // Google Forms ordinarily removes its bottom unsaved-grades bar after Save.
    // Require the Save grades control to stay absent on successive checks.
    const gone = !attempt.button.isConnected || attempt.button.getClientRects().length === 0 || !findNativeSave();
    attempt.goneChecks = gone ? attempt.goneChecks + 1 : 0;
    debug('save check', { acknowledgedText: success, saveBarGone: gone, consecutiveGone: attempt.goneChecks });
    if (!success && attempt.goneChecks < 2 && Date.now() - attempt.started < 5000) {
      setTimeout(() => checkSave(attempt), 350);
      return;
    }
    pendingSave = null;
    scan();
    if (!success && attempt.goneChecks < 2) {
      if (!hasCelebratedCurrentGrades()) showToast('Save clicked. Please verify your scores were saved.');
      return;
    }
    const p = progress();
    if (p.total > 0 && p.completed === p.total) {
      showToast(pickMessage(p, true), true);
      celebrateCurrentGrades();
    } else showToast(pickMessage(p));
  }

  // Score entry is a separate milestone from saving. Capture focus before the
  // teacher types and celebrate only a newly filled blank field on focusout.
  document.addEventListener('focusin', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches(INPUT_SELECTOR)) return;
    focusValue.set(input, input.value.trim());
    debug('score focus', { blank: input.value.trim() === '' });
  }, true);
  document.addEventListener('focusout', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches(INPUT_SELECTOR)) return;
    const before = focusValue.get(input);
    const suppress = autoFillInProgress;
    setTimeout(() => {
      const after = input.value.trim();
      const newlyFilled = before === '' && after !== '' && !seenGraded.has(input);
      debug('score blur', { beforeBlank: before === '', afterBlank: after === '', newlyFilled, suppressedAutoFill: suppress });
      if (!newlyFilled) return;
      seenGraded.add(input);
      scan();
      if (!suppress) {
        const p = progress();
        showToast(p.total > 0 && p.completed === p.total
          ? messages.savePrompt[messageIndex++ % messages.savePrompt.length]
          : pickMessage(p));
      }
    }, 100);
  }, true);

  // The row's mark-correct action changes grading state but is not a Save.
  document.addEventListener('click', event => {
    const el = event.composedPath().find(node => node instanceof Element && node.getAttribute?.('aria-label') === 'Mark responses as correct');
    if (!el) return;
    debug('mark correct clicked (not a save)', { trusted: event.isTrusted });
    setTimeout(() => {
      scan();
      debug('after mark correct', { progress: progress(), saveBarVisible: !!findNativeSave() });
    }, 250);
  }, true);

  function render(message) {
    const p = progress();
    const allScored = p.total > 0 && p.completed === p.total;
    if (!allScored) { forceReview = false; completedMessage = ''; }
    const pendingSave = !!findNativeSave();
    saveBarVisibleSnapshot = pendingSave;
    const complete = allScored && !forceReview;
    completeSection.classList.toggle('hidden', !complete);
    panel.querySelector('[data-toolbar]').classList.toggle('hidden', complete);
    summary.classList.toggle('hidden', complete);
    results.classList.toggle('hidden', complete);
    panel.querySelector('[data-main] > p.small').classList.toggle('hidden', complete);
    if (complete) {
      if (!completedMessage) completedMessage = completedMessages[Math.floor(Math.random() * completedMessages.length)];
      panel.querySelector('[data-complete-message]').textContent = pendingSave ? 'Every answer scored! One last step…' : completedMessage;
      panel.querySelector('[data-pending-save]').classList.toggle('hidden', !pendingSave);
      return;
    }
    const eligible = entries.filter(e => e.blank && e.analysis.confident);
    fillButton.disabled = eligible.length === 0;
    summary.textContent = entries.length
      ? `${entries.length} answer card(s) found · ${eligible.length} ready to fill · ${entries.filter(e => !e.analysis.confident).length} need review`
      : 'No answer cards found. Navigate to Responses → Question and reopen Sentence Grader.';
    results.replaceChildren();
    if (message) {
      const notice = document.createElement('div'); notice.className = 'notice ok'; notice.textContent = message; results.append(notice);
    }
    for (const [index, e] of entries.entries()) {
      const item = document.createElement('div'); item.className = 'item';
      item.dataset.rowIndex = String(index);
      const heading = document.createElement('div');
      heading.textContent = `Answer ${index + 1} · ${e.analysis.count} detected · proposed ${e.analysis.score}/6 · ${e.blank ? 'blank score' : `existing ${e.input.value}/6`}`;
      const snippet = document.createElement('div'); snippet.className = 'snippet'; snippet.textContent = e.answer.slice(0, 250);
      const status = document.createElement('div'); status.className = e.analysis.confident ? 'small' : 'warning';
      status.textContent = e.analysis.confident ? 'Ready for review and fill' : `Manual review: ${e.analysis.warnings.join('; ')}`;
      item.append(heading, snippet, status); results.append(item);
    }
  }

  function fill() {
    // Re-scan before writing, ensuring the DOM/values still match the preview.
    const prior = entries.map(e => ({ input: e.input, answer: e.answer }));
    scan();
    if (prior.length !== entries.length || entries.some((e, i) => e.input !== prior[i].input || e.answer !== prior[i].answer)) {
      render('Responses changed since preview. Review the refreshed list and click Fill again.');
      return;
    }
    let filled = 0;
    autoFillInProgress = true;
    for (const e of entries) {
      if (!e.blank || !e.analysis.confident || !e.input.isConnected || e.input.disabled) continue;
      // Google Forms commonly commits a score when the field loses focus.
      // Simulate the complete edit lifecycle, then verify its Save bar appears.
      e.input.focus();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(e.input, String(e.analysis.score));
      e.input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: String(e.analysis.score) }));
      e.input.dispatchEvent(new Event('change', { bubbles: true }));
      e.input.blur();
      filled++;
    }
    autoFillInProgress = false;
    scan();
    debug('automatic fill finished', { filled, saveBarVisible: !!findNativeSave(), progress: progress() });
    // The toolbar is often mounted asynchronously after blur.
    setTimeout(() => {
      const navigated = filled > 0 ? nextUngraded({ notify: false }) : false;
      if (filled > 0) {
        const p = progress();
        showToast(p.total > 0 && p.completed === p.total
          ? messages.savePrompt[messageIndex++ % messages.savePrompt.length]
          : `${pickMessage(p)} ${p.completed}/${p.total} scored. ${navigated ? 'Next answer highlighted!' : ''}`);
      }
      render(filled
        ? `Filled ${filled} score(s). ${navigated ? 'Jumped to the next ungraded answer. ' : ''}${findNativeSave() ? 'Review your scores, then click Save grades.' : 'Google Forms did not show its Save grades bar. These values may not be registered—edit a field manually and save.'}`
        : 'No eligible blank scores found.');
    }, 500);
  }

  const attach = () => { if (!host.isConnected && document.body) document.body.append(host); };
  attach();
  new MutationObserver(attach).observe(document.documentElement, { childList: true, subtree: false });
  // Google Forms can replace score rows after Save; update without requiring a manual rescan.
  setInterval(() => {
    if (!opened || !panel.querySelector('[data-settings-page]').classList.contains('hidden')) return;
    const current = [...document.querySelectorAll(CARD_SELECTOR)].map(card => {
      const input = card.querySelector(INPUT_SELECTOR);
      const answer = card.querySelector(ANSWER_SELECTOR);
      return input && answer ? `${input.value}|${answer.innerText || answer.textContent || ''}` : '';
    }).filter(Boolean).join('\uE001');
    if (current !== visibleSignature) scan();
    // Save bar can come and go without changing the actual input values.
    else {
      const shouldComplete = entries.length > 0 && entries.every(e => e.input.value.trim() !== '') && !forceReview;
      if (shouldComplete !== !completeSection.classList.contains('hidden') || !!findNativeSave() !== saveBarVisibleSnapshot) render();
    }
  }, 1000);
})();
