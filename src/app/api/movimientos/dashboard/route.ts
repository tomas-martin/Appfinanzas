import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movimiento from "@/models/Movimiento";
import GastoFijo from "@/models/GastoFijo";
import Compra from "@/models/Compra";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();
  const userEmail = session.user.email;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Todos los movimientos históricos
  const todosLosMovimientos = await Movimiento.find({ userEmail }).lean();
  
  let balanceHistorico = 0; // El dinero total real que tenés hoy
  let ingresosMes = 0;
  let gastosMes = 0;

  todosLosMovimientos.forEach((m: any) => {
    const monto = m.montoARS || m.monto;
    const fechaMov = new Date(m.fecha);
    
    // Balance Histórico (Todo lo que pasó hasta HOY, incluyendo pagos futuros ya hechos)
    // Pero si el usuario dice "no me bajes la plata", quizás quiere ver el balance del mes.
    // Vamos a calcular el balance histórico pero también los del mes.
    if (m.tipo === "ingreso") {
      balanceHistorico += monto;
      if (fechaMov >= startOfMonth && fechaMov <= endOfMonth) {
        ingresosMes += monto;
      }
    } else {
      balanceHistorico -= monto;
      if (fechaMov >= startOfMonth && fechaMov <= endOfMonth) {
        gastosMes += monto;
      }
    }
  });

  // 2. Obtener gastos fijos activos
  const fijos = await GastoFijo.find({ userEmail, activo: true }).lean();

  // 3. Obtener compras en cuotas pendientes
  const compras = await Compra.find({ userEmail }).lean();
  const cuotasPendientes = compras.reduce((acc: number, c: any) => {
    const restantes = c.cantidadCuotas - (c.cuotasPagadas || 0);
    const unitRate = c.moneda === "USD" ? (c.tipoCambio || 1420) : 1;
    return acc + (restantes * c.montoPorCuota * unitRate);
  }, 0);

  // 4. Últimos movimientos FILTRADOS por el mes actual
  // Esto quita el "Pago Gas (8/2026)" del inicio si estamos en Mayo
  const ultimosMovimientos = await Movimiento.find({ 
      userEmail,
      fecha: { $gte: startOfMonth, $lte: endOfMonth } 
    })
    .sort({ fecha: -1 })
    .limit(10)
    .lean();

  return Response.json({
    balance: balanceHistorico, // Mantenemos el global, pero los de abajo son mensuales
    ingresos: ingresosMes,
    gastos: gastosMes,
    cuotasPendientes,
    proximosVencimientos: fijos,
    ultimosMovimientos
  });
}
