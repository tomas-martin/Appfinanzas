import mongoose, { Schema, models } from "mongoose";

const MovimientoSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    tipo: { type: String, enum: ["gasto", "ingreso"], required: true },
    monto: { type: Number, required: true },
    moneda: { type: String, enum: ["ARS", "USD"], default: "ARS" },
    descripcion: { type: String, required: true },
    categoria: { type: String, required: true },
    fecha: { type: Date, required: true },
  },
  { timestamps: true }
);

export default models.Movimiento ||
  mongoose.model("Movimiento", MovimientoSchema);
