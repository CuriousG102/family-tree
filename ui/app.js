/* Hutson Family Tree UI — renders window.TREE (built from the GEDCOM). */
(function () {
  "use strict";
  var T = window.TREE || { individuals: {}, families: {}, sources: {}, meta: {} };
  var IND = T.individuals, FAM = T.families, SRC = T.sources;
  var HOME = IND.I1 ? "I1" : Object.keys(IND)[0];

  /* ---------- small helpers ---------- */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function byId(id) { return document.getElementById(id); }
  function yr(date) {
    if (!date) return "";
    var m = String(date).match(/\d{4}/);
    if (!m) return "";
    return (/^(ABT|BEF|AFT|EST|CAL|BET)/.test(date) ? "c. " : "") + m[0];
  }
  function eventOf(ind, type) {
    for (var i = 0; i < ind.events.length; i++) if (ind.events[i].type === type) return ind.events[i];
    return null;
  }
  function birthYear(ind) {
    var b = eventOf(ind, "BIRT");
    var m = b && b.date && String(b.date).match(/\d{4}/);
    return m ? +m[0] : null;
  }
  function lifeSpan(ind) {
    var b = eventOf(ind, "BIRT"), d = eventOf(ind, "DEAT");
    var by = b ? yr(b.date) : "", dy = d ? yr(d.date) : "";
    if (!by && !dy) return "";
    return (by || "?") + " – " + (dy || (d ? "?" : ""));
  }
  function primaryName(ind) { return ind && ind.name ? ind.name : "(unknown)"; }
  function shortPlace(p) {
    if (!p) return "";
    var parts = p.split(",").map(function (s) { return s.trim(); });
    return parts.length > 2 ? parts[0] + ", " + parts[parts.length - 2] : parts.join(", ");
  }
  // Notes flag unproven placements in capitals ("TENTATIVE", "INFERRED").
  function isTentative(ind) {
    return ind.notes.some(function (n) { return /TENTATIVE|INFERRED/.test(n); });
  }
  function isLiving(ind) { return ind.notes.some(function (n) { return /^LIVING/.test(n); }); }

  function parentsOf(ind) {
    var res = { father: null, mother: null, fam: null };
    if (!ind || !ind.famc || !ind.famc.length) return res;
    var fam = FAM[ind.famc[0]];
    if (!fam) return res;
    res.fam = fam;
    res.father = fam.husband ? IND[fam.husband] : null;
    res.mother = fam.wife ? IND[fam.wife] : null;
    return res;
  }

  /* ---------- relationships to the home person ---------- */
  var ANC = {};      // id -> {gen, paths}
  (function computeAncestors() {
    var frontier = [[HOME, 0]];
    while (frontier.length) {
      var next = [];
      frontier.forEach(function (pair) {
        var id = pair[0], g = pair[1];
        if (!ANC[id]) ANC[id] = { gen: g, paths: 0 };
        ANC[id].paths += 1;
        ANC[id].gen = Math.min(ANC[id].gen, g);
        var p = parentsOf(IND[id]);
        if (p.father) next.push([p.father.id, g + 1]);
        if (p.mother) next.push([p.mother.id, g + 1]);
      });
      frontier = next;
    }
  })();

  function greats(n) { return n <= 0 ? "" : n === 1 ? "great-" : n + "× great-"; }
  function ancestorLabel(gen, sex) {
    var base = sex === "F" ? "mother" : sex === "M" ? "father" : "parent";
    if (gen === 0) return "You (tree subject)";
    if (gen === 1) return base.charAt(0).toUpperCase() + base.slice(1);
    return (greats(gen - 2) + "grand" + base).replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function uncleLabel(gen, sex) {
    // sibling of an ancestor of generation `gen`
    var base = sex === "F" ? "aunt" : sex === "M" ? "uncle" : "aunt/uncle";
    if (gen === 0) return sex === "F" ? "Sister" : sex === "M" ? "Brother" : "Sibling";
    var s = greats(gen - 1) + base;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  var REL = {};
  (function computeRelations() {
    Object.keys(ANC).forEach(function (id) { REL[id] = ancestorLabel(ANC[id].gen, IND[id].sex); });
    // siblings of ancestors (and of the home person)
    Object.keys(ANC).forEach(function (aid) {
      var p = parentsOf(IND[aid]);
      if (!p.fam) return;
      p.fam.children.forEach(function (cid) {
        if (!REL[cid] && IND[cid]) REL[cid] = uncleLabel(ANC[aid].gen, IND[cid].sex);
      });
    });
    // children of ancestors not yet labelled (half-siblings etc.) and spouses of relatives
    Object.keys(IND).forEach(function (id) {
      if (REL[id]) return;
      var ind = IND[id];
      (ind.fams || []).forEach(function (fid) {
        var f = FAM[fid]; if (!f || REL[id]) return;
        var other = f.husband === id ? f.wife : f.husband;
        if (other && REL[other] && !ANC[other]) REL[id] = "Spouse of " + REL[other].toLowerCase();
      });
    });
    Object.keys(IND).forEach(function (id) {
      if (REL[id]) return;
      var p = parentsOf(IND[id]);
      var par = [p.father, p.mother].filter(function (x) { return x && REL[x.id]; })[0];
      if (par) REL[id] = "Child of " + primaryName(par);
    });
  })();
  function relOf(id) { return REL[id] || ""; }

  /* ---------- citation index ---------- */
  var CITED = {}; // sourceId -> {people:{id:true}, count:n}
  function noteCite(srcId, personId) {
    if (!srcId) return;
    var c = CITED[srcId] || (CITED[srcId] = { people: {}, count: 0 });
    c.count++;
    if (personId) c.people[personId] = true;
  }
  Object.keys(IND).forEach(function (id) {
    var ind = IND[id];
    ind.events.forEach(function (ev) { ev.citations.forEach(function (c) { noteCite(c.source, id); }); });
    (ind.note_citations || []).forEach(function (list) { list.forEach(function (c) { noteCite(c.source, id); }); });
  });
  Object.keys(FAM).forEach(function (fid) {
    var f = FAM[fid];
    var members = [f.husband, f.wife].filter(Boolean);
    f.events.forEach(function (ev) { ev.citations.forEach(function (c) { members.forEach(function (m) { noteCite(c.source, m); }); }); });
    (f.note_citations || []).forEach(function (list) { list.forEach(function (c) { members.forEach(function (m) { noteCite(c.source, m); }); }); });
  });

  /* ---------- header counts ---------- */
  function renderCounts() {
    var wrap = byId("counts");
    var maxGen = 0, earliest = null;
    Object.keys(ANC).forEach(function (id) {
      maxGen = Math.max(maxGen, ANC[id].gen);
      var by = birthYear(IND[id]);
      if (by && (!earliest || by < earliest)) earliest = by;
    });
    var cites = 0; Object.keys(CITED).forEach(function (k) { cites += CITED[k].count; });
    [
      [Object.keys(IND).length, "People"],
      [Object.keys(ANC).length - 1, "Direct ancestors"],
      [maxGen + 1, "Generations"],
      [earliest ? "c. " + earliest : "—", "Earliest birth"],
      [Object.keys(SRC).length, "Sources"],
      [cites, "Citations"],
    ].forEach(function (d) {
      var box = el("div", "count");
      box.appendChild(el("b", null, String(d[0])));
      box.appendChild(el("span", null, d[1]));
      wrap.appendChild(box);
    });
  }

  /* ---------- pedigree (nested, collapsible) ---------- */
  var pedRoot = HOME, pedDepth = 6;
  function card(ind, opts) {
    opts = opts || {};
    var c = el("div", "pcard" + (isTentative(ind) ? " tentative" : "") + (opts.root ? " root" : ""));
    c.setAttribute("role", "button");
    c.tabIndex = 0;
    var rel = pedRoot === HOME ? relOf(ind.id) : "";
    if (opts.root) rel = pedRoot === HOME ? "Tree subject" : "Selected person";
    if (rel) c.appendChild(el("div", "prel", rel));
    c.appendChild(el("div", "pname", primaryName(ind)));
    var sub = [lifeSpan(ind)];
    var b = eventOf(ind, "BIRT");
    if (b && b.place) sub.push(shortPlace(b.place));
    sub = sub.filter(Boolean).join(" · ");
    if (sub) c.appendChild(el("div", "pdates", sub));
    if (ANC[ind.id] && ANC[ind.id].paths > 1 && pedRoot === HOME) {
      c.appendChild(el("div", "ptwice", "Appears " + ANC[ind.id].paths + "× in your tree"));
    }
    c.addEventListener("click", function () { openPerson(ind.id); });
    c.addEventListener("keydown", function (e) { if (e.key === "Enter") openPerson(ind.id); });
    return c;
  }
  function countAncestors(id) {
    var p = parentsOf(IND[id]), n = 0;
    [p.father, p.mother].forEach(function (x) { if (x) n += 1 + countAncestors(x.id); });
    return n;
  }
  function pedNode(ind, gen) {
    var node = el("div", "pnode");
    var wrap = el("div", "pcard-wrap");
    wrap.appendChild(card(ind, { root: gen === 0 }));
    node.appendChild(wrap);
    var p = parentsOf(ind);
    if (!p.father && !p.mother) return node;
    var parents = el("div", "pparents");
    var toggle = el("button", "ptoggle");
    toggle.setAttribute("aria-label", "Show or hide parents of " + primaryName(ind));
    wrap.appendChild(toggle);
    var built = false;
    function build() {
      if (built) return; built = true;
      [p.father, p.mother].forEach(function (par) { if (par) parents.appendChild(pedNode(par, gen + 1)); });
    }
    function setOpen(open) {
      if (open) build();
      parents.hidden = !open;
      toggle.textContent = open ? "◂" : "▸ " + countAncestors(ind.id);
      toggle.title = open ? "Hide ancestors" : "Show " + countAncestors(ind.id) + " more ancestors";
      node.classList.toggle("collapsed", !open);
    }
    toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(parents.hidden); });
    node.appendChild(parents);
    setOpen(gen + 1 < pedDepth);
    return node;
  }
  function renderPedigree() {
    var host = byId("pedigree");
    host.innerHTML = "";
    var root = IND[pedRoot];
    if (!root) { host.appendChild(el("p", "hint", "No individuals yet.")); return; }
    byId("ped-root-name").textContent = primaryName(root);
    byId("ped-reset").hidden = pedRoot === HOME;
    host.appendChild(pedNode(root, 0));
  }
  function rootPedigreeAt(id) {
    pedRoot = id;
    closeDrawer();
    showView("pedigree");
    renderPedigree();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- family lines ---------- */
  function fatherChain(id) {
    var chain = [IND[id]];
    var cur = IND[id];
    while (true) {
      var p = parentsOf(cur);
      if (!p.father) break;
      chain.push(p.father);
      cur = p.father;
    }
    return chain;
  }
  function surnameOf(ind) {
    return (ind.names[0] && ind.names[0].surname) || primaryName(ind).split(" ").pop();
  }
  function renderLines() {
    var host = byId("lines");
    host.innerHTML = "";
    // Entry points: the home person, plus every direct ancestor who carries a
    // different surname from their child in the tree (typically mothers).
    var entries = [HOME];
    Object.keys(ANC).forEach(function (id) {
      if (id === HOME) return;
      var ind = IND[id];
      if (ind.sex === "F") entries.push(id);
    });
    var lines = entries.map(function (id) { return fatherChain(id); })
      .filter(function (ch) { return ch.length >= 2 || ch[0].id === HOME; })
      .map(function (ch) { return { chain: ch, entry: ch[0] }; });
    lines.sort(function (a, b) {
      var ay = birthYear(a.chain[a.chain.length - 1]) || 9999, by = birthYear(b.chain[b.chain.length - 1]) || 9999;
      return b.chain.length - a.chain.length || ay - by;
    });
    // Cousin marriages make one surname line reach Miles by more than one
    // route; show it once and list the extra entry points.
    var byTop = {};
    lines = lines.filter(function (line) {
      var topId = line.chain[line.chain.length - 1].id;
      if (byTop[topId]) { byTop[topId].also.push(line.entry); return false; }
      line.also = [];
      byTop[topId] = line;
      return true;
    });
    lines.forEach(function (line) {
      var top = line.chain[line.chain.length - 1];
      var sec = el("section", "line");
      var head = el("div", "line-head");
      head.appendChild(el("h3", null, surnameOf(top) + " line"));
      var years = line.chain.map(birthYear).filter(Boolean);
      var span = years.length ? " · born " + Math.min.apply(null, years) + "–" + Math.max.apply(null, years) : "";
      head.appendChild(el("span", "line-meta", line.chain.length + " generations" + span));
      sec.appendChild(head);
      var via = line.entry.id === HOME
        ? "Miles's own surname line, father to son."
        : "Joins the tree through " + primaryName(line.entry) + " (" + relOf(line.entry.id).toLowerCase() + ")" +
          line.also.map(function (e) { return ", and again through " + primaryName(e) + " (" + relOf(e.id).toLowerCase() + ")"; }).join("") + ".";
      sec.appendChild(el("p", "line-via", via));
      var ol = el("ol", "timeline");
      line.chain.slice().reverse().forEach(function (ind) {
        var li = el("li", isTentative(ind) ? "tentative" : "");
        var btn = el("button", "tl-item");
        var y = lifeSpan(ind);
        btn.appendChild(el("span", "tl-years", y || "dates unknown"));
        btn.appendChild(el("span", "tl-name", primaryName(ind)));
        var bits = [];
        var b = eventOf(ind, "BIRT"); if (b && b.place) bits.push(shortPlace(b.place));
        var occ = eventOf(ind, "OCCU"); if (occ && occ.value) bits.push(occ.value.split(/[;(]/)[0].trim());
        if (bits.length) btn.appendChild(el("span", "tl-sub", bits.join(" · ")));
        btn.appendChild(el("span", "tl-rel", relOf(ind.id)));
        btn.addEventListener("click", function () { openPerson(ind.id); });
        li.appendChild(btn);
        ol.appendChild(li);
      });
      sec.appendChild(ol);
      host.appendChild(sec);
    });
  }

  /* ---------- people grid ---------- */
  var peopleFilter = "all", peopleQuery = "";
  function personText(ind) {
    var parts = [primaryName(ind), relOf(ind.id)];
    ind.names.forEach(function (n) { if (n.married) parts.push(n.married); if (n.nickname) parts.push(n.nickname); });
    ind.events.forEach(function (e) { parts.push(e.place || "", e.value || "", e.date || ""); });
    parts = parts.concat(ind.notes);
    return parts.join(" ").toLowerCase();
  }
  function renderPeople() {
    var host = byId("people-grid");
    host.innerHTML = "";
    var q = peopleQuery.trim().toLowerCase();
    var keys = Object.keys(IND).filter(function (k) {
      if (peopleFilter === "anc" && !ANC[k]) return false;
      if (peopleFilter === "rel" && ANC[k]) return false;
      return !q || personText(IND[k]).indexOf(q) !== -1;
    });
    keys.sort(function (a, b) {
      var ya = birthYear(IND[a]), yb = birthYear(IND[b]);
      if (ya == null && yb == null) return primaryName(IND[a]).localeCompare(primaryName(IND[b]));
      if (ya == null) return 1;
      if (yb == null) return -1;
      return ya - yb;
    });
    if (!keys.length) { host.appendChild(el("p", "hint", "No matches.")); return; }
    keys.forEach(function (k) {
      var ind = IND[k];
      var tile = el("button", "person-tile" + (isTentative(ind) ? " tentative" : ""));
      if (relOf(k)) tile.appendChild(el("div", "prel", relOf(k)));
      var nm = primaryName(ind);
      var married = ind.names[0] && ind.names[0].married;
      tile.appendChild(el("div", "pname", nm + (married ? " (" + married + ")" : "")));
      var bits = [];
      var span = lifeSpan(ind); if (span) bits.push(span);
      var b = eventOf(ind, "BIRT"); if (b && b.place) bits.push(shortPlace(b.place));
      if (isLiving(ind)) bits.push("living");
      tile.appendChild(el("div", "pmeta", bits.join(" · ") || "—"));
      tile.addEventListener("click", function () { openPerson(k); });
      host.appendChild(tile);
    });
  }

  /* ---------- detail drawer ---------- */
  function confClass(conf) { return conf ? conf.replace(/[^A-Za-z]/g, "") : ""; }
  function shorten(s, n) { n = n || 44; return s.length > n ? s.slice(0, n - 2) + "…" : s; }
  function citePill(cit) {
    var pill = el("button", "cite-pill");
    var src = SRC[cit.source];
    var conf = cit.conf || (src && src.confidence);
    pill.appendChild(el("span", "dot conf-dot " + confClass(conf)));
    var label = el("span", "cite-title", src ? shorten(src.title) : (cit.source || "source"));
    pill.appendChild(label);
    if (conf) pill.appendChild(el("span", "cite-conf", conf));
    pill.title = (src ? src.title : "") + (cit.page ? "\n" + cit.page : "");
    pill.addEventListener("click", function () { closeDrawer(); showView("sources"); highlightSource(cit.source); });
    var wrap = el("div", "cite");
    wrap.appendChild(pill);
    if (cit.page) wrap.appendChild(el("div", "cite-page", cit.page));
    return wrap;
  }
  function citeRow(citations) {
    var row = el("div", "cite-row");
    (citations || []).forEach(function (c) { if (c.source) row.appendChild(citePill(c)); });
    return row;
  }
  function factBlock(ev) {
    var f = el("div", "fact");
    var head = el("div", "fact-head");
    head.appendChild(el("span", "fact-label", ev.label || ev.type));
    if (ev.date) head.appendChild(el("span", "fact-date", ev.date));
    f.appendChild(head);
    if (ev.value && ev.value !== ev.label) f.appendChild(el("div", "fact-val", ev.value));
    if (ev.place) f.appendChild(el("div", "fact-place", ev.place));
    var row = citeRow(ev.citations);
    if (row.children.length) f.appendChild(row);
    return f;
  }
  function relChip(ind, role) {
    var chip = el("button", "rel-chip");
    chip.appendChild(document.createTextNode(primaryName(ind) + " "));
    chip.appendChild(el("small", null, "· " + role));
    chip.addEventListener("click", function () { openPerson(ind.id); });
    return chip;
  }
  function openPerson(id) {
    var ind = IND[id];
    if (!ind) return;
    byId("d-rel").textContent = relOf(id);
    byId("d-name").textContent = primaryName(ind);
    var subBits = [];
    var span = lifeSpan(ind); if (span) subBits.push(span);
    var n0 = ind.names[0] || {};
    if (n0.married) subBits.push("married name " + n0.married);
    if (n0.nickname) subBits.push("“" + n0.nickname + "”");
    if (isLiving(ind)) subBits.push("living");
    byId("d-sub").textContent = subBits.join(" · ");

    var body = byId("d-body");
    body.innerHTML = "";

    if (isTentative(ind)) {
      body.appendChild(el("div", "callout warn", "Tentative: this person's place in the tree is a reasoned inference, not yet proven by a direct record. See the notes and sources below."));
    }

    var p = parentsOf(ind);
    var fam = el("div", "rel-links");
    if (p.father) fam.appendChild(relChip(p.father, "Father"));
    if (p.mother) fam.appendChild(relChip(p.mother, "Mother"));
    if (p.fam) p.fam.children.forEach(function (cid) { if (cid !== id && IND[cid]) fam.appendChild(relChip(IND[cid], "Sibling")); });
    (ind.fams || []).forEach(function (fid) {
      var f = FAM[fid]; if (!f) return;
      var spouseId = f.husband === id ? f.wife : f.husband;
      if (spouseId && IND[spouseId]) fam.appendChild(relChip(IND[spouseId], "Spouse"));
      (f.children || []).forEach(function (cid) { if (IND[cid]) fam.appendChild(relChip(IND[cid], "Child")); });
    });
    if (fam.children.length) {
      body.appendChild(el("div", "section-label", "Family"));
      body.appendChild(fam);
    }
    if (p.father || p.mother) {
      var btn = el("button", "action", "View this person's ancestors →");
      btn.addEventListener("click", function () { rootPedigreeAt(id); });
      body.appendChild(btn);
    }

    var familyEvents = [];
    (ind.fams || []).forEach(function (fid) {
      var f = FAM[fid]; if (!f) return;
      var spouseId = f.husband === id ? f.wife : f.husband;
      f.events.forEach(function (ev) {
        var copy = Object.assign({}, ev);
        if (spouseId && IND[spouseId]) copy.value = (ev.value ? ev.value + " — " : "") + "to " + primaryName(IND[spouseId]);
        familyEvents.push(copy);
      });
    });
    var events = ind.events.concat(familyEvents);
    if (events.length) {
      body.appendChild(el("div", "section-label", "Life events & facts"));
      var order = { BIRT: 0, CHR: 1, BAPM: 1, IMMI: 2, EDUC: 3, EVEN: 4, OCCU: 5, MARR: 6, RESI: 7, CENS: 8, DEAT: 20, BURI: 21 };
      events.slice().sort(function (a, b) {
        var oa = order[a.type] == null ? 10 : order[a.type], ob = order[b.type] == null ? 10 : order[b.type];
        if (oa !== ob) return oa - ob;
        var ya = (a.date || "").match(/\d{4}/), yb = (b.date || "").match(/\d{4}/);
        return (ya ? +ya[0] : 0) - (yb ? +yb[0] : 0);
      }).forEach(function (ev) { body.appendChild(factBlock(ev)); });
    }

    if (ind.notes && ind.notes.length) {
      body.appendChild(el("div", "section-label", "Notes"));
      ind.notes.forEach(function (n, i) {
        var block = el("div", "note-block");
        block.appendChild(el("div", "note-text", n));
        var row = citeRow((ind.note_citations || [])[i]);
        if (row.children.length) block.appendChild(row);
        body.appendChild(block);
      });
    }
    openDrawer();
  }
  var lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    byId("drawer").classList.add("open");
    byId("drawer").setAttribute("aria-hidden", "false");
    byId("backdrop").classList.add("open");
    byId("d-body").scrollTop = 0;
    byId("d-close").focus();
  }
  function closeDrawer() {
    byId("drawer").classList.remove("open");
    byId("drawer").setAttribute("aria-hidden", "true");
    byId("backdrop").classList.remove("open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- sources ---------- */
  var sourceFilter = "all";
  function renderSources() {
    var host = byId("sources-list");
    host.innerHTML = "";
    var keys = Object.keys(SRC).filter(function (k) {
      return sourceFilter === "all" || SRC[k].confidence === sourceFilter;
    });
    keys.sort(function (a, b) { return (+a.slice(1)) - (+b.slice(1)); });
    if (!keys.length) { host.appendChild(el("p", "hint", "No sources at this confidence level.")); return; }
    keys.forEach(function (k) {
      var s = SRC[k];
      var card = el("article", "source-card");
      card.id = "src-" + k;
      card.appendChild(el("h3", null, s.title));
      var meta = [];
      if (s.author) meta.push(s.author);
      if (s.publication) meta.push(s.publication);
      if (meta.length) card.appendChild(el("div", "src-meta", meta.join(" · ")));
      if (s.note) card.appendChild(el("div", "src-note", s.note));
      var cited = CITED[k];
      if (cited) {
        var ppl = Object.keys(cited.people).sort(function (a, b) { return (birthYear(IND[a]) || 9999) - (birthYear(IND[b]) || 9999); });
        var wrap = el("div", "src-people");
        wrap.appendChild(el("span", "src-people-label", cited.count + " citation" + (cited.count === 1 ? "" : "s") + " · cited for "));
        ppl.forEach(function (pid) {
          var b = el("button", "linklike", primaryName(IND[pid]));
          b.addEventListener("click", function () { openPerson(pid); });
          wrap.appendChild(b);
        });
        card.appendChild(wrap);
      }
      var foot = el("div", "src-foot");
      if (s.confidence) foot.appendChild(el("span", "conf-badge " + confClass(s.confidence), s.confidence));
      if (s.accessed) foot.appendChild(el("span", null, "Accessed " + s.accessed));
      foot.appendChild(el("span", "src-id", k));
      if (s.url) {
        var a = el("a", "src-url", s.url.replace(/^https?:\/\//, ""));
        a.href = s.url; a.target = "_blank"; a.rel = "noopener";
        foot.appendChild(a);
      }
      card.appendChild(foot);
      host.appendChild(card);
    });
  }
  function highlightSource(id) {
    if (sourceFilter !== "all") { sourceFilter = "all"; syncSeg("source-filter", "c", "all"); renderSources(); }
    var node = byId("src-" + id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.classList.add("flash");
    setTimeout(function () { node.classList.remove("flash"); }, 1800);
  }

  /* ---------- about ---------- */
  function renderAbout() {
    var host = byId("about-content");
    host.innerHTML = "";
    var intro = el("div", "callout");
    intro.innerHTML = "<b>How to read this tree.</b> This is a research document, not a finished record. " +
      "A fact is added only when a public source supports it, and each citation carries a confidence level. " +
      "Where a link is inferred rather than proven it is marked <b>Tentative</b> and drawn with a dashed border. " +
      "Unknown ancestors are left blank rather than guessed.";
    host.appendChild(intro);

    host.appendChild(el("div", "section-label", "Confidence levels"));
    var legend = el("div", "legend");
    [["Primary", "--conf-primary", "an original record, such as a census page"],
     ["Secondary", "--conf-secondary", "a published or derived source: obituaries, newspapers, compiled genealogies"],
     ["Tentative", "--conf-tentative", "a plausible inference, not yet confirmed"],
     ["Provided", "--conf-provided", "supplied directly by the family"]].forEach(function (c) {
      var item = el("div", "item");
      var dot = el("span", "dot"); dot.style.background = "var(" + c[1] + ")";
      item.appendChild(dot);
      var t = el("span"); t.innerHTML = "<b>" + c[0] + "</b> — " + c[2];
      item.appendChild(t);
      legend.appendChild(item);
    });
    host.appendChild(legend);

    // Brick walls: direct ancestors with at least one unknown parent.
    host.appendChild(el("div", "section-label", "Research frontier: ancestors whose parents are not yet identified"));
    var walls = Object.keys(ANC).filter(function (id) {
      var p = parentsOf(IND[id]);
      return !p.father || !p.mother;
    }).sort(function (a, b) { return ANC[a].gen - ANC[b].gen || (birthYear(IND[a]) || 0) - (birthYear(IND[b]) || 0); });
    var ul = el("ul", "walls");
    walls.forEach(function (id) {
      var p = parentsOf(IND[id]);
      var missing = !p.father && !p.mother ? "both parents" : !p.father ? "father" : "mother";
      var li = el("li");
      var b = el("button", "linklike", primaryName(IND[id]));
      b.addEventListener("click", function () { openPerson(id); });
      li.appendChild(b);
      li.appendChild(el("span", "wall-meta", " — " + relOf(id).toLowerCase() + (lifeSpan(IND[id]) ? ", " + lifeSpan(IND[id]) : "") + "; missing " + missing));
      ul.appendChild(li);
    });
    host.appendChild(ul);

    host.appendChild(el("div", "section-label", "Method"));
    var method = el("p", "prose");
    method.innerHTML = "The canonical data lives in a GEDCOM file (<code class=\"inline\">data/family-tree.ged</code>), " +
      "the standard genealogy interchange format, so the tree can be imported into Ancestry, FamilySearch, Gramps or any other tool. " +
      "<code class=\"inline\">scripts/build.py</code> parses it into the data this page renders. Search history, including dead ends, is kept in " +
      "<code class=\"inline\">docs/RESEARCH-LOG.md</code>.";
    host.appendChild(method);
    var note = (T.meta && T.meta.header && T.meta.header.note) || "";
    if (note) host.appendChild(el("div", "note-block", note));
  }

  /* ---------- tabs / routing ---------- */
  function showView(name) {
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    var view = byId("view-" + name);
    if (view) view.classList.add("active");
    document.querySelectorAll("#tabs button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === name);
    });
    try { localStorage.setItem("ft-view", name); } catch (e) { /* storage unavailable */ }
  }
  function syncSeg(groupId, attr, val) {
    document.querySelectorAll("#" + groupId + " button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-" + attr) === val);
    });
  }
  function wire() {
    document.querySelectorAll("#tabs button").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
    });
    byId("d-close").addEventListener("click", closeDrawer);
    byId("backdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
    byId("ped-depth").addEventListener("change", function (e) { pedDepth = +e.target.value; renderPedigree(); });
    byId("ped-reset").addEventListener("click", function () { pedRoot = HOME; renderPedigree(); });
    byId("people-search").addEventListener("input", function (e) { peopleQuery = e.target.value; renderPeople(); });
    document.querySelectorAll("#people-filter button").forEach(function (b) {
      b.addEventListener("click", function () { peopleFilter = b.getAttribute("data-f"); syncSeg("people-filter", "f", peopleFilter); renderPeople(); });
    });
    document.querySelectorAll("#source-filter button").forEach(function (b) {
      b.addEventListener("click", function () { sourceFilter = b.getAttribute("data-c"); syncSeg("source-filter", "c", sourceFilter); renderSources(); });
    });
  }

  /* ---------- init ---------- */
  renderCounts();
  renderPedigree();
  renderLines();
  renderPeople();
  renderSources();
  renderAbout();
  wire();
  try {
    var saved = localStorage.getItem("ft-view");
    if (saved && byId("view-" + saved)) showView(saved);
  } catch (e) { /* storage unavailable */ }
})();
