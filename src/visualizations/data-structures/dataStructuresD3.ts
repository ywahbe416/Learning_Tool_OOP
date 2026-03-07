import * as d3 from "d3";
import { VIZ_COLORS, VIZ_TRANSITIONS } from "../shared/vizHelpers";

const ITEM_W = 64;
const ITEM_H = 40;
const GAP = 8;

export type Item = { id: string; value: string | number };

// Stack: vertical column, newest on top (index 0 = top)
export function renderStack(svg: SVGSVGElement, items: Item[], highlightId?: string) {
  const el = d3.select(svg);
  const maxItems = 6;
  const visible = items.slice(0, maxItems);
  const svgH = maxItems * (ITEM_H + GAP) + 40;

  el.attr("width", ITEM_W + 32).attr("height", svgH);

  const groups = el.selectAll<SVGGElement, Item>("g.stack-item").data(visible, (d) => d.id);

  // y from top: index 0 = top of stack
  const yPos = (i: number) => i * (ITEM_H + GAP) + 8;

  const enter = groups.enter().append("g").attr("class", "stack-item")
    .attr("transform", `translate(8, -${ITEM_H})`)
    .attr("opacity", 0);

  enter.append("rect")
    .attr("width", ITEM_W).attr("height", ITEM_H).attr("rx", 6)
    .attr("fill", VIZ_COLORS.node).attr("stroke", VIZ_COLORS.nodeBorder).attr("stroke-width", 2);

  enter.append("text")
    .attr("x", ITEM_W / 2).attr("y", ITEM_H / 2 + 5)
    .attr("text-anchor", "middle").attr("fill", VIZ_COLORS.text)
    .attr("font-size", 14).attr("font-weight", "bold")
    .text((d) => String(d.value));

  enter.merge(groups as d3.Selection<SVGGElement, Item, SVGSVGElement, unknown>)
    .transition().duration(VIZ_TRANSITIONS.normal)
    .attr("transform", (_, i) => `translate(8, ${yPos(i)})`)
    .attr("opacity", 1);

  // highlight
  el.selectAll<SVGRectElement, Item>("g.stack-item rect")
    .attr("stroke", (d) => d.id === highlightId ? VIZ_COLORS.highlight : VIZ_COLORS.nodeBorder);

  groups.exit().transition().duration(VIZ_TRANSITIONS.fast).attr("opacity", 0).remove();

  // "top" label
  el.selectAll("text.top-label").remove();
  if (visible.length > 0) {
    el.append("text").attr("class", "top-label")
      .attr("x", ITEM_W + 12).attr("y", yPos(0) + ITEM_H / 2 + 5)
      .attr("fill", VIZ_COLORS.highlight).attr("font-size", 11).text("← top");
  }
}

// Queue: horizontal row, index 0 = front
export function renderQueue(svg: SVGSVGElement, items: Item[], highlightId?: string) {
  const el = d3.select(svg);
  const maxItems = 5;
  const visible = items.slice(0, maxItems);
  const svgW = maxItems * (ITEM_W + GAP) + 32;

  el.attr("width", svgW).attr("height", ITEM_H + 48);

  const xPos = (i: number) => i * (ITEM_W + GAP) + 8;

  const groups = el.selectAll<SVGGElement, Item>("g.queue-item").data(visible, (d) => d.id);

  const enter = groups.enter().append("g").attr("class", "queue-item")
    .attr("transform", `translate(${svgW}, 8)`).attr("opacity", 0);

  enter.append("rect")
    .attr("width", ITEM_W).attr("height", ITEM_H).attr("rx", 6)
    .attr("fill", VIZ_COLORS.node).attr("stroke", VIZ_COLORS.nodeBorder).attr("stroke-width", 2);

  enter.append("text")
    .attr("x", ITEM_W / 2).attr("y", ITEM_H / 2 + 5)
    .attr("text-anchor", "middle").attr("fill", VIZ_COLORS.text)
    .attr("font-size", 14).attr("font-weight", "bold")
    .text((d) => String(d.value));

  enter.merge(groups as d3.Selection<SVGGElement, Item, SVGSVGElement, unknown>)
    .transition().duration(VIZ_TRANSITIONS.normal)
    .attr("transform", (_, i) => `translate(${xPos(i)}, 8)`)
    .attr("opacity", 1);

  el.selectAll<SVGRectElement, Item>("g.queue-item rect")
    .attr("stroke", (d) => d.id === highlightId ? VIZ_COLORS.highlight : VIZ_COLORS.nodeBorder);

  groups.exit().transition().duration(VIZ_TRANSITIONS.fast).attr("opacity", 0).remove();

  // "front" / "rear" labels
  el.selectAll("text.queue-label").remove();
  if (visible.length > 0) {
    el.append("text").attr("class", "queue-label")
      .attr("x", xPos(0) + ITEM_W / 2).attr("y", ITEM_H + 24)
      .attr("text-anchor", "middle").attr("fill", VIZ_COLORS.highlight).attr("font-size", 10)
      .text("front (dequeue)");
    el.append("text").attr("class", "queue-label")
      .attr("x", xPos(visible.length - 1) + ITEM_W / 2).attr("y", ITEM_H + 36)
      .attr("text-anchor", "middle").attr("fill", VIZ_COLORS.muted).attr("font-size", 10)
      .text("rear (enqueue)");
  }
}
