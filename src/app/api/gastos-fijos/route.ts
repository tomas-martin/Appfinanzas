import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import GastoFijo from "@/models/GastoFijo";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const gastosFijos = await GastoFijo.find({ userEmail: session.user.email })
    .sort({ diaVencimiento: 1 })
    .lean();

  return Response.json(gastosFijos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await dbConnect();

  const body = await request.json();
  const gastoFijo = await GastoFijo.create({
    ...body,
    userEmail: session.user.email,
  });

  return Response.json(gastoFijo, { status: 201 });
}
