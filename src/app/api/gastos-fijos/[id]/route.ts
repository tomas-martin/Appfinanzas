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

  if (body.pagoMes !== undefined && body.pagoAnio !== undefined) {
    const existing = await GastoFijo.findOne({
      _id: id,
      userEmail: session.user.email,
      "pagos.mes": body.pagoMes,
      "pagos.anio": body.pagoAnio
    });

    if (existing) {
      const gf = await GastoFijo.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { $pull: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } } },
        { new: true }
      );
      // Remove corresponding movement (simplified: based on description)
      const Movimiento = (await import("@/models/Movimiento")).default;
      await Movimiento.deleteOne({
        userEmail: session.user.email,
        descripcion: `Pago: ${gf.nombre} (${body.pagoMes + 1}/${body.pagoAnio})`
      });
      return Response.json(gf);
    } else {
      const gf = await GastoFijo.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { $push: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } } },
        { new: true }
      );

      // Create Movement with specific month date
      const fechaPago = new Date(body.pagoAnio, body.pagoMes, gf.diaVencimiento || 1);
      const Movimiento = (await import("@/models/Movimiento")).default;
      await Movimiento.create({
        userEmail: session.user.email,
        tipo: "gasto",
        monto: gf.monto,
        moneda: gf.moneda,
        tipoCambio: gf.tipoCambio,
        montoARS: (gf.monto || 0) * (gf.tipoCambio || 1),
        descripcion: `Pago: ${gf.nombre} (${body.pagoMes + 1}/${body.pagoAnio})`,
        categoria: gf.categoria,
        fecha: fechaPago,
      });
      return Response.json(gf);
    }
  }

  const gastoFijo = await GastoFijo.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );

  return Response.json(gastoFijo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const { id } = await params;
  const gastoFijo = await GastoFijo.findOneAndDelete({ _id: id, userEmail: session.user.email });
  return Response.json({ message: "Eliminado" });
}
