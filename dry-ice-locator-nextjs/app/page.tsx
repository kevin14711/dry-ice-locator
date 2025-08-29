
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/globals.css";

type Listing = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  supplierType?: string;
  forms?: string[];
  minOrderLbs?: number | null;
  pricePerLb?: number | null;
  hours?: string | null;
  notes?: string | null;
  featured?: boolean;
};

const supplierTypes = ["All","Grocery","Welding Supply","Gas Supplier","Party Store","Industrial","Pharmacy","Specialty Ice","Catering Supply","Other"];
const dryIceForms  = ["All","Blocks","Pellets","Nuggets","Slices","Pelletized Snow","Other"];

export default function Page() {
  const [all, setAll] = useState<Listing[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [formFilter, setFormFilter] = useState<string>("All");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  useEffect(() => {
    fetch("/data/listings.json").then(r => r.json()).then(setAll);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (all || []).filter((r) => {
      const hay = [
        r.name, r.address || "", r.city || "", r.state || "", r.zip || "", r.notes || "",
        r.supplierType || "", (r.forms || []).join(", ")
      ].join(" ").toLowerCase();

      const matchesTerm = !term || hay.includes(term);
      const matchesType = typeFilter === "All" || r.supplierType === typeFilter;
      const matchesForm = formFilter === "All" || (r.forms || []).includes(formFilter);
      const matchesFeatured = !onlyFeatured || !!r.featured;
      return matchesTerm && matchesType && matchesForm && matchesFeatured;
    });
  }, [all, q, typeFilter, formFilter, onlyFeatured]);

  const clear = () => {
    setQ("");
    setTypeFilter("All");
    setFormFilter("All");
    setOnlyFeatured(false);
  };

  return (
    <div className="min">
      {/* Banner */}
      <div className="banner"><div className="inner"><strong>Note:</strong> Dry ice stock changes daily. Availability and minimums vary by location—<em>please call ahead</em>.</div></div>

      {/* Header */}
      <header className="wrap head">
        <div className="brand">
          <span className="logo" />
          <h1>Dry Ice Locator</h1>
        </div>
        <div className="head-actions">
          <a className="primary" href="/form.html">Submit a Listing</a>
          <a href="/data/listings.json" target="_blank" rel="noopener">View Data</a>
        </div>
      </header>
      <p className="wrap sub">Find local dry ice suppliers by store type, form, and location. Start in Northern Illinois; scale nationwide.</p>

      {/* Controls */}
      <section className="wrap controls">
        <div className="grid">
          <input
            className="input"
            placeholder="Search by name, city, notes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" value={formFilter} onChange={(e) => setFormFilter(e.target.value)}>
            {dryIceForms.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="actions">
            <button className={onlyFeatured ? "primary" : ""} onClick={() => setOnlyFeatured(s => !s)}>Featured</button>
            <button className="clear" onClick={clear}>Clear</button>
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="wrap results">
        {results.length === 0 ? (
          <p className="muted">No results. Try clearing filters or broadening your search.</p>
        ) : (
          <div className="cards">
            {results.map((r, idx) => <Card key={r.name + idx} r={r} />)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="wrap foot">
        <p className="muted">Tip: Update <code>/public/data/listings.json</code> and redeploy to refresh the site.</p>
      </footer>
    </div>
  );
}

function Card({ r }: { r: Listing }) {
  const hasAddress = !!(r.address && r.address.trim());
  const query = hasAddress
    ? `${r.address}, ${r.city || ""} ${r.state || ""} ${r.zip || ""}`.trim()
    : `${r.name}, ${r.city || ""} ${r.state || ""}`.trim();
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);

  const digits = (r.phone || "").replace(/[^0-9+]/g, "");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(r.phone || "");
      alert("Phone number copied!");
    } catch {}
  };

  return (
    <div className={`card ${r.featured ? "featured" : ""}`}>
      <div className="cardhead">
        <h2>{r.name}</h2>
        {r.featured ? <span className="badge green">Featured</span> : null}
        {r.supplierType === "Grocery" ? <span className="badge">Call before you go</span> : null}
      </div>

      {hasAddress ? <div className="row">{r.address}, {r.city}{r.city ? "," : ""} {r.state} {r.zip}</div> : null}
      {r.phone ? (
        <div className="row">
          <a className="link" href={digits ? `tel:${digits}` : "#"}>{r.phone}</a>
          <button className="copy-btn" onClick={onCopy}>Copy</button>
        </div>
      ) : null}
      <div className="row">
        {r.website ? <a className="link" href={r.website} target="_blank" rel="noopener noreferrer">Website</a> : null}
        <a className="link" style={{ marginLeft: r.website ? 8 : 0 }} href={mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
      </div>

      <div className="actions">
        {r.supplierType ? <span className="badge">{r.supplierType}</span> : null}
        {(r.forms || []).map(f => <span className="badge" key={f}>{f}</span>)}
      </div>

      <div className="meta">Min Order: {r.minOrderLbs ?? "—"} lbs | {r.pricePerLb ? `$${Number(r.pricePerLb).toFixed(2)}/lb` : "—"}</div>
      <div className="meta">Hours: {r.hours ?? "—"}</div>
      {r.notes ? <div className="note">{r.notes}</div> : null}
    </div>
  );
}
