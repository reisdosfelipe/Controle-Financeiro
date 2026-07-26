export function Icon({ name, size = 16, color = "currentColor", style }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style };
  switch (name) {
    case "plus": return <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case "chevron-left": return <svg {...p}><polyline points="15 18 9 12 15 6" /></svg>;
    case "chevron-right": return <svg {...p}><polyline points="9 18 15 12 9 6" /></svg>;
    case "x": return <svg {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>;
    case "check": return <svg {...p}><polyline points="5 13 9 17 19 7" /></svg>;
    case "pencil": return <svg {...p}><path d="M14 4l6 6L10 20H4v-6L14 4z" /></svg>;
    case "trash": return <svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>;
    case "wallet": return <svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 13h3" /><path d="M3 10h18" /></svg>;
    case "trend-down": return <svg {...p}><polyline points="4 7 10 13 13 10 20 17" /><polyline points="20 10 20 17 13 17" /></svg>;
    case "shield-check": return <svg {...p}><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /><polyline points="9 12 11 14 15 10" /></svg>;
    case "grid": return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>;
    case "list-plus": return <svg {...p}><line x1="3" y1="6" x2="13" y2="6" /><line x1="3" y1="12" x2="13" y2="12" /><line x1="3" y1="18" x2="9" y2="18" /><line x1="18" y1="13" x2="18" y2="19" /><line x1="15" y1="16" x2="21" y2="16" /></svg>;
    case "piggy": return <svg {...p}><circle cx="12" cy="13" r="7" /><circle cx="8" cy="11" r="1" fill={color} /><path d="M12 6V4" /><path d="M9 20v2" /><path d="M15 20v2" /><path d="M19 12h2" /></svg>;
    case "sun": return <svg {...p}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4" y1="12" x2="2" y2="12" /><line x1="22" y1="12" x2="20" y2="12" /><line x1="5.6" y1="5.6" x2="4.2" y2="4.2" /><line x1="19.8" y1="19.8" x2="18.4" y2="18.4" /><line x1="5.6" y1="18.4" x2="4.2" y2="19.8" /><line x1="19.8" y1="4.2" x2="18.4" y2="5.6" /></svg>;
    case "moon": return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    case "repeat": return <svg {...p}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>;
    case "power": return <svg {...p}><path d="M12 2v10" /><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /></svg>;
    case "power-off": return <svg {...p}><path d="M12 2v10" /><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="2" y1="2" x2="22" y2="22" /></svg>;
    case "github": return <svg {...p} fill={color} stroke="none"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" /></svg>;
    default: return null;
  }
}
