import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import GastoFijo from "@/models/GastoFijo";
import Movimiento from "@/models/Movimiento";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const body = await request.json();

  if (body.pagoMes !== undefined && body.pagoAnio !== undefined) {
    const item = await GastoFijo.findOne({ _id: id, userEmail: session.user.email });
    if (!item) return Response.json({ error: "No encontrado" }, { status: 404 });

    const pagoExistente = item.pagos?.find((p: any) => p.mes === body.pagoMes && p.anio === body.pagoAnio);

    if (pagoExistente) {
      // Eliminar pago y su movimiento asociado
      if (pagoExistente.movimientoId) {
        await Movimiento.findByIdAndDelete(pagoExistente.movimientoId);
      }
      const updated = await GastoFijo.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { $pull: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } } },
        { new: true }
      );
      return Response.json(updated);
    } else {
      // Crear Movimiento
      const fechaPago = new Date(body.pagoAnio, body.pagoMes, item.diaVencimiento || 1);
      const mov = await Movimiento.create({
        userEmail: session.user.email,
        tipo: "gasto",
        monto: item.monto,
        moneda: item.moneda,
        tipoCambio: item.tipoCambio,
        montoARS: (item.monto || 0) * (item.tipoCambio || 1),
        descripcion: `Pago: ${item.nombre} (${body.pagoMes + 1}/${body.pagoAnio})`,
        categoria: item.categoria,
        fecha: fechaPago,
      });

      // Agregar pago con el ID del movimiento
      const updated = await GastoFijo.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { $push: { pagos: { mes: body.pagoMes, anio: body.pagoAnio, movimientoId: mov._id } } },
        { new: true }
      );
      return Response.json(updated);
    }
  }

  const gastoFijo = await GastoFijo.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );
  return Response.json(gastoFijo);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const { id } = await params;
  await GastoFijo.findOneAndDelete({ _id: id, userEmail: session.user.email });
  return Response.json({ message: "Eliminado" });
}
