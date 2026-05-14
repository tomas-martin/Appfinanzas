import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Presupuesto from "@/models/Presupuesto";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const { searchParams } = request.nextUrl;
  const mes = Number(searchParams.get("mes") ?? new Date().getMonth());
  const anio = Number(searchParams.get("anio") ?? new Date().getFullYear());
  const data = await Presupuesto.find({ userEmail: session.user.email, mes, anio }).lean();
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const body = await request.json();
  const doc = await Presupuesto.findOneAndUpdate(
    { userEmail: session.user.email, categoria: body.categoria, mes: body.mes, anio: body.anio },
    { monto: body.monto },
    { upsert: true, new: true }
  );
  return Response.json(doc, { status: 201 });
}
