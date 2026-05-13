import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Compra from "@/models/Compra";
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
    const item = await Compra.findOne({ _id: id, userEmail: session.user.email });
    if (!item) return Response.json({ error: "No encontrado" }, { status: 404 });

    const pagoExistente = item.pagos?.find((p: any) => p.mes === body.pagoMes && p.anio === body.pagoAnio);

    if (pagoExistente) {
      if (pagoExistente.movimientoId) {
        await Movimiento.findByIdAndDelete(pagoExistente.movimientoId);
      }
      const updated = await Compra.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { 
          $pull: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } },
          $inc: { cuotasPagadas: -1 }
        },
        { new: true }
      );
      return Response.json(updated);
    } else {
      const fechaPago = new Date(body.pagoAnio, body.pagoMes, item.diaVencimiento || 10);
      const mov = await Movimiento.create({
        userEmail: session.user.email,
        tipo: "gasto",
        monto: item.montoPorCuota,
        moneda: item.moneda,
        tipoCambio: item.tipoCambio,
        montoARS: (item.montoPorCuota || 0) * (item.tipoCambio || 1),
        descripcion: `Pago Cuota: ${item.descripcion} (${body.pagoMes + 1}/${body.pagoAnio})`,
        categoria: "Tarjetas",
        fecha: fechaPago,
      });

      const updated = await Compra.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { 
          $push: { pagos: { mes: body.pagoMes, anio: body.pagoAnio, movimientoId: mov._id } },
          $inc: { cuotasPagadas: 1 }
        },
        { new: true }
      );
      return Response.json(updated);
    }
  }

  const compra = await Compra.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );
  return Response.json(compra);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const { id } = await params;
  await Compra.findOneAndDelete({ _id: id, userEmail: session.user.email });
  return Response.json({ message: "Eliminado" });
}
