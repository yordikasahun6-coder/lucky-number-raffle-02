export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    alert("Nothing to export.");
    return;
  }

  const headers = Object.keys(rows[0]);

  function escapeCell(value: any): string {
    const str = String(value ?? "");
    // Wrap in quotes and escape any internal quotes if the value
    // contains a comma, quote, or newline — standard CSV rules
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  const csvContent = csvLines.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  }); // \uFEFF = BOM, so Excel reads special characters correctly
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
