/**
 * Script para importar datos TPY desde los CSVs proporcionados
 * Ejecutar: node scripts/import-tpy-csv-data.js
 * 
 * Este script importa:
 * - ACTIVADAS -> TPY_Client (clientes activos con precios)
 * - DEMOS -> TPY_Demo (demos en estado pausado)
 * - CAJA -> TPY_Transaction (ingresos y egresos)
 * - COBRANZAS -> TPY_Collection (cobranzas mensuales)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quavito79:fTxCH10YJ8FSimQ2@cluster0.wzrxbrq.mongodb.net/sales_management?retryWrites=true&w=majority&appName=Cluster0';

// ==================== SCHEMAS (copiados del backend) ====================

const tpyClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  webName: { type: String, required: true, trim: true },
  domain: { type: String, trim: true },
  demoUrl: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada", "baja"],
    default: "pendiente_demo",
  },
  activationPrice: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  createdDate: { type: Date, default: Date.now },
  activationDate: { type: Date },
  cancellationDate: { type: Date },
  cancellationReason: { type: String, trim: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

const tpyDemoSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  webName: { type: String, required: true, trim: true },
  demoUrl: { type: String, trim: true },
  status: {
    type: String,
    enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada"],
    default: "pendiente_demo",
  },
  activationPrice: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  demoDate: { type: Date, default: Date.now },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

const tpyTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["ingreso", "egreso"], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  month: { type: String }, // YYYY-MM format for filtering
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String },
  paymentMethod: { type: String },
  reference: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: { type: String },
}, { timestamps: true });

const tpySaleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String, required: true },
  clientPhone: { type: String },
  webName: { type: String },
  domain: { type: String },
  status: { type: String, enum: ["pendiente", "web_activada", "cancelada"], default: "pendiente" },
  activationPrice: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  saleDate: { type: Date, default: Date.now },
  activationDate: { type: Date },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: { type: String },
  notes: { type: String },
}, { timestamps: true });

const tpyCollectionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  expectedAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["pendiente", "cobrado", "parcial", "vencido"], default: "pendiente" },
  paidDate: { type: Date },
  dueDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

const TPY_Client = mongoose.model('TPY_Client', tpyClientSchema);
const TPY_Demo = mongoose.model('TPY_Demo', tpyDemoSchema);
const TPY_Transaction = mongoose.model('TPY_Transaction', tpyTransactionSchema);
const TPY_Sale = mongoose.model('TPY_Sale', tpySaleSchema);
const TPY_Collection = mongoose.model('TPY_Collection', tpyCollectionSchema);

// ==================== DATA FROM CSVs ====================

// ACTIVADAS CSV - Clientes activos con precios de activacion
const activadasData = [
  { name: "ROBERTO CUELLO", phone: "1152760697", email: "roberto.cuello@hotmail.com", webName: "Cuello Abogados", domain: "cuelloabogados.tupaginaya.com.ar", demoUrl: "https://cuelloabogados.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-04-23", notes: "CONTRATO ENVIADO" },
  { name: "JAVIER BORDON", phone: "2617018858", email: "javier.bordon@gmail.com", webName: "JRB Construcciones", domain: "jrbconstrucciones.tupaginaya.com.ar", demoUrl: "https://jrbconstrucciones.tupaginaya.com.ar/", activationPrice: 60000, monthlyPrice: 15000, activationDate: "2024-04-22", notes: "CONTRATO ENVIADO" },
  { name: "ROBERTO RAIMONDO", phone: "1123784650", email: "robertoraimondo2013@gmail.com", webName: "Raimondo Hnos Antiguedades", domain: "raimondohnosantiguedades.tupaginaya.com.ar", demoUrl: "https://raimondohnosantiguedades.tupaginaya.com.ar/", activationPrice: 60000, monthlyPrice: 15000, activationDate: "2024-05-14", notes: "CONTRATO ENVIADO" },
  { name: "MATIAS CARAFA", phone: "1125412963", email: "mcarafa@gmail.com", webName: "Matias Carafa Fotografia", domain: "matiascarafafotografia.tupaginaya.com.ar", demoUrl: "https://matiascarafafotografia.tupaginaya.com.ar/", activationPrice: 55000, monthlyPrice: 12500, activationDate: "2024-05-15", notes: "PAGO CON TC" },
  { name: "MATIAS CEPEDA", phone: "1138203696", email: "matias12.cepeda@gmail.com", webName: "Electricista Cepeda", domain: "electricistacepeda.tupaginaya.com.ar", demoUrl: "https://electricistacepeda.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-05-30", notes: "" },
  { name: "SANTIAGO PASINETTI", phone: "1156887475", email: "pasinettiherreria@gmail.com", webName: "Pasinetti Herreria", domain: "passinettiherreria.tupaginaya.com.ar", demoUrl: "https://passinettiherreria.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-07-05", notes: "" },
  { name: "GABRIEL ORELLANA", phone: "1170313723", email: "gorellanaw@gmail.com", webName: "Orellana Pintura", domain: "orellanapintura.tupaginaya.com.ar", demoUrl: "https://orellanapintura.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-07-29", notes: "" },
  { name: "FRANCO GONZALEZ PIRIS", phone: "1161698909", email: "francogpiris@hotmail.com", webName: "Piris Herreria", domain: "pirisherreria.tupaginaya.com.ar", demoUrl: "https://pirisherreria.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-08-26", notes: "" },
  { name: "SAUL SORIA", phone: "1122817171", email: "soriaesaul@gmail.com", webName: "Espiritu Pampero", domain: "espiritupampero.tupaginaya.com.ar", demoUrl: "https://espiritupampero.tupaginaya.com.ar/", activationPrice: 60000, monthlyPrice: 15000, activationDate: "2024-08-27", notes: "" },
  { name: "MAURICIO ABALOS", phone: "1126073730", email: "mauricioabalosok@gmail.com", webName: "Lavanderia Eureka", domain: "lavanderiaeureka.tupaginaya.com.ar", demoUrl: "https://lavanderiaeureka.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-09-27", notes: "" },
  { name: "ARIEL ACEVEDO", phone: "1124851478", email: "tecnico@electronet.com.ar", webName: "Electronet Tecnico", domain: "electronet-tecnicoreparaciones.tupaginaya.com.ar", demoUrl: "https://electronet-tecnicoreparaciones.tupaginaya.com.ar/", activationPrice: 50000, monthlyPrice: 12500, activationDate: "2024-10-04", notes: "" },
  { name: "ROMINA SUAREZ", phone: "1132813756", email: "romy93suarez@gmail.com", webName: "Nail Art by Romi Suarez", domain: "nailartby-romisuarez.tupaginaya.com.ar", demoUrl: "https://nailartby-romisuarez.tupaginaya.com.ar/", activationPrice: 55000, monthlyPrice: 12500, activationDate: "2024-10-12", notes: "" },
  { name: "GONZALO REYNAGA", phone: "1164568568", email: "gonzareyser@gmail.com", webName: "Reynaga Servicios", domain: "reynagaservicios.tupaginaya.com.ar", demoUrl: "https://reynagaservicios.tupaginaya.com.ar/", activationPrice: 65000, monthlyPrice: 12500, activationDate: "2024-10-25", notes: "" },
  { name: "ROCIO YONADI", phone: "1170360116", email: "rocioyonadi5@gmail.com", webName: "Rocio Yonadi Makeup", domain: "rocioyonadi-makeup.tupaginaya.com.ar", demoUrl: "https://rocioyonadi-makeup.tupaginaya.com.ar/", activationPrice: 70000, monthlyPrice: 15000, activationDate: "2024-11-06", notes: "" },
  { name: "GASTON CARDOZO SPIESS", phone: "1127377177", email: "cardozospiess@hotmail.com", webName: "Cardozo Spiess Abogados", domain: "cardozospiess-abogados.tupaginaya.com.ar", demoUrl: "https://cardozospiess-abogados.tupaginaya.com.ar/", activationPrice: 75000, monthlyPrice: 15000, activationDate: "2024-11-08", notes: "" },
  { name: "PATRICIA GUTIERREZ", phone: "1168990505", email: "gimenapuntoyaparte@gmail.com", webName: "Punto y Coma Indumentaria", domain: "puntoycoma-indumentaria.tupaginaya.com.ar", demoUrl: "https://puntoycoma-indumentaria.tupaginaya.com.ar/", activationPrice: 80000, monthlyPrice: 15000, activationDate: "2024-11-15", notes: "" },
  { name: "LUCIANO MACEIRA", phone: "1123976818", email: "lucianomaceira76@gmail.com", webName: "Maceira Refrigeracion", domain: "maceira-refrigeracion.tupaginaya.com.ar", demoUrl: "https://maceira-refrigeracion.tupaginaya.com.ar/", activationPrice: 80000, monthlyPrice: 15000, activationDate: "2025-01-09", notes: "" },
  { name: "LUIS VILLAR", phone: "1123855541", email: "villarluisariel@gmail.com", webName: "Villar Aberturas", domain: "villaraberturas.tupaginaya.com.ar", demoUrl: "https://villaraberturas.tupaginaya.com.ar/", activationPrice: 90000, monthlyPrice: 15000, activationDate: "2025-02-24", notes: "" },
  { name: "MARIA PAULA MONZA", phone: "1140457067", email: "mpaulamonza@hotmail.com", webName: "Monza Kinesiologia", domain: "monza-kinesiologia.tupaginaya.com.ar", demoUrl: "https://monza-kinesiologia.tupaginaya.com.ar/", activationPrice: 95000, monthlyPrice: 15000, activationDate: "2025-03-07", notes: "" },
];

// DEMOS CSV - Demos pausadas
const demosData = [
  { name: "MARIELA", phone: "1128820787", webName: "Por definir", status: "demo_pausada", notes: "CHARLAR EN SEPTIEMBRE" },
  { name: "CARLA PASTORUTTI", phone: "3425372174", email: "carlapastoruttiquiros@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "CHARLAR EN SEPTIEMBRE" },
  { name: "ANDRES LAUTARO CONTRERAS", phone: "1151173653", email: "andreslcontreras@outlook.es", webName: "Por definir", status: "demo_pausada", notes: "POR LA PAGINA ENTRO - VOLVER A LLAMAR MARTES 2 DE JULIO 9 AM" },
  { name: "MARICEL BELEN FERRERO", phone: "3492502695", email: "maricelferrero_18@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "LUNES 14:00 HS" },
  { name: "MILAGROS MENDICINO", phone: "1157697509", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "YAMILA GUTIERREZ", phone: "1125765969", email: "yamila2014gutierrez@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR 11 HS. - 22/7 - A VECES ES EL MARIDO" },
  { name: "JONATHAN FERNANDEZ", phone: "1131679909", email: "jonathan.fernandez.psi@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "ENVIADA POR WHATSAPP" },
  { name: "ALEJANDRA RODRIGUEZ GAMBOA", phone: "1130234013", webName: "Por definir", status: "demo_pausada", notes: "VIERNES 19 A LAS 17 HS" },
  { name: "YANINA RIVEROS", phone: "1126780232", webName: "Por definir", status: "demo_pausada", notes: "LLAMAR JUEVES 18 - 9:30 HS - SEPTIEMBRE VOLVER A LLAMAR" },
  { name: "YESICA AGOSTINA IBARROLA", phone: "1169820977", email: "yessicaagostinaibarrola@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "VIERNES 19/07 A LAS 19 HS." },
  { name: "WALTER ROSALES", phone: "1122525012", email: "wrosales1979@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "JULIO VOLVER A LLAMAR" },
  { name: "SERGIO ALEJANDRO HERRERA", phone: "3815933174", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "LUCIANA FERNANDEZ LLAPUR", phone: "1158609969", email: "lulufernandezllapur@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "JORGE BUSTOS", phone: "3518115440", email: "jl_bustos09@yahoo.com.ar", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "KARINA ALEJANDRA BENITEZ", phone: "1168862016", email: "karinaalejandrabenitez2@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "SABADO 27/07 A LAS 14 HS" },
  { name: "FACUNDO TROTTA", phone: "1126234653", email: "facundotrotta31@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VIERNES 26/07 A LAS 18 HS" },
  { name: "ALEJANDRO DAVID CARCAGNO", phone: "3512069566", email: "davicarcagno@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "RODRIGO LEANDRO YANCE", phone: "3512047977", email: "rodrigo.l.yance@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "SEPTIEMBRE - OCTUBRE LLAMAR" },
  { name: "NAHUEL EZEQUIEL BENITEZ", phone: "3765039618", email: "nahuelbenitez33@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "LUNES 29/07 A LAS 10:30 HS" },
  { name: "EVELYN GIMENEZ", phone: "3874619552", webName: "Por definir", status: "demo_pausada", notes: "RETOMAR CONTACTO MES QUE VIENE POR WPP - FIN DE AGOSTO VOLVER A HABLAR" },
  { name: "GONZALO VARGAS", phone: "1169917920", email: "gonzavargas1990@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "AUGUSTO DANIEL DAVALOS", phone: "3794122125", email: "augustodanieldavalos@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "LO PENSARA - RETOMAR CONTACTO" },
  { name: "LUCIA BELEN ALVAREZ", phone: "1138766697", email: "luciabelenalvarezcba@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VER EN SEPT" },
  { name: "JONATHAN MINO", phone: "1132124117", email: "jonathanezequielmino23@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "PARA OTRO DIA - ENVIAR POR WPP" },
  { name: "YOHANA SOLEDAD SALINAS", phone: "1152825633", email: "yohana.salinas@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "EVELYN SOLEDAD CORDOBA", phone: "1167098135", email: "evesolcordoba@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR EN OCTUBRE" },
  { name: "ELIANA PRESA", phone: "1153500003", email: "elianapresa@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "MARIA BELEN LOZA", phone: "1127649656", email: "belu-loza@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "ENVIADA POR WHATSAPP" },
  { name: "MARIA FLORENCIA SOSA", phone: "3512476818", email: "maria.florencia.sosa@mi.unc.edu.ar", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A CONTACTAR EN SEPTIEMBRE" },
  { name: "LUCIA ISABEL ACOSTA", phone: "3743598870", email: "luisabelacosta@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "LLAMAR EN SEPTIEMBRE" },
  { name: "DARIO CARDOZO", phone: "2996099850", email: "dario_cordozo@outlook.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "PATRICIA TORRES", phone: "2604652949", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "JOSE MARTIN PEREZ", phone: "1126476740", email: "martinluisperez@icloud.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR MIERCOLES 14 14:30 HS." },
  { name: "JULIO FERNANDEZ", phone: "1164816009", email: "juliofernandez.uy@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "AGUSTIN NAHUEL ESPINOSA", phone: "1168377786", email: "espinosaagustinn@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "RETOMAR EN SEPTIEMBRE" },
  { name: "PATRICIA VANESA GIMENEZ", phone: "1162025706", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "YAMILA ANAHI HERRERA", phone: "1133146654", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "YAMILA SOLEDAD MAURE", phone: "2613091632", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "PATRICIA IRENE ANTEQUERA", phone: "3516460068", email: "antequera.patricia@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR SEPTIEMBRE - FEBRERO" },
  { name: "NATALIA", phone: "1162614650", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "SOLEDAD VERA", phone: "1167078676", email: "soledadyesicavera@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VERLO EN SEPTIEMBRE" },
  { name: "NOELIA", phone: "1132089020", email: "sanchezcabrera.noelia@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "QUIERE SABER LOS PRECIOS - ENVIADOS X WPP" },
  { name: "MARIA SOL CORREA SCHTZ", phone: "3876131313", email: "solcorreasch@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR EN SEPTIEMBRE" },
  { name: "ANABEL", phone: "3517522704", email: "anaolivaroggero17@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "ROMINA YAEL ACEVEDO", phone: "1170331155", email: "rominayaela@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "CRISTIAN MAURO", phone: "3516116115", email: "cristian.mauro35@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "RECONTACTAR A FIN DE ANO" },
  { name: "HECTOR", phone: "1159403050", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "AYELEN CARLA ADAN", phone: "3751580633", email: "ayelencarlaadan@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR EN OCTUBRE - ENERO" },
  { name: "ANDRES DELGADO", phone: "1166091679", email: "andresdelgado2412@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "NAHUEL EZEQUIEL BENITEZ 2", phone: "3764169148", email: "nahuelbenitez33@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "LLAMAR EN OCTUBRE" },
  { name: "MAXIMILIANO NICOLAS", phone: "1169168377", email: "maximilianonicolas.96@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "CRISTIAN", phone: "1138992697", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "ROXANA ROMINA LAZARTE", phone: "3855976654", webName: "Por definir", status: "demo_pausada", notes: "SACAR TURNO POR WPP" },
  { name: "DIEGO", phone: "2241406541", email: "diegoperezgagliardi86@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "MELINA SALOMON", phone: "1159696363", email: "melinasalomon.1997@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "ENERO O FEBRERO" },
  { name: "FRANCO EZEQUIEL GONZALEZ", phone: "3875063949", email: "franco.gon05@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A CONTACTAR EN DICIEMBRE" },
  { name: "FABIOLA TAMARA", phone: "1169193765", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "ANTONELLA", phone: "1158506086", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "ROCIO DANIELA PARONI", phone: "3462610717", email: "rocioparoni@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "GERMAN MARTIN ASIS", phone: "1162019379", email: "germanmartinasis@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "VOLVER A LLAMAR EN DICIEMBRE" },
  { name: "FABIANA INES CRUZ", phone: "1139116227", email: "fabycruz09@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "YESICA CINTIA JAIME", phone: "1173628633", email: "yesicaintiajaime@gmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "LUCIA BELEN ALVAREZ 2", phone: "1138766697", email: "lucialvarezc_13@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
  { name: "EVANGELINA JESICA RODRIGUEZ", phone: "3512017654", email: "evanjrodriguez89@hotmail.com", webName: "Por definir", status: "demo_pausada", notes: "" },
];

// CAJA CSV - Transacciones (ingresos y egresos) - Datos de 2026
const cajaData = [
  // Febrero 2026
  { type: "ingreso", category: "Activacion + Suscripcion", description: "ElectroBohemia act + sus", amount: 100000, date: "2026-02-20", clientName: "ElectroBohemia" },
  { type: "ingreso", category: "Activacion + Suscripcion", description: "ReDeGloria act + sus", amount: 65000, date: "2026-02-19", clientName: "ReDeGloria" },
  { type: "ingreso", category: "Activacion + Suscripcion", description: "FerreOnline act + sus", amount: 65000, date: "2026-02-19", clientName: "FerreOnline" },
  { type: "ingreso", category: "Suscripcion", description: "SuenosDeColores sus", amount: 13500, date: "2026-02-23", clientName: "SuenosDeColores" },
  { type: "ingreso", category: "Ampliacion", description: "Ampliacion FerreOnline", amount: 45000, date: "2026-02-24", clientName: "FerreOnline" },
  { type: "ingreso", category: "Activacion", description: "MSE Jose Luis Act", amount: 95000, date: "2026-02-25", clientName: "MSE Jose Luis" },
  { type: "egreso", category: "Anuncios", description: "ANUNCIOS", amount: 60000, date: "2026-02-28" },
  { type: "egreso", category: "Servidor", description: "CloudSv", amount: 293000, date: "2026-02-18" },
  { type: "egreso", category: "Dominio", description: "DominioRey", amount: 8500, date: "2026-02-19" },
  { type: "egreso", category: "Dominio", description: "DominioFerre", amount: 8500, date: "2026-02-20" },
  { type: "egreso", category: "Dominio", description: "DominioElectroB", amount: 8500, date: "2026-02-20" },
  { type: "egreso", category: "Dominio", description: "DominioMSE", amount: 8500, date: "2026-02-25" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-02-25" },
  // Marzo 2026
  { type: "ingreso", category: "Activacion", description: "CATARATASTRASLADOS", amount: 64000, date: "2026-03-03", clientName: "Cataratas Traslados" },
  { type: "ingreso", category: "Activacion", description: "RB DIGITAL", amount: 63000, date: "2026-03-10", clientName: "RB Digital" },
  { type: "ingreso", category: "Suscripcion", description: "ELECTROBOHEMIA", amount: 13802, date: "2026-03-11", clientName: "ElectroBohemia" },
  { type: "ingreso", category: "Suscripcion", description: "SUENOS DE COLORES", amount: 13802, date: "2026-03-11", clientName: "SuenosDeColores" },
  { type: "ingreso", category: "Suscripcion", description: "Cataratas Traslados", amount: 13577, date: "2026-03-11", clientName: "Cataratas Traslados" },
  { type: "ingreso", category: "Activacion", description: "DanielProducciones", amount: 63000, date: "2026-03-14", clientName: "Daniel Producciones" },
  { type: "ingreso", category: "Suscripcion", description: "ReyDeGloria", amount: 20000, date: "2026-03-17", clientName: "ReDeGloria" },
  { type: "ingreso", category: "Activacion", description: "PlasticosHD", amount: 50000, date: "2026-03-18", clientName: "PlasticosHD" },
  { type: "ingreso", category: "Activacion", description: "CleanDM", amount: 50000, date: "2026-03-18", clientName: "CleanDM" },
  { type: "ingreso", category: "Suscripcion", description: "PlasticosHD", amount: 13500, date: "2026-03-18", clientName: "PlasticosHD" },
  { type: "ingreso", category: "Suscripcion", description: "CleanDM", amount: 13500, date: "2026-03-19", clientName: "CleanDM" },
  { type: "ingreso", category: "Activacion", description: "donacionesarg", amount: 63500, date: "2026-03-24", clientName: "Donaciones Arg" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-03-03" },
  { type: "egreso", category: "Dominio", description: "DominioCataratasTraslados", amount: 8500, date: "2026-03-04" },
  { type: "egreso", category: "Dominio", description: "DominioRbDigital", amount: 2400, date: "2026-03-10" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-03-11" },
  { type: "egreso", category: "Dominio", description: "DominioDaniel", amount: 8500, date: "2026-03-14" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-03-14" },
  { type: "egreso", category: "Dominio", description: "DominioPlasticosHD", amount: 8500, date: "2026-03-18" },
  { type: "egreso", category: "Dominio", description: "DominioCleanDM", amount: 8500, date: "2026-03-18" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 100000, date: "2026-03-19" },
  { type: "egreso", category: "Dominio", description: "DominioDonaciones", amount: 4500, date: "2026-03-24" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-03-24" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-03-28" },
  { type: "egreso", category: "Anuncios", description: "ANUNCIOS", amount: 160000, date: "2026-03-30" },
  // Abril 2026
  { type: "ingreso", category: "Activacion", description: "Electricista triny", amount: 63500, date: "2026-04-08", clientName: "Electricista Triny" },
  { type: "ingreso", category: "Activacion", description: "mendozatransfer", amount: 63500, date: "2026-04-01", clientName: "Mendoza Transfer" },
  { type: "ingreso", category: "Activacion", description: "Sol Ramirez Coach", amount: 63500, date: "2026-04-10", clientName: "Sol Ramirez Coach" },
  { type: "ingreso", category: "Suscripcion", description: "Daniel producciones", amount: 13500, date: "2026-04-11", clientName: "Daniel Producciones" },
  { type: "ingreso", category: "Suscripcion", description: "electrobohemia", amount: 13500, date: "2026-04-11", clientName: "ElectroBohemia" },
  { type: "ingreso", category: "Activacion", description: "JARABUS", amount: 63500, date: "2026-04-13", clientName: "Jarabus" },
  { type: "ingreso", category: "Activacion", description: "PlasticosHD", amount: 50000, date: "2026-04-15", clientName: "PlasticosHD" },
  { type: "ingreso", category: "Suscripcion", description: "sus plasticoshd", amount: 13500, date: "2026-04-16", clientName: "PlasticosHD" },
  { type: "ingreso", category: "Activacion", description: "turbolr", amount: 63500, date: "2026-04-16", clientName: "TurboLR" },
  { type: "ingreso", category: "Suscripcion", description: "iglesia Carlos suscrip", amount: 15500, date: "2026-04-21", clientName: "Iglesia Carlos" },
  { type: "ingreso", category: "Activacion", description: "Itema", amount: 90000, date: "2026-04-27", clientName: "Itema" },
  { type: "ingreso", category: "Activacion", description: "aberturasgyg", amount: 87000, date: "2026-04-28", clientName: "Aberturas GYG" },
  { type: "ingreso", category: "Activacion", description: "SonicBoom", amount: 90000, date: "2026-04-29", clientName: "SonicBoom" },
  { type: "egreso", category: "Dominio", description: "mendozatransfer", amount: 8500, date: "2026-04-02" },
  { type: "egreso", category: "Dominio", description: "electritriny", amount: 8500, date: "2026-04-08" },
  { type: "egreso", category: "Dominio", description: "solramirezcoach.com.ar", amount: 8500, date: "2026-04-08" },
  { type: "egreso", category: "Dominio", description: "jarabus.com.ar", amount: 8500, date: "2026-04-13" },
  { type: "egreso", category: "Dominio", description: "PlasticosHD", amount: 8500, date: "2026-04-16" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 150000, date: "2026-04-16" },
  { type: "egreso", category: "Dominio", description: "dominio lrturbo", amount: 8500, date: "2026-01-14" },
  { type: "egreso", category: "Dominio", description: "dominio itema", amount: 8500, date: "2026-04-27" },
  { type: "egreso", category: "Insumos", description: "compra 10 chips", amount: 10000, date: "2026-04-27" },
  { type: "egreso", category: "Dominio", description: "compra dominio", amount: 8500, date: "2026-04-29" },
  { type: "egreso", category: "Anuncios", description: "ANUNCIOS", amount: 150000, date: "2026-04-30" },
  { type: "egreso", category: "Pago Empleado", description: "PAGO BAU", amount: 100000, date: "2026-04-30" },
  // Mayo 2026 (mes actual - transacciones pendientes)
];

// ==================== IMPORT FUNCTIONS ====================

async function importClients() {
  console.log('Importando clientes activos...');
  
  let totalActivaciones = 0;
  
  for (const client of activadasData) {
    const activationDate = new Date(client.activationDate);
    
    const newClient = new TPY_Client({
      name: client.name,
      phone: client.phone,
      email: client.email,
      webName: client.webName,
      domain: client.domain,
      demoUrl: client.demoUrl,
      status: 'web_activada',
      activationPrice: client.activationPrice,
      monthlyPrice: client.monthlyPrice,
      activationDate: activationDate,
      createdDate: activationDate,
      notes: client.notes,
      sellerName: 'VICTORIA'
    });
    
    await newClient.save();
    
    // Crear venta (TPY_Sale) para el cliente
    const sale = new TPY_Sale({
      clientId: newClient._id,
      clientName: newClient.name,
      clientPhone: newClient.phone,
      webName: newClient.webName,
      domain: newClient.domain,
      status: 'web_activada',
      activationPrice: newClient.activationPrice,
      monthlyPrice: newClient.monthlyPrice,
      saleDate: activationDate,
      activationDate: activationDate,
      sellerName: 'VICTORIA'
    });
    await sale.save();
    
    // Crear transaccion de ingreso por activacion
    if (client.activationPrice && client.activationPrice > 0) {
      const month = `${activationDate.getFullYear()}-${String(activationDate.getMonth() + 1).padStart(2, '0')}`;
      
      const transaction = new TPY_Transaction({
        type: "ingreso",
        category: "Activacion Web",
        description: `Activacion web - ${client.name} (${client.webName || client.domain})`,
        amount: client.activationPrice,
        date: activationDate,
        month: month,
        clientId: newClient._id,
        clientName: client.name,
        createdByName: 'Sistema'
      });
      await transaction.save();
      totalActivaciones += client.activationPrice;
    }
  }
  
  console.log(`Se importaron ${activadasData.length} clientes activos`);
  console.log(`Se crearon ${activadasData.length} ventas`);
  console.log(`Total activaciones: $${totalActivaciones.toLocaleString()}`);
}

async function importDemos() {
  console.log('Importando demos...');
  
  for (const demo of demosData) {
    const newDemo = new TPY_Demo({
      name: demo.name,
      phone: demo.phone,
      email: demo.email,
      webName: demo.webName,
      status: demo.status,
      notes: demo.notes,
      sellerName: 'VICTORIA'
    });
    
    await newDemo.save();
  }
  
  console.log(`Se importaron ${demosData.length} demos`);
}

async function importTransactions() {
  console.log('Importando transacciones de caja...');
  
  let totalIngresos = 0;
  let totalEgresos = 0;
  
  for (const tx of cajaData) {
    // Extraer mes en formato YYYY-MM de la fecha
    const txDate = new Date(tx.date);
    const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    
    const newTx = new TPY_Transaction({
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      date: txDate,
      month: month,
      clientName: tx.clientName || null,
      createdByName: 'Sistema'
    });
    
    await newTx.save();
    
    if (tx.type === 'ingreso') {
      totalIngresos += tx.amount;
    } else {
      totalEgresos += tx.amount;
    }
  }
  
  console.log(`Se importaron ${cajaData.length} transacciones`);
  console.log(`Total Ingresos: $${totalIngresos.toLocaleString()}`);
  console.log(`Total Egresos: $${totalEgresos.toLocaleString()}`);
  console.log(`Balance: $${(totalIngresos - totalEgresos).toLocaleString()}`);
}

// ==================== MAIN ====================

async function main() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Limpiar datos existentes
    console.log('\nLimpiando datos TPY existentes...');
    await TPY_Client.deleteMany({});
    await TPY_Demo.deleteMany({});
    await TPY_Transaction.deleteMany({});
    await TPY_Collection.deleteMany({});
    console.log('Datos limpiados');
    
    // Importar datos
    console.log('\n--- IMPORTANDO DATOS ---\n');
    await importClients();
    await importDemos();
    await importTransactions();
    
    console.log('\n--- IMPORTACION COMPLETADA ---');
    console.log(`Clientes: ${activadasData.length}`);
    console.log(`Demos: ${demosData.length}`);
    console.log(`Transacciones: ${cajaData.length}`);
    
  } catch (error) {
    console.error('Error durante la importacion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
  }
}

main();
