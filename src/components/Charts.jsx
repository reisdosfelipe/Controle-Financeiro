import { useState, useRef } from "react";
import { fmtBRL } from "../lib.js";

function useChartTooltip() {
  const containerRef = useRef(null);
  const [tip, setTip] = useState(null);
  function showTip(e, content) {
    const rect = containerRef.current.getBoundingClientRect();
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, content });
  }
  function hideTip() { setTip(null); }
  return { containerRef, tip, showTip, hideTip };
}

function TooltipOverlay({ theme, tip }) {
  if (!tip) return null;
  const left = Math.max(4, tip.x + 12);
  const top = Math.max(4, tip.y - 12);
  return (
    <div style={{
      position: "absolute", left, top,
      background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 6,
      padding: "5px 9px", fontSize: 12, color: theme.text, pointerEvents: "none",
      whiteSpace: "nowrap", zIndex: 5, boxShadow: "0 2px 10px rgba(0,0,0,.18)", fontWeight: 600,
    }}>{tip.content}</div>
  );
}

function ChartBar({ theme, data, xKey, bars, height = 240, valueFormatter = (v) => v }) {
  const { containerRef, tip, showTip, hideTip } = useChartTooltip();
  const W = 640, H = height, padL = 54, padB = 26, padT = 12, padR = 12;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const maxVal = Math.max(1, ...data.flatMap(d => bars.map(b => Number(d[b.key]) || 0)));
  const n = Math.max(1, data.length);
  const groupW = innerW / n;
  const barW = Math.min(22, groupW / (bars.length + 1.4));
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = padT + innerH * (1 - f);
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={theme.border} strokeWidth="1" />
              <text x={padL - 8} y={y + 3} fontSize="10" fill={theme.muted} textAnchor="end">{valueFormatter(maxVal * f)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const gx = padL + i * groupW + groupW / 2;
          return (
            <g key={i}>
              {bars.map((b, bi) => {
                const val = Number(d[b.key]) || 0;
                const barH = Math.max(0, (val / maxVal) * innerH);
                const bx = gx - (bars.length * barW) / 2 + bi * barW;
                return (
                  <rect
                    key={b.key} x={bx} y={padT + innerH - barH} width={Math.max(2, barW - 3)} height={Math.max(barH, 2)}
                    fill={b.color} rx="2" style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => showTip(e, `${d[xKey]} · ${b.name}: ${valueFormatter(val)}`)}
                    onMouseMove={(e) => showTip(e, `${d[xKey]} · ${b.name}: ${valueFormatter(val)}`)}
                    onMouseLeave={hideTip}
                  />
                );
              })}
              <text x={gx} y={H - 8} fontSize="10" fill={theme.muted} textAnchor="middle">{d[xKey]}</text>
            </g>
          );
        })}
      </svg>
      <TooltipOverlay theme={theme} tip={tip} />
    </div>
  );
}

function ChartBarHorizontal({ theme, data, height, valueFormatter = (v) => v }) {
  const { containerRef, tip, showTip, hideTip } = useChartTooltip();
  const rows = data.length || 1;
  const rowH = 30;
  const H = height || rows * rowH + 20;
  const W = 640, padL = 140, padR = 60, padT = 10;
  const innerW = W - padL - padR;
  const maxVal = Math.max(1, ...data.map(d => Number(d.value) || 0));
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const y = padT + i * rowH;
          const barW = Math.max(0, (Number(d.value) / maxVal) * innerW);
          return (
            <g key={d.name}>
              <text x={padL - 8} y={y + rowH / 2 + 4} fontSize="11" fill={theme.muted} textAnchor="end">{d.name.length > 20 ? d.name.slice(0, 19) + "…" : d.name}</text>
              <rect
                x={padL} y={y + 5} width={Math.max(barW, 2)} height={rowH - 12} fill={d.color} rx="3" style={{ cursor: "pointer" }}
                onMouseEnter={(e) => showTip(e, `${d.name}: ${valueFormatter(d.value)}`)}
                onMouseMove={(e) => showTip(e, `${d.name}: ${valueFormatter(d.value)}`)}
                onMouseLeave={hideTip}
              />
              <text x={padL + barW + 6} y={y + rowH / 2 + 4} fontSize="11" fill={theme.text}>{valueFormatter(d.value)}</text>
            </g>
          );
        })}
      </svg>
      <TooltipOverlay theme={theme} tip={tip} />
    </div>
  );
}

