/* nutri-SCULPT cross-device sync.

   Design rules, in order of importance:
   1. The app must work perfectly with this file doing nothing at all.
      Signed out or offline, behaviour is exactly as before.
   2. localStorage is always the source of truth for what you see.
      The cloud is a copy, never a gate.
   3. We never silently discard work. If both sides changed, we ask.
*/
(function () {
  "use strict";

  var CFG = window.NUTRI_SYNC_CONFIG || {};
  var api = window.nutriSculptSyncApi;
  var panel = document.querySelector("#syncPanel");
  if (!panel || !api) return;

  var SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
  var LOCAL = "nutriSculptSync.v1";       // sync bookkeeping, separate from app data
  var TABLE = "dashboard_state";
  var PUSH_DELAY = 4000;

  var client = null;
  var user = null;
  var busy = false;
  var pushTimer = null;
  var status = { text: "", kind: "neutral" };
  var local = loadLocal();

  function loadLocal() {
    var base = { deviceId: "", deviceName: "", lastSyncedAt: null, lastSyncedStamp: null, pendingPush: false };
    try {
      var saved = JSON.parse(localStorage.getItem(LOCAL) || "{}");
      Object.keys(base).forEach(function (k) { if (saved[k] !== undefined) base[k] = saved[k]; });
    } catch (e) { /* start fresh */ }
    if (!base.deviceId) {
      base.deviceId = "dev-" + Math.random().toString(36).slice(2, 10);
      base.deviceName = guessDeviceName();
      // Persist straight away so this device keeps a stable identity even if
      // it never signs in. Otherwise it renames itself on every page load.
      try { localStorage.setItem(LOCAL, JSON.stringify(base)); } catch (e) { /* private mode */ }
    }
    return base;
  }
  function saveLocal() { localStorage.setItem(LOCAL, JSON.stringify(local)); }

  function guessDeviceName() {
    var ua = navigator.userAgent || "";
    if (/iPhone|Android.*Mobile/i.test(ua)) return "Phone";
    if (/iPad|Tablet/i.test(ua)) return "Tablet";
    return "Laptop";
  }

  function configured() {
    return Boolean(CFG.enabled && CFG.supabaseUrl && CFG.supabaseAnonKey);
  }

  // Local work exists that the cloud has not seen yet.
  function localDirty() {
    var stamp = api.getStateUpdatedAt();
    if (!stamp) return false;
    return stamp !== local.lastSyncedStamp;
  }

  function setStatus(text, kind) {
    status = { text: text, kind: kind || "neutral" };
    render();
  }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SDK;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("offline")); };
      document.head.appendChild(s);
    });
  }

  function ensureClient() {
    if (client) return Promise.resolve(client);
    return loadSdk().then(function () {
      client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      return client;
    });
  }

  /* ---------- push ---------- */

  function schedulePush() {
    if (!user) return;
    local.pendingPush = true;
    saveLocal();
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { push(); }, PUSH_DELAY);
  }

  function push(silent) {
    if (!user || busy) return Promise.resolve(false);
    if (!navigator.onLine) {
      setStatus("Offline. Your changes are saved here and will sync when you are back online.", "warning");
      return Promise.resolve(false);
    }
    busy = true;
    var stamp = api.getStateUpdatedAt();
    if (!silent) setStatus("Saving to the cloud...", "neutral");
    return ensureClient().then(function (c) {
      return c.from(TABLE).upsert({
        user_id: user.id,
        state: api.getState(),
        updated_at: new Date().toISOString(),
        updated_by_device: local.deviceName || "Device"
      }, { onConflict: "user_id" });
    }).then(function (res) {
      if (res && res.error) throw res.error;
      local.lastSyncedAt = new Date().toISOString();
      local.lastSyncedStamp = stamp;
      local.pendingPush = false;
      saveLocal();
      setStatus("Synced just now.", "good");
      return true;
    }).catch(function (err) {
      setStatus("Could not sync: " + friendly(err) + " Your work is still saved on this device.", "warning");
      return false;
    }).then(function (r) { busy = false; return r; });
  }

  /* ---------- pull ---------- */

  function fetchCloud() {
    return ensureClient().then(function (c) {
      return c.from(TABLE).select("state, updated_at, updated_by_device").eq("user_id", user.id).maybeSingle();
    }).then(function (res) {
      if (res && res.error) throw res.error;
      return res ? res.data : null;
    });
  }

  function applyCloud(row) {
    // Safety net: keep a copy of what was here before the very first pull.
    if (!local.lastSyncedAt) {
      try { api.downloadBackup(); } catch (e) { /* not fatal */ }
    }
    var ok = api.applyState(row.state, { stateUpdatedAt: row.updated_at });
    if (!ok) { setStatus("The cloud copy could not be read. Nothing was changed.", "warning"); return false; }
    local.lastSyncedAt = new Date().toISOString();
    local.lastSyncedStamp = api.getStateUpdatedAt();
    local.pendingPush = false;
    saveLocal();
    setStatus("Updated from your other device.", "good");
    return true;
  }

  /* ---------- the decision ---------- */

  function reconcile(options) {
    if (!user) return Promise.resolve();
    if (!navigator.onLine) {
      setStatus("Offline. Your work is saved on this device.", "warning");
      return Promise.resolve();
    }
    setStatus("Checking for changes...", "neutral");
    return fetchCloud().then(function (row) {
      var dirty = localDirty();

      if (!row) return push();                       // nothing up there yet
      var cloudIsNew = row.updated_at !== local.lastSyncedStamp &&
                       (!local.lastSyncedAt || new Date(row.updated_at) > new Date(local.lastSyncedAt));

      if (!cloudIsNew && !dirty) { setStatus("Everything is up to date.", "good"); return; }
      if (!cloudIsNew && dirty) return push();       // only this device moved
      if (cloudIsNew && !dirty) return applyCloud(row); // only the other device moved

      // Both moved. Never guess.
      return askWhichWins(row, options);
    }).catch(function (err) {
      setStatus("Could not check the cloud: " + friendly(err) + " Your work is safe on this device.", "warning");
    });
  }

  function askWhichWins(row) {
    var here = api.describe();
    var there = api.describe(row.state);
    var msg = [
      "BOTH DEVICES CHANGED",
      "",
      "This device and the cloud copy have both been edited since they last matched.",
      "Only one can be kept. Nothing is merged.",
      "",
      "THIS DEVICE (" + (local.deviceName || "here") + "):",
      api.describeText(here),
      "",
      "CLOUD (last saved from " + (row.updated_by_device || "another device") + " on " +
        new Date(row.updated_at).toLocaleString() + "):",
      api.describeText(there),
      "",
      "Press OK to KEEP THIS DEVICE and send it to the cloud.",
      "Press Cancel to REPLACE this device with the cloud copy."
    ].join("\n");

    var keepHere = window.confirm(msg);
    if (keepHere) return push();

    var sure = window.confirm(
      "Replace everything on this device with the cloud copy?\n\n" +
      "This device's current work will be lost.\n" +
      "A backup file of this device will be downloaded first."
    );
    if (!sure) { setStatus("Nothing changed. Your devices are still different.", "warning"); return; }
    try { api.downloadBackup(); } catch (e) { /* not fatal */ }
    return applyCloud(row);
  }

  function friendly(err) {
    var m = (err && (err.message || err.error_description)) || "";
    if (/offline|Failed to fetch|NetworkError/i.test(m)) return "no internet connection.";
    if (/Invalid login/i.test(m)) return "that email or password was not recognised.";
    if (/already registered/i.test(m)) return "that email already has an account. Try signing in.";
    if (/relation .*dashboard_state.* does not exist/i.test(m)) return "the sync table has not been created yet.";
    if (/Password should be/i.test(m)) return "the password is too short (use at least 6 characters).";
    return m || "something went wrong.";
  }

  /* ---------- auth ---------- */

  function signIn(email, password) {
    setStatus("Signing in...", "neutral");
    return ensureClient()
      .then(function (c) { return c.auth.signInWithPassword({ email: email, password: password }); })
      .then(function (res) {
        if (res.error) throw res.error;
        user = res.data.user;
        setStatus("Signed in.", "good");
        return reconcile();
      })
      .catch(function (err) { setStatus("Could not sign in: " + friendly(err), "warning"); });
  }

  function signUp(email, password) {
    setStatus("Creating your account...", "neutral");
    return ensureClient()
      .then(function (c) { return c.auth.signUp({ email: email, password: password }); })
      .then(function (res) {
        if (res.error) throw res.error;
        user = res.data.user;
        if (!res.data.session) {
          setStatus("Account created. Check your email to confirm it, then sign in.", "neutral");
          return;
        }
        setStatus("Account created and signed in.", "good");
        return push();
      })
      .catch(function (err) { setStatus("Could not create the account: " + friendly(err), "warning"); });
  }

  function signOut() {
    if (!window.confirm("Sign out of sync?\n\nYour meals and ticks stay on this device. They just stop syncing.")) return;
    ensureClient().then(function (c) { return c.auth.signOut(); }).then(function () {
      user = null;
      setStatus("Signed out. Saved on this device only.", "neutral");
    });
  }

  /* ---------- ui ---------- */

  function render() {
    if (!configured()) {
      panel.innerHTML = '<p class="device-note">Sync is not set up yet. Your work is saved on this device only.</p>';
      return;
    }
    var cls = status.kind === "good" ? "sync-good" : status.kind === "warning" ? "sync-warning" : "sync-neutral";
    if (user) {
      panel.innerHTML =
        '<p class="device-note">Signed in as <strong>' + esc(user.email || "") + '</strong> on this ' +
          esc((local.deviceName || "device").toLowerCase()) + '. Your meals, ticks and shopping list sync automatically.</p>' +
        '<div class="sync-status ' + cls + '">' + esc(status.text || "Ready.") + '</div>' +
        '<div class="settings-actions">' +
          '<button id="syncNow" class="primary-button" type="button">Sync now</button>' +
          '<button id="syncOut" class="ghost-button" type="button">Sign out</button>' +
        '</div>';
      panel.querySelector("#syncNow").addEventListener("click", function () { reconcile(); });
      panel.querySelector("#syncOut").addEventListener("click", signOut);
      return;
    }
    panel.innerHTML =
      '<p class="device-note">Sign in on your laptop and your phone with the same email, and they will keep each other up to date. Until you do, this device saves on its own.</p>' +
      '<div class="sync-status ' + cls + '">' + esc(status.text || "Not signed in.") + '</div>' +
      '<div class="sync-form">' +
        '<label>Email<input id="syncEmail" class="field" type="email" autocomplete="email" placeholder="you@example.com"></label>' +
        '<label>Password<input id="syncPassword" class="field" type="password" autocomplete="current-password" placeholder="At least 6 characters"></label>' +
      '</div>' +
      '<div class="settings-actions">' +
        '<button id="syncSignIn" class="primary-button" type="button">Sign in</button>' +
        '<button id="syncSignUp" class="ghost-button" type="button">Create account</button>' +
      '</div>';
    var em = panel.querySelector("#syncEmail"), pw = panel.querySelector("#syncPassword");
    panel.querySelector("#syncSignIn").addEventListener("click", function () { signIn(em.value.trim(), pw.value); });
    panel.querySelector("#syncSignUp").addEventListener("click", function () { signUp(em.value.trim(), pw.value); });
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  /* ---------- wiring ---------- */

  window.nutriSculptSyncHooks = {
    onLocalChange: function () { if (user) schedulePush(); }
  };

  window.addEventListener("online", function () {
    if (user && (local.pendingPush || localDirty())) reconcile();
  });
  window.addEventListener("offline", function () {
    if (user) setStatus("Offline. Your work is saved on this device.", "warning");
  });

  render();
  if (!configured()) return;

  // Restore an existing session quietly. Never block the app on this.
  ensureClient().then(function (c) { return c.auth.getSession(); }).then(function (res) {
    var session = res && res.data && res.data.session;
    if (!session) { render(); return; }
    user = session.user;
    render();
    return reconcile();
  }).catch(function () {
    setStatus("Sync is unavailable right now. Your work is saved on this device.", "warning");
  });
}());
