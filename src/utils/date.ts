/**
 * Utility for formatting dates in Indian English styles.
 * E.g., '15 July 2026' or '15/07/2026'.
 */
export function formatIndianDate(dateStr: string, format?: 'text' | 'numeric'): string {
  if (!dateStr) return '';
  
  const trimmed = dateStr.trim();
  const resolvedFormat = format || (typeof window !== 'undefined' ? (localStorage.getItem('kartigo_admin_date_format') as 'text' | 'numeric' || 'text') : 'text');

  // Parse standard date formats (like YYYY-MM-DD or YYYY/MM/DD) without timezone shifts
  const partsYMD = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  let date: Date;
  if (partsYMD) {
    date = new Date(parseInt(partsYMD[1], 10), parseInt(partsYMD[2], 10) - 1, parseInt(partsYMD[3], 10));
  } else {
    date = new Date(trimmed);
  }

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  if (resolvedFormat === 'numeric') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${monthName} ${year}`;
  }
}