function ChartLine({ theme, data, xKey, yKey, height = 240, color, valueFormatter = (v) => v }) {
  const { containerRef, tip, showTip, hideTip } = useChartTooltip();
  const W = 640, H = height, padL = 54, padB = 26, padT = 14, padR = 16;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const values = data.map(d => Number(d[yKey]) || 0);
  const maxVal = Math.max(1, ...values.map(v => Math.abs(v)), 0);
  const minVal = Math.min(0, ...values);
  const range = Math.max(1, maxVal - minVal);
  const n = Math.max(1, data.length - 1);
  const xAt = (i) => padL + (n === 0 ? innerW / 2 : (i / n) * innerW);
  const yAt = (v) => padT + innerH - ((v - minVal) / range) * innerH;
  const points = data.map((d, i) => `${xAt(i)},${yAt(Number(d[yKey]) || 0)}`).join(" ");
  const zeroY = yAt(0);
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
        {[0, 0.5, 1].map(f => {
          const y = padT + innerH * f;
          return <line key={f} x1={padL} y1={y} x2={W - padR} y2={y} stroke={theme.border} strokeWidth="1" />;
        })}
        <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} stroke={theme.muted} strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle
            key={i} cx={xAt(i)} cy={yAt(Number(d[yKey]) || 0)} r="6" fill={color} fillOpacity="0" stroke="none" style={{ cursor: "pointer" }}
            onMouseEnter={(e) => showTip(e, `${d[xKey]}: ${valueFormatter(d[yKey])}`)}
            onMouseMove={(e) => showTip(e, `${d[xKey]}: ${valueFormatter(d[yKey])}`)}
            onMouseLeave={hideTip}
          />
        ))}
        {data.map((d, i) => (
          <circle key={"dot" + i} cx={xAt(i)} cy={yAt(Number(d[yKey]) || 0)} r="3.5" fill={color} style={{ pointerEvents: "none" }} />
        ))}
        {data.map((d, i) => (
          <text key={i} x={xAt(i)} y={H - 8} fontSize="10" fill={theme.muted} textAnchor="middle">{d[xKey]}</text>
        ))}
      </svg>
      <TooltipOverlay theme={theme} tip={tip} />
    </div>
  );
}

function ChartPie({ theme, data, height = 240, colorFor }) {
  const { containerRef, tip, showTip, hideTip } = useChartTooltip();
  const total = data.reduce((s, d) => s + Number(d.value || 0), 0);
  const cx = 110, cy = 110, r = 90;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const frac = total > 0 ? Number(d.value) / total : 0;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    const path = frac >= 0.9999
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const midAngle = (start + end) / 2;
    const labelX = cx + (r * 0.65) * Math.cos(midAngle);
    const labelY = cy + (r * 0.65) * Math.sin(midAngle);
    return { ...d, path, frac, labelX, labelY };
  });
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg viewBox="0 0 220 220" width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        {slices.map(s => (
          <path
            key={s.name} d={s.path} fill={colorFor(s.name)} stroke="#fff" strokeWidth="1.5" style={{ cursor: "pointer" }}
            onMouseEnter={(e) => showTip(e, `${s.name}: ${fmtBRL(s.value)} (${s.frac ? Math.round(s.frac * 100) : 0}%)`)}
            onMouseMove={(e) => showTip(e, `${s.name}: ${fmtBRL(s.value)} (${s.frac ? Math.round(s.frac * 100) : 0}%)`)}
            onMouseLeave={hideTip}
          />
        ))}
        {slices.filter(s => s.frac >= 0.06).map(s => (
          <text key={s.name} x={s.labelX} y={s.labelY} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="600" style={{ pointerEvents: "none" }}>{Math.round(s.frac * 100)}%</text>
        ))}
      </svg>
      <TooltipOverlay theme={theme} tip={tip} />
    </div>
  );
}

export { ChartBar, ChartBarHorizontal, ChartLine, ChartPie };
