/**
 * Smart Edge Router — obstacle-aware path finding for diagram connections.
 *
 * Supports:
 * - Bezier curves (default, smooth)
 * - Straight lines
 * - Step paths (rounded corners)
 * - Orthogonal paths (90-degree bends, draw.io style)
 * - Obstacle avoidance for bezier and orthogonal
 */

interface Rect { x: number; y: number; w: number; h: number; }
interface Point { x: number; y: number; }

/** Build the SVG path string for a given edge type */
export function buildEdgePath(
  source: Point, target: Point,
  type: string,
  obstacles: Rect[],
  sourceDir?: string,
  targetDir?: string
): { path: string; labelX: number; labelY: number; waypoints: Point[] } {
  const dir = sourceDir || 'bottom';
  const tDir = targetDir || 'top';

  // Check if direct bezier would hit obstacles
  const hasObstacles = obstacles.length > 0 && type !== 'straight';
  const hittingObs = hasObstacles ? findBlockingObstacles(source, target, obstacles, dir, tDir) : [];

  let path: string;
  let labelX = (source.x + target.x) / 2;
  let labelY = (source.y + target.y) / 2;
  let waypoints: Point[] = [];

  switch (type) {
    case 'straight':
      path = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
      break;
    case 'step':
      path = stepPath(source, target, dir, tDir);
      break;
    case 'smooth':
      path = smoothStepPath(source, target, dir, tDir);
      break;
    case 'orthogonal':
      if (hittingObs.length > 0) {
        const result = orthogonalAvoiding(source, target, hittingObs, dir, tDir);
        path = result.path;
        waypoints = result.waypoints;
        labelX = result.labelX;
        labelY = result.labelY;
      } else {
        const result = orthogonalPath(source, target, dir, tDir);
        path = result.path;
        waypoints = result.waypoints;
        labelX = result.labelX;
        labelY = result.labelY;
      }
      break;
    case 'bezier':
    default:
      if (hittingObs.length > 0) {
        const result = bezierAvoiding(source, target, hittingObs, dir, tDir);
        path = result.path;
        waypoints = result.waypoints;
        labelX = result.labelX;
        labelY = result.labelY;
      } else {
        path = bezierCurve(source, target, dir, tDir);
      }
      break;
  }

  return { path, labelX, labelY, waypoints };
}

// ---- Bezier ----
function bezierCurve(s: Point, t: Point, sd: string, td: string): string {
  const cp1 = controlPoint(s, sd, 0.5);
  const cp2 = controlPoint(t, td, 0.5);
  return `M ${s.x} ${s.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${t.x} ${t.y}`;
}

// ---- Step (single corner) ----
function stepPath(s: Point, t: Point, sd: string, td: string): string {
  const mx = (s.x + t.x) / 2;
  const my = (s.y + t.y) / 2;

  if ((sd === 'bottom' || sd === 'top') && (td === 'left' || td === 'right')) {
    return `M ${s.x} ${s.y} L ${s.x} ${my} L ${t.x} ${my} L ${t.x} ${t.y}`;
  }
  if ((sd === 'left' || sd === 'right') && (td === 'top' || td === 'bottom')) {
    return `M ${s.x} ${s.y} L ${mx} ${s.y} L ${mx} ${t.y} L ${t.x} ${t.y}`;
  }
  // Default: rounded step via bezier
  return smoothStepPath(s, t, sd, td);
}

// ---- Smooth step (rounded corner) ----
function smoothStepPath(s: Point, t: Point, sd: string, td: string): string {
  const mx = (s.x + t.x) / 2;
  const my = (s.y + t.y) / 2;
  const r = 10;

  if ((sd === 'bottom' || sd === 'top') && (td === 'left' || td === 'right')) {
    return `M ${s.x} ${s.y} L ${s.x} ${my - r} Q ${s.x} ${my} ${s.x + r} ${my} L ${t.x - r} ${my} Q ${t.x} ${my} ${t.x} ${my + r} L ${t.x} ${t.y}`;
  }
  if ((sd === 'left' || sd === 'right') && (td === 'top' || td === 'bottom')) {
    return `M ${s.x} ${s.y} L ${mx - r} ${s.y} Q ${mx} ${s.y} ${mx} ${s.y + r} L ${mx} ${t.y - r} Q ${mx} ${t.y} ${mx + r} ${t.y} L ${t.x} ${t.y}`;
  }
  return smoothStepPath(s, t, 'bottom', 'top');
}

