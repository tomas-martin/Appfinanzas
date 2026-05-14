import mongoose, { Schema, models } from "mongoose";

const PresupuestoSchema = new Schema({
  userEmail: { type: String, required: true, index: true },
  categoria: { type: String, required: true },
  monto: { type: Number, required: true },
  mes: { type: Number, required: true },
  anio: { type: Number, required: true },
}, { timestamps: true });

PresupuestoSchema.index({ userEmail: 1, categoria: 1, mes: 1, anio: 1 }, { unique: true });

export default models.Presupuesto || mongoose.model("Presupuesto", PresupuestoSchema);
