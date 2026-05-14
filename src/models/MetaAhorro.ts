import mongoose, { Schema, models } from "mongoose";

const MetaAhorroSchema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    nombre: { type: String, required: true },
    montoObjetivo: { type: Number, required: true },
    fechaLimite: { type: Date, required: true },
    color: { type: String, default: "#6366f1" }, // Indigo default
    montoInicial: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.MetaAhorro || mongoose.model("MetaAhorro", MetaAhorroSchema);
