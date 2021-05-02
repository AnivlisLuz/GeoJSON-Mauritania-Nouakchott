module.exports = function toCsv(entries) {
  if (entries.length == 0) return ""
  const firstRow = entries[0];
  const keys = Object.keys(firstRow)
    .filter(key => key[0] !== '_')
    .filter(key => firstRow[key] != null);
  const headRow = keys.join(',');
  const rows = [headRow];

  entries.forEach(entry => {
    const row = keys.map(key => entry[key]);
    const quotedRow = row.map(d => {
      if (d && d.match && d.match(/,/)) {
        return `"${d}"`;
      }

      return d;
    });
    rows.push(quotedRow.join(','));
  });

  return rows.join('\n');
};
