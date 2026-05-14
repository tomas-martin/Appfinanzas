import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movimiento from "@/models/Movimiento";
import GastoFijo from "@/models/GastoFijo";
import Compra from "@/models/Compra";
import MetaAhorro from "@/models/MetaAhorro";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const userEmail = session.user.email;

  // Obtener mes y año de la URL o usar el actual por defecto
  const searchParams = request.nextUrl.searchParams;
  const mesParam = searchParams.get("mes");
  const anioParam = searchParams.get("anio");

  const now = new Date();
  const mes = mesParam !== null ? Number(mesParam) : now.getMonth();
  const anio = anioParam !== null ? Number(anioParam) : now.getFullYear();

  const startOfMonth = new Date(anio, mes, 1);
  const endOfMonth = new Date(anio, mes + 1, 0, 23, 59, 59);

  // 1. Movimientos para el balance y totales
  const todosLosMovimientos = await Movimiento.find({ userEmail }).lean();
  
  let balanceHistoricoFiltrado = 0; 
  let ingresosMes = 0;
  let gastosMes = 0;

  todosLosMovimientos.forEach((m: any) => {
    const monto = m.montoARS || m.monto;
    const fechaMov = new Date(m.fecha);
    
    // Balance filtrado: suma todo lo que pasó hasta el final del mes seleccionado
    if (fechaMov <= endOfMonth) {
      if (m.tipo === "ingreso") {
        balanceHistoricoFiltrado += monto;
        if (fechaMov >= startOfMonth) {
          ingresosMes += monto;
        }
      } else {
        balanceHistoricoFiltrado -= monto;
        if (fechaMov >= startOfMonth) {
          gastosMes += monto;
        }
      }
    }
  });

  // 2. Gastos fijos activos
  const fijos = await GastoFijo.find({ userEmail, activo: true }).lean();

  // 3. Compras pendientes
  const compras = await Compra.find({ userEmail }).lean();
  const cuotasPendientes = compras.reduce((acc: number, c: any) => {
    const restantes = c.cantidadCuotas - (c.cuotasPagadas || 0);
    const unitRate = c.moneda === "USD" ? (c.tipoCambio || 1420) : 1;
    return acc + (restantes * c.montoPorCuota * unitRate);
  }, 0);

  // 4. Metas de ahorro
  const metasCount = await MetaAhorro.countDocuments({ userEmail });

  // 4. Movimientos del mes seleccionado
  const ultimosMovimientos = await Movimiento.find({ 
      userEmail,
      fecha: { $gte: startOfMonth, $lte: endOfMonth } 
    })
    .sort({ fecha: -1 })
    .limit(10)
    .lean();

  return Response.json({
    balance: balanceHistoricoFiltrado,
    ingresos: ingresosMes,
    gastos: gastosMes,
    cuotasPendientes,
    proximosVencimientos: fijos,
    ultimosMovimientos,
    metasCount,
    mesActual: mes,
    anioActual: anio
  });
}
