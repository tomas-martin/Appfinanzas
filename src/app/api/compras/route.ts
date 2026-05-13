import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Compra from "@/models/Compra";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const compras = await Compra.find({ userId: session.user.id })
    .sort({ fechaInicio: -1 })
    .lean();

  return Response.json(compras);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const body = await request.json();

  // Calculate montoPorCuota if not provided
  if (!body.montoPorCuota && body.montoTotal && body.cantidadCuotas) {
    const interes = body.tasaInteres || 0;
    const totalConInteres = body.montoTotal * (1 + interes / 100);
    body.montoPorCuota = totalConInteres / body.cantidadCuotas;
  }

  const compra = await Compra.create({
    ...body,
    userId: session.user.id,
  });

  return Response.json(compra, { status: 201 });
}
