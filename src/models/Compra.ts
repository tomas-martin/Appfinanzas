import mongoose, { Schema, models } from "mongoose";

const CompraSchema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    descripcion: { type: String, required: true },
    montoTotal: { type: Number, required: true },
    moneda: { type: String, enum: ["ARS", "USD"], default: "ARS" },
    tipoCambio: { type: Number, default: 1 },
    montoARS: { type: Number },
    cantidadCuotas: { type: Number, required: true, min: 1 },
    cuotasPagadas: { type: Number, default: 0 },
    montoPorCuota: { type: Number, required: true },
    tasaInteres: { type: Number, default: 0 },
    tarjeta: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    categoria: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Compra || mongoose.model("Compra", CompraSchema);
