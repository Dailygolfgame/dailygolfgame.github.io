/* Dailygolf coins: one wallet for every game, kept in this browser.
   DGCoins.award(key, n) pays once per key (for example 'trivia:322'), so replays never pay twice. */
(function () {
  var K = 'dg_coins_v1';
  function get() { try { return JSON.parse(localStorage.getItem(K)) || { c: 0, log: {} }; } catch (e) { return { c: 0, log: {} }; } }
  function put(w) { try { localStorage.setItem(K, JSON.stringify(w)); } catch (e) {} }
  window.DGCoins = {
    balance: function () { return get().c; },
    add: function (n) { var w = get(); w.c += n; put(w); return w.c; },
    spend: function (n) { var w = get(); if (w.c < n) return false; w.c -= n; put(w); return true; },
    has: function (key) { return get().log[key] != null; },
    award: function (key, n) {
      var w = get(); if (w.log[key] != null || !(n > 0)) return 0;
      w.log[key] = n; w.c += n;
      var ks = Object.keys(w.log); if (ks.length > 500) ks.slice(0, ks.length - 500).forEach(function (k) { delete w.log[k]; });
      put(w); return n;
    }
  };
})();
