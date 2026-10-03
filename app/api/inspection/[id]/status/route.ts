import { isInspectionId, readStatus } from "@/lib/inspection/server";

export async function GET(_req: Request, ctx: RouteContext<"/api/inspection/[id]/status">) {
  const { id } = await ctx.params;
  if (!isInspectionId(id)) return Response.json({ error: "Invalid inspection id." }, { status: 400 });
  const status = await readStatus(id);
  if (!status) return Response.json({ error: "Inspection not found." }, { status: 404 });
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
