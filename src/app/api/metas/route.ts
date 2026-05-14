import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MetaAhorro from "@/models/MetaAhorro";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const metas = await MetaAhorro.find({ userEmail: session.user.email }).sort({ fechaLimite: 1 }).lean();

  return Response.json(metas);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "No autorizado" }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  
  const meta = await MetaAhorro.create({
    ...body,
    userEmail: session.user.email,
  });

  return Response.json(meta, { status: 201 });
}
