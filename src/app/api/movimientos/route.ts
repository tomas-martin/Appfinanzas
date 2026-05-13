import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movimiento from "@/models/Movimiento";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const searchParams = request.nextUrl.searchParams;
  const mes = searchParams.get("mes");
  const anio = searchParams.get("anio");
  const tipo = searchParams.get("tipo");

  const filter: Record<string, unknown> = { userEmail: session.user.email };

  if (mes && anio) {
    const start = new Date(Number(anio), Number(mes), 1);
    const end = new Date(Number(anio), Number(mes) + 1, 0, 23, 59, 59);
    filter.fecha = { $gte: start, $lte: end };
  }

  if (tipo) {
    filter.tipo = tipo;
  }

  const movimientos = await Movimiento.find(filter)
    .sort({ fecha: -1 })
    .lean();

  return Response.json(movimientos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const body = await request.json();
  const movimiento = await Movimiento.create({
    ...body,
    userEmail: session.user.email,
  });

  return Response.json(movimiento, { status: 201 });
}
