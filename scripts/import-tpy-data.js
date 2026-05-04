/**
 * Script para importar datos CSV a TuPaginaYa en MongoDB
 * 
 * Uso: MONGODB_URI=<uri> node scripts/import-tpy-data.js
 */

const mongoose = require('mongoose');

// URI de MongoDB desde variable de entorno
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI no definida');
  process.exit(1);
}

// ========================================
// SCHEMAS (igual que en server.js)
// ========================================

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
    default: "pendiente_demo"
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
    default: "pendiente_demo"
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
  category: { type: String, required: true, trim: true },
  concept: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  month: { type: String, required: true, match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"] },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String, trim: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, trim: true },
}, { timestamps: true });

const tpyCollectionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String, required: true, trim: true },
  clientPhone: { type: String, trim: true },
  webName: { type: String, required: true, trim: true },
  domain: { type: String, trim: true },
  month: { type: String, required: true, match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"] },
  expectedAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["pendiente", "pagado", "parcial", "vencido"], default: "pendiente" },
  paymentDate: { type: Date },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, trim: true },
}, { timestamps: true });

// Modelos
const TPY_Client = mongoose.model("TPY_Client", tpyClientSchema);
const TPY_Demo = mongoose.model("TPY_Demo", tpyDemoSchema);
const TPY_Transaction = mongoose.model("TPY_Transaction", tpyTransactionSchema);
const TPY_Collection = mongoose.model("TPY_Collection", tpyCollectionSchema);

// ========================================
// DATOS A IMPORTAR (de los CSVs)
// ========================================

// DEMOS - de GESTION WEBS - DEMOS
const demosData = [
  { demoDate: "2025-02-17", name: "RAMIRO FERNANDEZ", phone: "1123113666", webName: "DEKU PINTURA", demoUrl: "dekupintura.tupaginaya.com.ar", email: "ramirobenjamin828@gmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-19", name: "ISABEL", phone: "1139251494", webName: "MAS SALUD CURSOS", demoUrl: "massalud.tupaginaya.com.ar", email: "massalud66@hotmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-20", name: "GABRIEL ANGELO", phone: "3415806802", webName: "REFUGIO CREATIVO", demoUrl: "refugiocreativo.tupaginaya.com.ar", email: "refugiocreativo2024@gmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-20", name: "Carlos Valdivia Mercado", phone: "56965692422", webName: "Instituto PC Training", demoUrl: "institutopctraining.tupaginaya.com.ar", email: "cvaldivia211@gmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-20", name: "ANDRES RABOSI", phone: "3624625889", webName: "HOSTERIA NIRVANA", demoUrl: "hosteriairvana.tupaginaya.com.ar", email: "hosterianirvana@gmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-23", name: "LAURA", phone: "3492216487", webName: "LAURA INDUMENTARIA", demoUrl: "lauraindumentaria.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-02-24", name: "Juan Cardozo", phone: "1151178494", webName: "JECETV", demoUrl: "jecetv.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-02-24", name: "Manuel Chena", phone: "3424296808", webName: "ITEMA Cursos Automotrices", demoUrl: "itema.tupaginaya.com.ar", email: "manuchena@hotmail.com", status: "demo_pausada" },
  { demoDate: "2025-02-24", name: "MATIAS LLANES", phone: "3704087878", webName: "MATIAS TRAINER", demoUrl: "matiastrainer.tupaginaya.com.ar", email: "matiasllanes1@outlook.com", status: "demo_pausada" },
  { demoDate: "2025-02-27", name: "Elias", phone: "1138541993", webName: "Elias Construcciones", demoUrl: "eliasconstrucciones.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-02-27", name: "Willy", phone: "1168913206", webName: "Mini Fletes Willy", demoUrl: "minifleteswilly.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-02-28", name: "Matias", phone: "1162876476", webName: "GM COMEX", demoUrl: "gmcomex.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-02-28", name: "Arturo", phone: "3454945389", webName: "Impregnados Litoral", demoUrl: "impregnadoslitoral.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-01", name: "Gustavo", phone: "2645843105", webName: "Diario Popular SJ", demoUrl: "diariopopular.tupaginaya.com.ar", email: "gustavosanchez1203@gmail.com", status: "demo_pausada" },
  { demoDate: "2025-03-02", name: "Lorena", phone: "1133980947", webName: "JJprotecciones", demoUrl: "jjproteccion.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-02", name: "Yacare", phone: "2216002445", webName: "GR instalaciones", demoUrl: "grinstalaciones.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-02", name: "Alberti", phone: "1123364476", webName: "Refrigeracion Alberti", demoUrl: "refrigeracionalberti.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-03", name: "Megan Jaz", phone: "1128639024", webName: "Megan Jaz", demoUrl: "meganjaz.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-06", name: "Raul", phone: "1128828330", webName: "UnDesafioGourmet", demoUrl: "undesafiogourmet.tupaginaya.com.ar", status: "demo_pausada" },
  { demoDate: "2025-03-06", name: "Seguros Matjom", phone: "1164108146", webName: "Seguros Matjom", demoUrl: "matjomseguros.tupaginaya.com.ar", status: "demo_pausada" },
];

