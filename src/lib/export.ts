/**
 * Export rows to CSV file (UTF-8 BOM for Excel compatibility).
 */
export function exportCSV(filename: string, rows: any[], columns?: { key: string; label: string }[]) {
  if (!rows.length) return;

  const cols = columns ?? Object.keys(rows[0]).map(k => ({ key: k, label: k }));

  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map(c => escape(c.label)).join(";");
  const body = rows.map(row => cols.map(c => escape(row[c.key])).join(";")).join("\n");
  const csv = "﻿" + header + "\n" + body;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
