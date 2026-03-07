import * as d3 from "d3";
import { VIZ_COLORS, VIZ_TRANSITIONS } from "../shared/vizHelpers";

export interface Student {
  name: string;
  gpa: number;
}

const BAR_W = 48;
const BAR_GAP = 12;
const MAX_H = 120;
const MIN_GPA = 2.0;
const MAX_GPA = 4.0;

function barHeight(gpa: number) {
  return ((gpa - MIN_GPA) / (MAX_GPA - MIN_GPA)) * MAX_H + 20;
}

export function renderBars(
  svg: SVGSVGElement,
  students: Student[],
  highlightName?: string
) {
  const svgW = students.length * (BAR_W + BAR_GAP) + 24;
  const svgH = MAX_H + 70;
  const el = d3.select(svg);
  el.attr("width", svgW).attr("height", svgH);

  const xPos = (i: number) => i * (BAR_W + BAR_GAP) + 12;

  const groups = el
    .selectAll<SVGGElement, Student>("g.bar-group")
    .data(students, (d) => d.name);

  // ENTER
  const enter = groups
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", (_, i) => `translate(${xPos(i)}, 0)`)
    .attr("opacity", 0);

  enter.append("rect")
    .attr("class", "bar-rect")
    .attr("width", BAR_W)
    .attr("rx", 4)
    .attr("y", (d) => MAX_H - barHeight(d.gpa) + 8)
    .attr("height", (d) => barHeight(d.gpa))
    .attr("fill", VIZ_COLORS.nodeBorder);

  enter.append("text")
    .attr("class", "gpa-label")
    .attr("x", BAR_W / 2)
    .attr("y", (d) => MAX_H - barHeight(d.gpa) + 4)
    .attr("text-anchor", "middle")
    .attr("fill", VIZ_COLORS.muted)
    .attr("font-size", 11)
    .text((d) => d.gpa.toFixed(1));

  enter.append("text")
    .attr("class", "name-label")
    .attr("x", BAR_W / 2)
    .attr("y", MAX_H + 24)
    .attr("text-anchor", "middle")
    .attr("fill", VIZ_COLORS.text)
    .attr("font-size", 11)
    .text((d) => d.name);

  // UPDATE + merge: smooth x transition (D3's object constancy strength)
  const merged = enter.merge(groups as d3.Selection<SVGGElement, Student, SVGSVGElement, unknown>);

  merged
    .transition()
    .duration(VIZ_TRANSITIONS.slow)
    .attr("transform", (_, i) => `translate(${xPos(i)}, 0)`)
    .attr("opacity", 1);

  merged.select<SVGRectElement>("rect.bar-rect")
    .transition()
    .duration(VIZ_TRANSITIONS.slow)
    .attr("fill", (d) => d.name === highlightName ? VIZ_COLORS.highlight : VIZ_COLORS.nodeBorder)
    .attr("y", (d) => MAX_H - barHeight(d.gpa) + 8)
    .attr("height", (d) => barHeight(d.gpa));

  merged.select<SVGTextElement>("text.gpa-label")
    .transition()
    .duration(VIZ_TRANSITIONS.slow)
    .attr("y", (d) => MAX_H - barHeight(d.gpa) + 4)
    .text((d) => d.gpa.toFixed(1));

  groups.exit().transition().duration(VIZ_TRANSITIONS.fast).attr("opacity", 0).remove();
}
