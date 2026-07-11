/* Hutson Family Tree UI — renders window.TREE (built from the GEDCOM). */
(function () {
  "use strict";
  var T = window.TREE || { individuals: {}, families: {}, sources: {}, meta: {} };
  var IND = T.individuals, FAM = T.families, SRC = T.sources;

  /* ---------- helpers ---------- */
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function byId(id) { return document.getElementById(id); }

  function lifeSpan(ind) {
    var b = eventOf(ind, "BIRT"), d = eventOf(ind, "DEAT");
    var by = b && b.date ? yr(b.date) : "";
    var dy = d && d.date ? yr(d.date) : "";
    if (!by && !dy) return "";
    return (by || "?") + " – " + (dy || (d ? "?" : ""));
  }
  function yr(date) {
    if (!date) return "";
    var m = String(date).match(/\d{4}/);
    return m ? m[0] : date;
  }
  function eventOf(ind, type) {
    for (var i = 0; i < ind.events.length; i++) if (ind.events[i].type === type) return ind.events[i];
    return null;
  }
  function primaryName(ind) { return ind && ind.name ? ind.name : "(unknown)"; }

  function parentsOf(ind) {
    // returns {father, mother} individuals via FAMC
    var res = { father: null, mother: null, fam: null };
    if (!ind || !ind.famc || !ind.famc.length) return res;
    var fam = FAM[ind.famc[0]];
    if (!fam) return res;
    res.fam = fam;
    res.father = fam.husband ? IND[fam.husband] : null;
    res.mother = fam.wife ? IND[fam.wife] : null;
    return res;
  }

  function pickRoot() {
    // Prefer I1 (subject); else the individual who is a child but not a parent of the deepest chain.
    if (IND.I1) return IND.I1;
    var keys = Object.keys(IND);
    return keys.length ? IND[keys[0]] : null;
  }

  /* ---------- counts ---------- */
  function renderCounts() {
    var c = (T.meta && T.meta.counts) || {};
    var wrap = byId("counts");
    var data = [
      [c.individuals || Object.keys(IND).length, "People"],
      [c.families || Object.keys(FAM).length, "Families"],
      [c.sources || Object.keys(SRC).length, "Sources"],
    ];
    data.forEach(function (d) {
      var box = el("div", "count");
      box.appendChild(el("b", null, String(d[0])));
      box.appendChild(el("span", null, d[1]));
      wrap.appendChild(box);
    });
  }

  /* ---------- pedigree ---------- */
  var MAX_GEN = 6;
  function renderPedigree() {
    var host = byId("pedigree");
    host.innerHTML = "";
    var root = pickRoot();
    if (!root) { host.appendChild(el("p", "hint", "No individuals yet.")); return; }
    // Build generations breadth-first over ancestors.
    var gens = [[{ ind: root, tag: "You / root" }]];
    for (var g = 0; g < MAX_GEN - 1; g++) {
      var next = [];
      var anyReal = false;
      gens[g].forEach(function (slot) {
        var p = slot.ind ? parentsOf(slot.ind) : { father: null, mother: null };
        var f = { ind: p.father, tag: "Father" };
        var m = { ind: p.mother, tag: "Mother" };
        if (p.father || p.mother) anyReal = true;
        next.push(f, m);
      });
      if (!anyReal) break;
      gens.push(next);
    }
    gens.forEach(function (gen, gi) {
      var col = el("div", "generation");
      gen.forEach(function (slot) {
        if (slot.ind) col.appendChild(pcard(slot.ind, gi === 0 ? slot.tag : null));
        else col.appendChild(emptyCard());
      });
      host.appendChild(col);
    });
  }
  function pcard(ind, tag) {
    var c = el("div", "pcard");
    if (tag) { var t = el("span", "ptag", tag); c.appendChild(t); }
    c.appendChild(el("div", "pname", primaryName(ind)));
    var span = lifeSpan(ind);
    var place = "";
    var b = eventOf(ind, "BIRT");
    if (b && b.place) place = b.place.split(",")[0];
    var sub = [span, place].filter(Boolean).join(" · ");
    if (sub) c.appendChild(el("div", "pdates", sub));
    c.addEventListener("click", function () { openPerson(ind.id); });
    return c;
  }
  function emptyCard() {
    var c = el("div", "pcard empty");
    c.textContent = "Not yet documented";
    return c;
  }

  /* ---------- people grid ---------- */
  function renderPeople() {
    var host = byId("people-grid");
    host.innerHTML = "";
    var keys = Object.keys(IND).sort(function (a, b) {
      return primaryName(IND[a]).localeCompare(primaryName(IND[b]));
    });
    if (!keys.length) { host.appendChild(el("p", "hint", "No people yet.")); return; }
    keys.forEach(function (k) {
      var ind = IND[k];
      var tile = el("div", "person-tile");
      tile.appendChild(el("div", "pname", primaryName(ind)));
      var bits = [];
      var span = lifeSpan(ind); if (span) bits.push(span);
      var b = eventOf(ind, "BIRT"); if (b && b.place) bits.push(b.place);
      tile.appendChild(el("div", "pmeta", bits.join(" · ") || "—"));
      tile.addEventListener("click", function () { openPerson(k); });
      host.appendChild(tile);
    });
  }

  /* ---------- detail drawer ---------- */
  function confClass(conf) {
    if (!conf) return "";
    return conf.replace(/[^A-Za-z]/g, "");
  }
  function citePill(cit) {
    var pill = el("span", "cite-pill");
    var src = SRC[cit.source];
    var dot = el("span", "dot conf-dot " + confClass(cit.conf || (src && src.confidence)));
    pill.appendChild(dot);
    pill.appendChild(el("span", null, src ? shorten(src.title) : (cit.source || "source")));
    if (cit.page) { var pg = el("span", "cite-page", "· " + cit.page); pill.appendChild(pg); }
    pill.title = "View source" + (src ? ": " + src.title : "");
    pill.addEventListener("click", function () { showView("sources"); highlightSource(cit.source); });
    return pill;
  }
  function shorten(s) { return s.length > 42 ? s.slice(0, 40) + "…" : s; }

  function factBlock(ev) {
    var f = el("div", "fact");
    var head = el("div", "fact-head");
    head.appendChild(el("span", "fact-label", ev.label || ev.type));
    if (ev.date) head.appendChild(el("span", "fact-date", ev.date));
    f.appendChild(head);
    if (ev.value && ev.value !== ev.label) f.appendChild(el("div", "fact-val", ev.value));
    if (ev.place) f.appendChild(el("div", "fact-place", ev.place));
    if (ev.citations && ev.citations.length) {
      var row = el("div", "cite-row");
      ev.citations.forEach(function (c) { if (c.source) row.appendChild(citePill(c)); });
      if (row.children.length) f.appendChild(row);
    }
    return f;
  }

  function openPerson(id) {
    var ind = IND[id];
    if (!ind) return;
    byId("d-name").textContent = primaryName(ind);
    var subBits = [];
    var span = lifeSpan(ind); if (span) subBits.push(span);
    if (ind.sex === "M") subBits.push("Male"); else if (ind.sex === "F") subBits.push("Female");
    byId("d-sub").textContent = subBits.join(" · ");

    var body = byId("d-body");
    body.innerHTML = "";

    // Relationships
    var p = parentsOf(ind);
    var rels = [];
    if (p.father) rels.push({ ind: p.father, role: "Father" });
    if (p.mother) rels.push({ ind: p.mother, role: "Mother" });
    // spouses & children via FAMS
    (ind.fams || []).forEach(function (fid) {
      var fam = FAM[fid]; if (!fam) return;
      var spouseId = fam.husband === id ? fam.wife : fam.husband;
      if (spouseId && IND[spouseId]) rels.push({ ind: IND[spouseId], role: "Spouse" });
      (fam.children || []).forEach(function (cid) {
        if (IND[cid]) rels.push({ ind: IND[cid], role: "Child" });
      });
    });
    if (rels.length) {
      body.appendChild(el("div", "section-label", "Family"));
      var rl = el("div", "rel-links");
      rels.forEach(function (r) {
        var chip = el("div", "rel-chip");
        chip.innerHTML = "";
        chip.appendChild(document.createTextNode(primaryName(r.ind) + " "));
        var s = el("small", null, "· " + r.role);
        chip.appendChild(s);
        chip.addEventListener("click", function () { openPerson(r.ind.id); });
        rl.appendChild(chip);
      });
      body.appendChild(rl);
    }

    // Events / facts
    if (ind.events && ind.events.length) {
      body.appendChild(el("div", "section-label", "Life events & facts"));
      // order: birth, then others, then death last
      var order = { BIRT: 0, CHR: 1, BAPM: 1, EDUC: 3, OCCU: 4, RESI: 5, MARR: 6, CENS: 7, DEAT: 20, BURI: 21 };
      ind.events.slice().sort(function (a, b) {
        return (order[a.type] == null ? 10 : order[a.type]) - (order[b.type] == null ? 10 : order[b.type]);
      }).forEach(function (ev) { body.appendChild(factBlock(ev)); });
    }

    // Notes
    if (ind.notes && ind.notes.length) {
      body.appendChild(el("div", "section-label", "Notes"));
      ind.notes.forEach(function (n) { body.appendChild(el("div", "note-block", n)); });
    }

    openDrawer();
  }

  function openDrawer() {
    byId("drawer").classList.add("open");
    byId("drawer").setAttribute("aria-hidden", "false");
    byId("backdrop").classList.add("open");
  }
  function closeDrawer() {
    byId("drawer").classList.remove("open");
    byId("drawer").setAttribute("aria-hidden", "true");
    byId("backdrop").classList.remove("open");
  }

  /* ---------- sources ---------- */
  function renderSources() {
    var host = byId("sources-list");
    host.innerHTML = "";
    var keys = Object.keys(SRC);
    if (!keys.length) { host.appendChild(el("p", "hint", "No sources yet.")); return; }
    keys.forEach(function (k) {
      var s = SRC[k];
      var card = el("div", "source-card");
      card.id = "src-" + k;
      var h = el("h3", null, s.title);
      card.appendChild(h);
      var meta = [];
      if (s.author) meta.push("By " + s.author);
      if (s.publication) meta.push(s.publication);
      if (meta.length) card.appendChild(el("div", "src-meta", meta.join(" · ")));
      if (s.note) card.appendChild(el("div", "src-note", s.note));
      var foot = el("div", "src-foot");
      if (s.confidence) {
        var badge = el("span", "conf-badge " + confClass(s.confidence), s.confidence);
        foot.appendChild(badge);
      }
      if (s.accessed) foot.appendChild(el("span", null, "Accessed " + s.accessed));
      foot.appendChild(el("span", "src-id", k));
      if (s.url) {
        var a = el("a", "src-url", s.url);
        a.href = s.url; a.target = "_blank"; a.rel = "noopener";
        foot.appendChild(a);
      }
      card.appendChild(foot);
      host.appendChild(card);
    });
  }
  function highlightSource(id) {
    var node = byId("src-" + id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.style.transition = "box-shadow .3s ease, border-color .3s ease";
    node.style.borderColor = "var(--gold)";
    node.style.boxShadow = "0 0 0 3px var(--accent-soft)";
    setTimeout(function () { node.style.boxShadow = ""; node.style.borderColor = ""; }, 1600);
  }

  /* ---------- about ---------- */
  function renderAbout() {
    var host = byId("about-content");
    var note = (T.meta && T.meta.header && T.meta.header.note) || "";
    host.innerHTML =
      '<div class="callout"><b>How to read this tree.</b> This is a research document, ' +
      'not a finished record. Facts are only added when a public source supports them, and each ' +
      'one is tagged with a confidence level. Gaps are shown honestly as “not yet documented” ' +
      'rather than guessed at.</div>' +
      '<div class="section-label">Confidence levels</div>' +
      '<div class="legend">' +
      '<div class="item"><span class="dot" style="background:var(--conf-primary)"></span> <b>Primary</b>&nbsp;— original record or first-hand account</div>' +
      '<div class="item"><span class="dot" style="background:var(--conf-secondary)"></span> <b>Secondary</b>&nbsp;— published/derived source</div>' +
      '<div class="item"><span class="dot" style="background:var(--conf-tentative)"></span> <b>Tentative</b>&nbsp;— plausible but unconfirmed</div>' +
      '<div class="item"><span class="dot" style="background:var(--conf-provided)"></span> <b>Provided</b>&nbsp;— supplied directly by the family</div>' +
      '</div>' +
      '<div class="section-label">Data & provenance</div>' +
      '<div class="note-block">' + escapeHtml(note) + '</div>' +
      '<div class="section-label">Method</div>' +
      '<p style="font-size:14px;max-width:70ch">The canonical data lives in a GEDCOM file ' +
      '(<code class="inline">data/family-tree.ged</code>) — the universal genealogy standard, so the ' +
      'tree can be imported into Ancestry, FamilySearch, Gramps, or any other tool. The build script ' +
      'parses it into the data this page renders. To extend the tree, edit the GEDCOM, add source ' +
      'records for anything new, and re-run the build.</p>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  /* ---------- tabs / routing ---------- */
  function showView(name) {
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    var view = byId("view-" + name);
    if (view) view.classList.add("active");
    document.querySelectorAll("#tabs button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === name);
    });
  }

  function wire() {
    document.querySelectorAll("#tabs button").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.getAttribute("data-view")); });
    });
    byId("d-close").addEventListener("click", closeDrawer);
    byId("backdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }

  /* ---------- init ---------- */
  renderCounts();
  renderPedigree();
  renderPeople();
  renderSources();
  renderAbout();
  wire();
})();