// ---- Orthogonal (90-degree bends, draw.io style) ----
function orthogonalPath(s: Point, t: Point, sd: string, td: string): { path: string; waypoints: Point[]; labelX: number; labelY: number } {
  const waypoints: Point[] = [];
  let path = '';
  const margin = 30;

  if ((sd === 'bottom' && td === 'top') || (sd === 'top' && td === 'bottom')) {
    // Same vertical alignment: go out, over, then in
    const outY = sd === 'bottom' ? s.y + margin : s.y - margin;
    const inY = td === 'top' ? t.y - margin : t.y + margin;
    const midX = (s.x + t.x) / 2;
    waypoints.push({ x: s.x, y: outY }, { x: midX, y: outY }, { x: midX, y: inY }, { x: t.x, y: inY });
    path = buildOrthogonalSVG([s, ...waypoints, t]);
  } else if ((sd === 'left' && td === 'right') || (sd === 'right' && td === 'left')) {
    const outX = sd === 'right' ? s.x + margin : s.x - margin;
    const inX = td === 'left' ? t.x - margin : t.x + margin;
    const midY = (s.y + t.y) / 2;
    waypoints.push({ x: outX, y: s.y }, { x: outX, y: midY }, { x: inX, y: midY }, { x: inX, y: t.y });
    path = buildOrthogonalSVG([s, ...waypoints, t]);
  } else if ((sd === 'bottom' || sd === 'top') && (td === 'left' || td === 'right')) {
    const outY = sd === 'bottom' ? s.y + margin : s.y - margin;
    const inX = td === 'left' ? t.x - margin : t.x + margin;
    waypoints.push({ x: s.x, y: outY }, { x: inX, y: outY });
    path = buildOrthogonalSVG([s, ...waypoints, t]);
  } else if ((sd === 'left' || sd === 'right') && (td === 'top' || td === 'bottom')) {
    const outX = sd === 'right' ? s.x + margin : s.x - margin;
    const inY = td === 'top' ? t.y - margin : t.y + margin;
    waypoints.push({ x: outX, y: s.y }, { x: outX, y: inY });
    path = buildOrthogonalSVG([s, ...waypoints, t]);
  } else {
    // Default: simple L-shape
    waypoints.push({ x: t.x, y: s.y });
    path = buildOrthogonalSVG([s, ...waypoints, t]);
  }

  const midIdx = Math.floor(waypoints.length / 2);
  const labelWp = waypoints.length > 0 ? waypoints[midIdx] : { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };

  return { path, waypoints, labelX: labelWp.x, labelY: labelWp.y };
}

function buildOrthogonalSVG(points: Point[]): string {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// ---- Obstacle avoidance for bezier ----
function bezierAvoiding(s: Point, t: Point, obs: Rect[], sd: string, td: string): { path: string; waypoints: Point[]; labelX: number; labelY: number } {
  const wp = computeAvoidWaypoints(s, t, obs);
  if (wp.length === 0) return { path: bezierCurve(s, t, sd, td), waypoints: [], labelX: (s.x + t.x) / 2, labelY: (s.y + t.y) / 2 };

  // Build bezier segments through waypoints
  const all = [s, ...wp, t];
  let path = `M ${s.x} ${s.y}`;
  for (let i = 1; i < all.length; i++) {
    const prev = all[i - 1];
    const curr = all[i];
    const midX = (prev.x + curr.x) / 2;
    path += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const mw = wp[Math.floor(wp.length / 2)];
  return { path, waypoints: wp, labelX: mw.x, labelY: mw.y - 10 };
}

// ---- Obstacle avoidance for orthogonal ----
function orthogonalAvoiding(s: Point, t: Point, obs: Rect[], sd: string, td: string): { path: string; waypoints: Point[]; labelX: number; labelY: number } {
  const wp = computeAvoidWaypoints(s, t, obs);
  if (wp.length === 0) return orthogonalPath(s, t, sd, td);

  const all = [s, ...wp, t];
  const path = buildOrthogonalSVG(all);
  const mw = wp[Math.floor(wp.length / 2)];
  return { path, waypoints: wp, labelX: mw.x, labelY: mw.y - 10 };
}

// ---- Common obstacle detection and avoidance ----
function findBlockingObstacles(s: Point, t: Point, obstacles: Rect[], sd: string, td: string): Rect[] {
  const pad = 8;
  return obstacles.filter((obs) => {
    const r = { x: obs.x - pad, y: obs.y - pad, w: obs.w + pad * 2, h: obs.h + pad * 2 };
    // Sample the direct bezier
    for (let i = 0; i <= 15; i++) {
      const frac = i / 15;
      const cp1 = controlPoint(s, sd, 0.4);
      const cp2 = controlPoint(t, td, 0.4);
      const pt = cubicBezierPoint(s, cp1, cp2, t, frac);
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        return true;
      }
    }
    return false;
  });
}

function computeAvoidWaypoints(s: Point, t: Point, obs: Rect[]): Point[] {
  const pad = 30;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const o of obs) {
    minX = Math.min(minX, o.x - pad);
    minY = Math.min(minY, o.y - pad);
    maxX = Math.max(maxX, o.x + o.w + pad);
    maxY = Math.max(maxY, o.y + o.h + pad);
  }

  const goRight = s.x < maxX + 20;
  const marginX = 60;
  const marginY = 40;

  if (goRight) {
    return [
      { x: maxX + marginX, y: s.y + marginY },
      { x: maxX + marginX, y: t.y - marginY },
    ];
  } else {
    return [
      { x: minX - marginX, y: s.y + marginY },
      { x: minX - marginX, y: t.y - marginY },
    ];
  }
}

// ---- Helpers ----
function controlPoint(p: Point, dir: string, dist: number): Point {
  const d = 80 * dist;
  switch (dir) {
    case 'top': return { x: p.x, y: p.y - d };
    case 'bottom': return { x: p.x, y: p.y + d };
    case 'left': return { x: p.x - d, y: p.y };
    case 'right': return { x: p.x + d, y: p.y };
    default: return { x: p.x, y: p.y + d };
  }
}

function cubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt, mt3 = mt2 * mt;
  const t2 = t * t, t3 = t2 * t;
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

export function getHandleDirection(handleId: string | null | undefined): string {
  if (!handleId) return 'bottom';
  if (handleId.includes('top')) return 'top';
  if (handleId.includes('bottom')) return 'bottom';
  if (handleId.includes('left')) return 'left';
  if (handleId.includes('right')) return 'right';
  return 'bottom';
}
