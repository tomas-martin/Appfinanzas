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

  // 1. Obtener todos los movimientos para el balance total
  const todosLosMovimientos = await Movimiento.find({ userEmail }).lean();
  
  let balance = 0;
  let ingresos = 0;
  let gastos = 0;

  todosLosMovimientos.forEach((m: any) => {
    const monto = m.montoARS || m.monto;
    if (m.tipo === "ingreso") {
      balance += monto;
      ingresos += monto;
    } else {
      balance -= monto;
      gastos += monto;
    }
  });

  // 2. Obtener gastos fijos activos
  const fijos = await GastoFijo.find({ userEmail, activo: true }).lean();

  // 3. Obtener compras en cuotas pendientes
  const compras = await Compra.find({ userEmail }).lean();
  const cuotasPendientes = compras.reduce((acc: number, c: any) => {
    const restantes = c.cantidadCuotas - c.cuotasPagadas;
    return acc + (restantes * c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1));
  }, 0);

  // 4. Últimos 5 movimientos
  const ultimosMovimientos = await Movimiento.find({ userEmail })
    .sort({ fecha: -1 })
    .limit(5)
    .lean();

  return Response.json({
    balance,
    ingresos,
    gastos,
    cuotasPendientes,
    proximosVencimientos: fijos,
    ultimosMovimientos
  });
}
