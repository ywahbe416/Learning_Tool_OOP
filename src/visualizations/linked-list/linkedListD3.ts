import * as d3 from "d3";

const NODE_WIDTH = 80;
const NODE_HEIGHT = 44;
const NODE_GAP = 60;
const ARROW_SIZE = 8;

export type NodeState = { id: string; value: number | string };

function xPos(i: number) {
  return i * (NODE_WIDTH + NODE_GAP) + 40;
}

export function renderList(
  svg: SVGSVGElement,
  nodes: NodeState[],
  highlightId?: string
) {
  const totalWidth = nodes.length * (NODE_WIDTH + NODE_GAP) + 40;
  const svgEl = d3.select(svg);

  svgEl.attr("width", Math.max(totalWidth, 300)).attr("height", 120);

  // Arrowhead marker
  let defs = svgEl.select<SVGDefsElement>("defs");
  if (defs.empty()) {
    defs = svgEl.append("defs");
  }
  if (defs.select("#arrow").empty()) {
    defs
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", ARROW_SIZE)
      .attr("markerHeight", ARROW_SIZE)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6366f1");
  }

  // Node groups
  const nodeGroup = svgEl.selectAll<SVGGElement, NodeState>("g.node").data(
    nodes,
    (d) => d.id
  );

  // ENTER
  const enter = nodeGroup
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (_, i) => `translate(${xPos(i)}, 38)`)
    .attr("opacity", 0);

  enter.append("rect")
    .attr("width", NODE_WIDTH)
    .attr("height", NODE_HEIGHT)
    .attr("rx", 8)
    .attr("fill", "#1e293b")
    .attr("stroke", "#6366f1")
    .attr("stroke-width", 2);

  enter.append("text")
    .attr("x", NODE_WIDTH / 2)
    .attr("y", NODE_HEIGHT / 2 + 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#f1f5f9")
    .attr("font-size", 16)
    .attr("font-weight", "bold")
    .text((d) => String(d.value));

  // Transition ENTER into place
  enter
    .transition()
    .duration(400)
    .attr("opacity", 1)
    .attr("transform", (_, i) => `translate(${xPos(i)}, 38)`);

  // UPDATE — reposition existing nodes
  nodeGroup
    .transition()
    .duration(400)
    .attr("transform", (_, i) => `translate(${xPos(i)}, 38)`)
    .attr("opacity", 1);

  // Highlight
  svgEl.selectAll<SVGRectElement, NodeState>("g.node rect").attr(
    "stroke",
    (d) => (d.id === highlightId ? "#f59e0b" : "#6366f1")
  );

  // EXIT
  nodeGroup
    .exit()
    .transition()
    .duration(300)
    .attr("opacity", 0)
    .remove();

  // Arrows between nodes
  const arrowData = nodes.slice(0, -1).map((_, i) => ({ i }));

  const arrows = svgEl
    .selectAll<SVGLineElement, { i: number }>("line.link")
    .data(arrowData, (d) => d.i);

  arrows
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#6366f1")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrow)")
    .attr("opacity", 0)
    .merge(arrows as d3.Selection<SVGLineElement, { i: number }, SVGSVGElement, unknown>)
    .transition()
    .duration(400)
    .attr("x1", (d) => xPos(d.i) + NODE_WIDTH + 2)
    .attr("y1", 38 + NODE_HEIGHT / 2)
    .attr("x2", (d) => xPos(d.i + 1) - 2)
    .attr("y2", 38 + NODE_HEIGHT / 2)
    .attr("opacity", 1);

  arrows.exit().transition().duration(300).attr("opacity", 0).remove();

  // "null" label at the end
  svgEl.selectAll("text.null-label").remove();
  if (nodes.length > 0) {
    svgEl
      .append("text")
      .attr("class", "null-label")
      .attr("x", xPos(nodes.length) + 6)
      .attr("y", 38 + NODE_HEIGHT / 2 + 5)
      .attr("fill", "#64748b")
      .attr("font-size", 13)
      .text("null");

    svgEl
      .append("line")
      .attr("class", "null-label")
      .attr("x1", xPos(nodes.length - 1) + NODE_WIDTH + 2)
      .attr("y1", 38 + NODE_HEIGHT / 2)
      .attr("x2", xPos(nodes.length) + 4)
      .attr("y2", 38 + NODE_HEIGHT / 2)
      .attr("stroke", "#475569")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");
  }

  // "head" label
  svgEl.selectAll("text.head-label").remove();
  if (nodes.length > 0) {
    svgEl
      .append("text")
      .attr("class", "head-label")
      .attr("x", xPos(0) + NODE_WIDTH / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", 11)
      .text("head");
  }
}
