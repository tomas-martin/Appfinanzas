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

  const gastoFijo = await GastoFijo.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    body,
    { new: true }
  );

  if (!gastoFijo) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json(gastoFijo);
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

  const gastoFijo = await GastoFijo.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  });

  if (!gastoFijo) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json({ message: "Eliminado" });
}
