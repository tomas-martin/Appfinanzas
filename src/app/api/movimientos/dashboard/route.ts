import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movimiento from "@/models/Movimiento";
import GastoFijo from "@/models/GastoFijo";
import Compra from "@/models/Compra";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const userEmail = session.user.email;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Obtener movimientos
  const todosLosMovimientos = await Movimiento.find({ userEmail }).lean();
  
  let balanceActual = 0; // Solo lo que pasó hasta el final de este mes
  let ingresosMes = 0;
  let gastosMes = 0;

  todosLosMovimientos.forEach((m: any) => {
    const monto = m.montoARS || m.monto;
    const fechaMov = new Date(m.fecha);
    
    // FILTRO CRÍTICO: Solo sumamos al balance si el movimiento es de HOY o del PASADO
    // Si es un pago de Agosto y estamos en Mayo, NO resta del balance actual.
    if (fechaMov <= endOfMonth) {
      if (m.tipo === "ingreso") {
        balanceActual += monto;
        if (fechaMov >= startOfMonth) {
          ingresosMes += monto;
        }
      } else {
        balanceActual -= monto;
        if (fechaMov >= startOfMonth) {
          gastosMes += monto;
        }
      }
    }
  });

  const fijos = await GastoFijo.find({ userEmail, activo: true }).lean();
  const compras = await Compra.find({ userEmail }).lean();
  const cuotasPendientes = compras.reduce((acc: number, c: any) => {
    const restantes = c.cantidadCuotas - (c.cuotasPagadas || 0);
    const unitRate = c.moneda === "USD" ? (c.tipoCambio || 1420) : 1;
    return acc + (restantes * c.montoPorCuota * unitRate);
  }, 0);

  const ultimosMovimientos = await Movimiento.find({ 
      userEmail,
      fecha: { $gte: startOfMonth, $lte: endOfMonth } 
    })
    .sort({ fecha: -1 })
    .limit(10)
    .lean();

  return Response.json({
    balance: balanceActual,
    ingresos: ingresosMes,
    gastos: gastosMes,
    cuotasPendientes,
    proximosVencimientos: fijos,
    ultimosMovimientos
  });
}
