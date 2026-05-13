import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import GastoFijo from "@/models/GastoFijo";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await request.json();

  const gastoFijo = await GastoFijo.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );

  if (gastoFijo && body.ultimoPago) {
    const Movimiento = (await import("@/models/Movimiento")).default;
    await Movimiento.create({
      userEmail: session.user.email,
      tipo: "gasto",
      monto: gastoFijo.monto,
      moneda: gastoFijo.moneda,
      tipoCambio: gastoFijo.tipoCambio,
      montoARS: (gastoFijo.monto || 0) * (gastoFijo.tipoCambio || 1),
      descripcion: `Pago: ${gastoFijo.nombre}`,
      categoria: gastoFijo.categoria,
      fecha: new Date(),
    });
  }

  if (!gastoFijo) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json(gastoFijo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const gastoFijo = await GastoFijo.findOneAndDelete({
    _id: id,
    userEmail: session.user.email,
  });

  if (!gastoFijo) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json({ message: "Eliminado" });
}
