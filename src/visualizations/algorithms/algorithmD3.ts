import * as d3 from "d3";
import { VIZ_COLORS, VIZ_TRANSITIONS } from "../shared/vizHelpers";

export type CellState = "normal" | "active" | "found" | "eliminated";

export interface ArrayCell {
  value: number;
  state: CellState;
}

const CELL_W = 50;
const CELL_H = 44;
const GAP = 6;

export function renderArray(
  svg: SVGSVGElement,
  cells: ArrayCell[],
  low: number,
  mid: number,
  high: number,
  showPointers: boolean
) {
  const svgW = cells.length * (CELL_W + GAP) + 24;
  const svgH = CELL_H + 64;
  const el = d3.select(svg);
  el.attr("width", svgW).attr("height", svgH);

  const xPos = (i: number) => i * (CELL_W + GAP) + 12;

  function cellFill(state: CellState) {
    switch (state) {
      case "active":      return VIZ_COLORS.highlight;
      case "found":       return VIZ_COLORS.success;
      case "eliminated":  return VIZ_COLORS.eliminated;
      default:            return VIZ_COLORS.node;
    }
  }

  function cellStroke(state: CellState) {
    switch (state) {
      case "active":  return VIZ_COLORS.highlight;
      case "found":   return VIZ_COLORS.success;
      default:        return VIZ_COLORS.nodeBorder;
    }
  }

  const groups = el
    .selectAll<SVGGElement, ArrayCell>("g.cell")
    .data(cells, (_, i) => String(i));

  const enter = groups.enter().append("g").attr("class", "cell")
    .attr("transform", (_, i) => `translate(${xPos(i)}, 8)`)
    .attr("opacity", 0);

  enter.append("rect")
    .attr("width", CELL_W).attr("height", CELL_H).attr("rx", 6)
    .attr("fill", (d) => cellFill(d.state))
    .attr("stroke", (d) => cellStroke(d.state))
    .attr("stroke-width", 2);

  enter.append("text")
    .attr("x", CELL_W / 2).attr("y", CELL_H / 2 + 6)
    .attr("text-anchor", "middle")
    .attr("fill", VIZ_COLORS.text)
    .attr("font-size", 15).attr("font-weight", "bold")
    .text((d) => d.value);

  const merged = enter.merge(groups as d3.Selection<SVGGElement, ArrayCell, SVGSVGElement, unknown>);

  merged.transition().duration(VIZ_TRANSITIONS.normal)
    .attr("transform", (_, i) => `translate(${xPos(i)}, 8)`)
    .attr("opacity", 1);

  merged.select<SVGRectElement>("rect")
    .transition().duration(VIZ_TRANSITIONS.normal)
    .attr("fill", (d) => cellFill(d.state))
    .attr("stroke", (d) => cellStroke(d.state));

  groups.exit().remove();

  // Pointer labels
  el.selectAll("text.ptr").remove();
  el.selectAll("line.ptr").remove();

  if (showPointers) {
    const ptrs: { i: number; label: string; color: string }[] = [];
    if (low >= 0 && low < cells.length) ptrs.push({ i: low, label: "low", color: "#60a5fa" });
    if (high >= 0 && high < cells.length && high !== low) ptrs.push({ i: high, label: "high", color: "#60a5fa" });
    if (mid >= 0 && mid < cells.length) ptrs.push({ i: mid, label: "mid", color: VIZ_COLORS.highlight });

    ptrs.forEach(({ i, label, color }) => {
      el.append("text").attr("class", "ptr")
        .attr("x", xPos(i) + CELL_W / 2)
        .attr("y", CELL_H + 30)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", 11)
        .attr("font-weight", "bold")
        .text(label);
    });
  }
}
