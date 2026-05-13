import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Compra from "@/models/Compra";

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

  // Custom logic for monthly installment payments
  if (body.pagoMes !== undefined && body.pagoAnio !== undefined) {
    const existing = await Compra.findOne({
      _id: id,
      userEmail: session.user.email,
      "pagos.mes": body.pagoMes,
      "pagos.anio": body.pagoAnio
    });

    if (existing) {
      const compra = await Compra.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { 
          $pull: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } },
          $inc: { cuotasPagadas: -1 }
        },
        { new: true }
      );
      return Response.json(compra);
    } else {
      const compra = await Compra.findOneAndUpdate(
        { _id: id, userEmail: session.user.email },
        { 
          $push: { pagos: { mes: body.pagoMes, anio: body.pagoAnio } },
          $inc: { cuotasPagadas: 1 }
        },
        { new: true }
      );

      // Create Movement
      const Movimiento = (await import("@/models/Movimiento")).default;
      await Movimiento.create({
        userEmail: session.user.email,
        tipo: "gasto",
        monto: compra.montoPorCuota,
        moneda: compra.moneda,
        tipoCambio: compra.tipoCambio,
        montoARS: (compra.montoPorCuota || 0) * (compra.tipoCambio || 1),
        descripcion: `Pago Cuota: ${compra.descripcion} (${body.pagoMes + 1}/${body.pagoAnio})`,
        categoria: "Tarjetas",
        fecha: new Date(),
      });
      return Response.json(compra);
    }
  }

  const compra = await Compra.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );

  if (!compra) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json(compra);
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

  const compra = await Compra.findOneAndDelete({
    _id: id,
    userEmail: session.user.email,
  });

  if (!compra) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json({ message: "Eliminado" });
}
