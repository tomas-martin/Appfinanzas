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

  // Fechas del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Obtener todos los movimientos para el balance total (Histórico)
  const todosLosMovimientos = await Movimiento.find({ userEmail }).lean();
  
  let balance = 0;
  let ingresosMes = 0;
  let gastosMes = 0;

  todosLosMovimientos.forEach((m: any) => {
    const monto = m.montoARS || m.monto;
    const fechaMov = new Date(m.fecha);
    
    // El balance SIEMPRE es histórico (total de plata que tenés)
    if (m.tipo === "ingreso") {
      balance += monto;
      // Solo sumamos al "Ingresos del mes" si está en rango
      if (fechaMov >= startOfMonth && fechaMov <= endOfMonth) {
        ingresosMes += monto;
      }
    } else {
      balance -= monto;
      // Solo sumamos al "Gastos del mes" si está en rango
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

  // 4. Últimos movimientos (Sigue siendo histórico para ver qué pasó recién)
  const ultimosMovimientos = await Movimiento.find({ userEmail })
    .sort({ fecha: -1 })
    .limit(5)
    .lean();

  return Response.json({
    balance,
    ingresos: ingresosMes,
    gastos: gastosMes,
    cuotasPendientes,
    proximosVencimientos: fijos,
    ultimosMovimientos
  });
}
