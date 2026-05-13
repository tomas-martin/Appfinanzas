import mongoose, { Schema, models } from "mongoose";

const GastoFijoSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    nombre: { type: String, required: true },
    monto: { type: Number, required: true },
    moneda: { type: String, enum: ["ARS", "USD"], default: "ARS" },
    diaVencimiento: { type: Number, required: true, min: 1, max: 31 },
    categoria: { type: String, required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.GastoFijo ||
  mongoose.model("GastoFijo", GastoFijoSchema);
