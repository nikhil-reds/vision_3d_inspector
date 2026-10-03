import { isInspectionId, readReport, readStatus } from "@/lib/inspection/server";

export async function GET(_req: Request, ctx: RouteContext<"/api/inspection/[id]/report">) {
  const { id } = await ctx.params;
  if (!isInspectionId(id)) return Response.json({ error: "Invalid inspection id." }, { status: 400 });
  const report = await readReport(id);
  if (!report) {
    const status = await readStatus(id);
    if (!status) return Response.json({ error: "Inspection not found." }, { status: 404 });
    return Response.json({ error: "Report is not ready.", status }, { status: 409 });
  }
  return Response.json(report, { headers: { "Cache-Control": "no-store" } });
}
