import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Movimiento from "@/models/Movimiento";

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

  const movimiento = await Movimiento.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    body,
    { new: true }
  );

  if (!movimiento) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json(movimiento);
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

  const movimiento = await Movimiento.findOneAndDelete({
    _id: id,
    userEmail: session.user.email,
  });

  if (!movimiento) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  return Response.json({ message: "Eliminado" });
}