// CLIENTES ACTIVADOS - de GESTION WEBS - ACTIVADAS
const clientsData = [
  { createdDate: "2025-02-18", name: "RAFAEL CARLOS REYNOSO", phone: "2323354805", webName: "IGLESIA REY DE GLORIA", domain: "IGLESIAREYDEGLORIA.COM.AR", email: "chyanoozono@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-02-19", name: "NUSSBAUM PABLO ANDRES", phone: "3455431884", webName: "FERRE ONLINE", domain: "FERREONLINE.COM.AR", email: "Ferreteriapyg2025@gmail.com", activationPrice: 95000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-02-20", name: "NICOLAS RABIALES", phone: "1126827414", webName: "ELECTRO BOHEMIA", domain: "ELECTROBOHEMIA.COM.AR", email: "Bohemiamayorista1928@gmail.com", activationPrice: 85000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-02-23", name: "ARIEL RICARDO SEQUEIRA", phone: "1126812615", webName: "SUENOS DE COLORES", domain: "PTE", email: "Ninaluez40@gmail.com", activationPrice: 95000, monthlyPrice: 15000, status: "pendiente_web" },
  { createdDate: "2025-02-25", name: "JOSE LUIS LABANDEIRA", phone: "1151047769", webName: "MOV DE SUELOS EZEIZA", domain: "MSEZEIZA.COM.AR", email: "Labandeira0@gmail.com", activationPrice: 95000, monthlyPrice: 0, status: "baja" },
  { createdDate: "2025-03-03", name: "Diego Raul Rosa Garcia", phone: "3764726460", webName: "Cataratas Traslados", domain: "receptivocataratasluz.com.ar", email: "diegogarcia33867@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-03-10", name: "Reinaldo Benitez", phone: "2213500446", webName: "RB DIGITAL", domain: "RBDIGITAL.ONLINE", email: "r38207744@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-03-14", name: "Omar Oscar Daniel Paez", phone: "1137036278", webName: "Daniel Eventos", domain: "danieleventos.com.ar", email: "gonzalopaez0709@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-03-18", name: "ADRIAN EDUARDO CHRISTON", phone: "1160124001", webName: "PLASTICOS HD", domain: "PLASTICOSHD.COM.AR", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-03-18", name: "CRUZ ERICKSON", phone: "1162152800", webName: "CLEAN DM LIMPIEZA", domain: "CLEANDMLIMPIEZA.COM.AR", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-03-24", name: "Adrianno Ferronato", phone: "3731436935", webName: "Donaciones Arg", domain: "donacionesarg.click", activationPrice: 50000, monthlyPrice: 15000, status: "baja" },
  { createdDate: "2025-04-01", name: "Kevin Hector Manuel Lopez", phone: "2617692451", webName: "Mendoza Transfer", domain: "mendozatransfer.com.ar", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-08", name: "Cesar Fabian Trindades", phone: "1130437363", webName: "Electricista Triny", domain: "electricistatriny.com.ar", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-10", name: "Sol Ramirez", phone: "3548504321", webName: "Sol Coach", domain: "solramirezcoach.com.ar", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-13", name: "Javier Antonio Jara", phone: "3517404524", webName: "Jara Bus", domain: "jarabus.com.ar", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-16", name: "Leandro", phone: "", webName: "Turbos LR", domain: "turboslr.com.ar", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-27", name: "Manuel Alberto Chena", phone: "3424296808", webName: "Itema", domain: "itemacursos.com.ar", activationPrice: 75000, monthlyPrice: 15000, status: "web_activada" },
  { createdDate: "2025-04-28", name: "Carlos Gonzalo Etchart", phone: "2241472227", webName: "GyGAberturas", domain: "aberturasgyg.com.ar", activationPrice: 75000, monthlyPrice: 12500, status: "web_activada" },
  { createdDate: "2025-04-29", name: "Maximiliano Sonic Boom", phone: "3832464812", webName: "SonicBoom", domain: "sonicboomstore.com.ar", activationPrice: 75000, monthlyPrice: 12500, status: "web_activada" },
];

// COBRANZAS - de GESTION WEBS - COBRANZAS (pagos mensuales)
const collectionsData = [
  // Febrero
  { clientName: "IGLESIA REY DE GLORIA", webName: "IGLESIA REY DE GLORIA", month: "2025-02", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "FERRE ONLINE", webName: "FERRE ONLINE", month: "2025-02", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "ELECTRO BOHEMIA", webName: "ELECTRO BOHEMIA", month: "2025-02", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "SUENOS DE COLORES", webName: "SUENOS DE COLORES", month: "2025-02", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "MOV DE SUELOS EZEIZA", webName: "MOV DE SUELOS EZEIZA", month: "2025-02", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  // Marzo
  { clientName: "IGLESIA REY DE GLORIA", webName: "IGLESIA REY DE GLORIA", month: "2025-03", expectedAmount: 20000, paidAmount: 20000, status: "pagado" },
  { clientName: "FERRE ONLINE", webName: "FERRE ONLINE", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "ELECTRO BOHEMIA", webName: "ELECTRO BOHEMIA", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "SUENOS DE COLORES", webName: "SUENOS DE COLORES", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "MOV DE SUELOS EZEIZA", webName: "MOV DE SUELOS EZEIZA", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "Cataratas Traslados", webName: "Cataratas Traslados", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "RB DIGITAL", webName: "RB DIGITAL", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "Daniel Eventos", webName: "Daniel Eventos", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "PLASTICOS HD", webName: "PLASTICOS HD", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "CLEAN DM LIMPIEZA", webName: "CLEAN DM LIMPIEZA", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "Donaciones Arg", webName: "Donaciones Arg", month: "2025-03", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  // Abril
  { clientName: "IGLESIA REY DE GLORIA", webName: "IGLESIA REY DE GLORIA", month: "2025-04", expectedAmount: 10000, paidAmount: 10000, status: "pagado" },
  { clientName: "FERRE ONLINE", webName: "FERRE ONLINE", month: "2025-04", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "ELECTRO BOHEMIA", webName: "ELECTRO BOHEMIA", month: "2025-04", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "SUENOS DE COLORES", webName: "SUENOS DE COLORES", month: "2025-04", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "MOV DE SUELOS EZEIZA", webName: "MOV DE SUELOS EZEIZA", month: "2025-04", expectedAmount: 17000, paidAmount: 17000, status: "pagado" },
  // Mayo
  { clientName: "IGLESIA REY DE GLORIA", webName: "IGLESIA REY DE GLORIA", month: "2025-05", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "FERRE ONLINE", webName: "FERRE ONLINE", month: "2025-05", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "ELECTRO BOHEMIA", webName: "ELECTRO BOHEMIA", month: "2025-05", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "SUENOS DE COLORES", webName: "SUENOS DE COLORES", month: "2025-05", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
  { clientName: "MOV DE SUELOS EZEIZA", webName: "MOV DE SUELOS EZEIZA", month: "2025-05", expectedAmount: 15000, paidAmount: 15000, status: "pagado" },
];

// TRANSACCIONES DE CAJA - de GESTION WEBS - CAJA
const transactionsData = [
  // Ingresos Febrero
  { type: "ingreso", date: "2025-02-20", category: "Activacion + Suscripcion", concept: "ElectroBohemia act + sus", amount: 100000, month: "2025-02" },
  { type: "ingreso", date: "2025-02-19", category: "Activacion + Suscripcion", concept: "ReDeGloria act + sus", amount: 65000, month: "2025-02" },
  { type: "ingreso", date: "2025-02-19", category: "Activacion + Suscripcion", concept: "FerreOnline act + sus", amount: 65000, month: "2025-02" },
  { type: "ingreso", date: "2025-02-23", category: "Suscripcion", concept: "SuenosDeColores sus", amount: 13500, month: "2025-02" },
  { type: "ingreso", date: "2025-02-24", category: "Ampliacion", concept: "Ampliacion FerreOnline", amount: 45000, month: "2025-02" },
  { type: "ingreso", date: "2025-02-25", category: "Activacion", concept: "MSE Jose Luis Act", amount: 95000, month: "2025-02" },
  // Egresos Febrero
  { type: "egreso", date: "2025-02-28", category: "Anuncios", concept: "ANUNCIOS", amount: 60000, month: "2025-02" },
  { type: "egreso", date: "2025-02-18", category: "Hosting", concept: "CloudSv", amount: 293000, month: "2025-02" },
  { type: "egreso", date: "2025-02-19", category: "Dominio", concept: "DominioRey", amount: 8500, month: "2025-02" },
  { type: "egreso", date: "2025-02-20", category: "Dominio", concept: "DominioFerre", amount: 8500, month: "2025-02" },
  { type: "egreso", date: "2025-02-20", category: "Dominio", concept: "DominioElectroB", amount: 8500, month: "2025-02" },
  { type: "egreso", date: "2025-02-25", category: "Dominio", concept: "DominioMSE", amount: 8500, month: "2025-02" },
  { type: "egreso", date: "2025-02-25", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-02" },
  // Ingresos Marzo
  { type: "ingreso", date: "2025-03-03", category: "Activacion", concept: "CATARATASTRASLADOS", amount: 64000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-10", category: "Activacion", concept: "RB DIGITAL", amount: 63000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-11", category: "Suscripcion", concept: "ELECTROBOHEMIA", amount: 13802, month: "2025-03" },
  { type: "ingreso", date: "2025-03-11", category: "Suscripcion", concept: "SUENOS DE COLORES", amount: 13802, month: "2025-03" },
  { type: "ingreso", date: "2025-03-11", category: "Suscripcion", concept: "Cataratas Traslados", amount: 13577, month: "2025-03" },
  { type: "ingreso", date: "2025-03-14", category: "Activacion", concept: "DanielProducciones", amount: 63000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-17", category: "Suscripcion", concept: "ReyDeGloria", amount: 20000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-18", category: "Activacion", concept: "PlasticosHD", amount: 50000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-18", category: "Activacion", concept: "CleanDM", amount: 50000, month: "2025-03" },
  { type: "ingreso", date: "2025-03-18", category: "Suscripcion", concept: "PlasticosHD", amount: 13500, month: "2025-03" },
  { type: "ingreso", date: "2025-03-19", category: "Suscripcion", concept: "CleanDM", amount: 13500, month: "2025-03" },
  { type: "ingreso", date: "2025-03-24", category: "Activacion", concept: "donacionesarg", amount: 63500, month: "2025-03" },
  // Egresos Marzo
  { type: "egreso", date: "2025-03-03", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-03" },
  { type: "egreso", date: "2025-03-04", category: "Dominio", concept: "DominioCataratasTraslados", amount: 8500, month: "2025-03" },
  { type: "egreso", date: "2025-03-10", category: "Dominio", concept: "DominioRbDigital", amount: 2400, month: "2025-03" },
  { type: "egreso", date: "2025-03-11", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-03" },
  { type: "egreso", date: "2025-03-14", category: "Dominio", concept: "DominioDaniel", amount: 8500, month: "2025-03" },
  { type: "egreso", date: "2025-03-14", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-03" },
  { type: "egreso", date: "2025-03-18", category: "Dominio", concept: "DominioPlasticosHD", amount: 8500, month: "2025-03" },
  { type: "egreso", date: "2025-03-18", category: "Dominio", concept: "DominioCleanDM", amount: 8500, month: "2025-03" },
  { type: "egreso", date: "2025-03-19", category: "Comision", concept: "PagoBau", amount: 100000, month: "2025-03" },
  { type: "egreso", date: "2025-03-24", category: "Dominio", concept: "DominioDonaciones", amount: 4500, month: "2025-03" },
  { type: "egreso", date: "2025-03-24", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-03" },
  { type: "egreso", date: "2025-03-28", category: "Comision", concept: "PagoBau", amount: 50000, month: "2025-03" },
  { type: "egreso", date: "2025-03-30", category: "Anuncios", concept: "ANUNCIOS", amount: 160000, month: "2025-03" },
  // Ingresos Abril
  { type: "ingreso", date: "2025-04-08", category: "Activacion", concept: "Electricista triny", amount: 63500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-01", category: "Activacion", concept: "mendozatransfer", amount: 63500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-10", category: "Activacion", concept: "Sol Ramirez Coach", amount: 63500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-11", category: "Suscripcion", concept: "Daniel producciones", amount: 13500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-11", category: "Suscripcion", concept: "electrobohemia", amount: 13500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-13", category: "Activacion", concept: "JARABUS", amount: 63500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-15", category: "Activacion", concept: "PlasticosHD", amount: 50000, month: "2025-04" },
  { type: "ingreso", date: "2025-04-16", category: "Suscripcion", concept: "sus plasticoshd", amount: 13500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-16", category: "Activacion", concept: "turbolr", amount: 63500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-21", category: "Suscripcion", concept: "iglesia Carlos suscrip", amount: 15500, month: "2025-04" },
  { type: "ingreso", date: "2025-04-27", category: "Activacion", concept: "Itema", amount: 90000, month: "2025-04" },
  { type: "ingreso", date: "2025-04-28", category: "Activacion", concept: "aberturasgyg", amount: 87000, month: "2025-04" },
  { type: "ingreso", date: "2025-04-29", category: "Activacion", concept: "SonicBoom", amount: 90000, month: "2025-04" },
  // Egresos Abril
  { type: "egreso", date: "2025-04-02", category: "Dominio", concept: "mendozatransfer", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-08", category: "Dominio", concept: "electritriny", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-08", category: "Dominio", concept: "solramirezcoach.com.ar", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-13", category: "Dominio", concept: "jarabus.com.ar", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-16", category: "Dominio", concept: "PlasticosHD", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-16", category: "Comision", concept: "PagoBau", amount: 150000, month: "2025-04" },
  { type: "egreso", date: "2025-04-14", category: "Dominio", concept: "dominio lrturbo", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-27", category: "Dominio", concept: "dominio itema", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-27", category: "Insumos", concept: "compra 10 chips", amount: 10000, month: "2025-04" },
  { type: "egreso", date: "2025-04-29", category: "Dominio", concept: "compra dominio", amount: 8500, month: "2025-04" },
  { type: "egreso", date: "2025-04-30", category: "Anuncios", concept: "ANUNCIOS", amount: 150000, month: "2025-04" },
  { type: "egreso", date: "2025-04-30", category: "Comision", concept: "PAGO BAU", amount: 100000, month: "2025-04" },
];

// ========================================
// FUNCION DE IMPORTACION
// ========================================

async function importData() {
  console.log("=== INICIANDO IMPORTACION TPY ===\n");
  
  try {
    // Conectar a MongoDB
    console.log("Conectando a MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Conectado exitosamente!\n");
    
    // Limpiar colecciones existentes (opcional)
    console.log("Limpiando colecciones existentes...");
    await TPY_Client.deleteMany({});
    await TPY_Demo.deleteMany({});
    await TPY_Transaction.deleteMany({});
    await TPY_Collection.deleteMany({});
    console.log("Colecciones limpiadas.\n");
    
    // Importar Clientes
    console.log("Importando clientes...");
    const clientsToInsert = clientsData.map(c => ({
      ...c,
      createdDate: new Date(c.createdDate),
      activationDate: c.status === "web_activada" ? new Date(c.createdDate) : undefined,
      phone: c.phone || "N/A",
    }));
    const insertedClients = await TPY_Client.insertMany(clientsToInsert);
    console.log(`  -> ${insertedClients.length} clientes importados`);
    
    // Crear mapa de clientes por webName para relacionar cobranzas
    const clientMap = {};
    insertedClients.forEach(c => {
      clientMap[c.webName.toUpperCase()] = c;
    });
    
    // Importar Demos
    console.log("Importando demos...");
    const demosToInsert = demosData.map(d => ({
      ...d,
      demoDate: new Date(d.demoDate),
    }));
    const insertedDemos = await TPY_Demo.insertMany(demosToInsert);
    console.log(`  -> ${insertedDemos.length} demos importadas`);
    
    // Importar Transacciones
    console.log("Importando transacciones de caja...");
    const transactionsToInsert = transactionsData.map(t => ({
      ...t,
      date: new Date(t.date),
    }));
    const insertedTransactions = await TPY_Transaction.insertMany(transactionsToInsert);
    console.log(`  -> ${insertedTransactions.length} transacciones importadas`);
    
    // Importar Cobranzas (relacionando con clientes)
    console.log("Importando cobranzas...");
    const collectionsToInsert = collectionsData.map(c => {
      const client = clientMap[c.webName.toUpperCase()];
      return {
        ...c,
        clientId: client?._id,
        paymentDate: c.status === "pagado" ? new Date() : undefined,
      };
    });
    const insertedCollections = await TPY_Collection.insertMany(collectionsToInsert);
    console.log(`  -> ${insertedCollections.length} cobranzas importadas`);
    
    // Resumen final
    console.log("\n=== RESUMEN DE IMPORTACION ===");
    console.log(`Clientes:      ${insertedClients.length}`);
    console.log(`Demos:         ${insertedDemos.length}`);
    console.log(`Transacciones: ${insertedTransactions.length}`);
    console.log(`Cobranzas:     ${insertedCollections.length}`);
    console.log("\nImportacion completada exitosamente!");
    
  } catch (error) {
    console.error("\nERROR durante la importacion:", error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\nConexion cerrada.");
  }
}

// Ejecutar
importData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
