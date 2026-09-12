"use client";

import { useState, type ReactNode } from "react";

export function CatalogNavigation({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="catalog-navigation">
      <button
        type="button"
        className="catalog-navigation-toggle"
        aria-expanded={open}
        aria-controls="catalog-navigation-content"
        onClick={() => setOpen(!open)}
      >
        Browse categories & collections{" "}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div
        id="catalog-navigation-content"
        className={`catalog-navigation-content ${open ? "is-open" : ""}`}
      >
        {children}
      </div>
    </aside>
  );
}
