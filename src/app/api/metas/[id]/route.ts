import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MetaAhorro from "@/models/MetaAhorro";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  await MetaAhorro.findOneAndDelete({ _id: id, userEmail: session.user.email });
  return Response.json({ ok: true });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const body = await request.json();
  const meta = await MetaAhorro.findOneAndUpdate(
    { _id: id, userEmail: session.user.email },
    { $set: body },
    { new: true }
  );
  return Response.json(meta);
}
