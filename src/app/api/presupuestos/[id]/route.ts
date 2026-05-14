import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Presupuesto from "@/models/Presupuesto";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const { id } = await params;
  await Presupuesto.findOneAndDelete({ _id: id, userEmail: session.user.email });
  return Response.json({ ok: true });
}
