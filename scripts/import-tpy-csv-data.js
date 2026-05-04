/**
 * Script para importar datos REALES de TuPaginaYa desde los CSVs
 * Ejecutar: node scripts/import-tpy-csv-data.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quavito79:fTxCH10YJ8FSimQ2@cluster0.wzrxbrq.mongodb.net/sales_management?retryWrites=true&w=majority&appName=Cluster0';

// ==================== SCHEMAS ====================

const tpyClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  webName: { type: String },
  domain: { type: String },
  demoUrl: { type: String },
  status: { type: String, enum: ["demo_pendiente", "demo_enviada", "web_pendiente", "web_activada", "web_pausada", "cliente_baja"], default: "demo_pendiente" },
  activationPrice: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  activationDate: { type: Date },
  createdDate: { type: Date, default: Date.now },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: { type: String },
  notes: { type: String },
}, { timestamps: true });

const tpyDemoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  webName: { type: String },
  demoUrl: { type: String },
  status: { type: String, enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada"], default: "demo_pausada" },
  activationPrice: { type: Number, default: 0 },
  monthlyPrice: { type: Number, default: 0 },
  createdDate: { type: Date, default: Date.now },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: { type: String },
  notes: { type: String },
}, { timestamps: true });

const tpyTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["ingreso", "egreso"], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  month: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "TPY_Client" },
  clientName: { type: String },
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
  sellerName: { type: String },
}, { timestamps: true });

const TPY_Client = mongoose.model('TPY_Client', tpyClientSchema);
const TPY_Demo = mongoose.model('TPY_Demo', tpyDemoSchema);
const TPY_Transaction = mongoose.model('TPY_Transaction', tpyTransactionSchema);
const TPY_Sale = mongoose.model('TPY_Sale', tpySaleSchema);

// ==================== DATOS REALES DE LOS CSVs ====================

// ACTIVADAS CSV - 19 Clientes REALES
const activadasData = [
  { date: "2026-02-18", name: "RAFAEL CARLOS REYNOSO", phone: "2323354805", webName: "IGLESIA REY DE GLORIA", domain: "IGLESIAREYDEGLORIA.COM.AR", email: "chyanoozono@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-02-19", name: "NUSSBAUM PABLO ANDRES", phone: "3455431884", webName: "FERRE ONLINE", domain: "FERREONLINE.COM.AR", email: "Ferreteriapyg2025@gmail.com", activationPrice: 95000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-02-20", name: "NICOLAS RABIALES", phone: "1126827414", webName: "ELECTRO BOHEMIA", domain: "ELECTROBOHEMIA.COM.AR", email: "Bohemiamayorista1928@gmail.com", activationPrice: 85000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-02-23", name: "ARIEL RICARDO SEQUEIRA", phone: "1126812615", webName: "SUEÑOS DE COLORES", domain: "PTE", email: "Ninaluez40@gmail.com", activationPrice: 95000, monthlyPrice: 15000, status: "web_pendiente", notes: "PTE PAGO" },
  { date: "2026-02-25", name: "JOSE LUIS LABANDEIRA", phone: "1151047769", webName: "MOV DE SUELOS EZEIZA", domain: "MSEZEIZA.COM.AR", email: "Labandeira0@gmail.com", activationPrice: 95000, monthlyPrice: 0, status: "cliente_baja", notes: "BAJA" },
  { date: "2026-03-03", name: "Diego Raul Rosa Garcia", phone: "3764726460", webName: "Cataratas Traslados", domain: "receptivocataratasluz.com.ar", email: "diegogarcia33867@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-03-10", name: "Reinaldo Benitez", phone: "2213500446", webName: "RB DIGITAL", domain: "RBDIGITAL.ONLINE", email: "r38207744@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-03-14", name: "Omar Oscar Daniel Paez", phone: "1137036278", webName: "Daniel Eventos", domain: "danieleventos.com.ar", email: "gonzalopaez0709@gmail.com", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-03-18", name: "ADRIAN EDUARDO CHRISTON", phone: "1160124001", webName: "PLASTICOS HD", domain: "PLASTICOSHD.COM.AR", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-03-18", name: "CRUZ ERICKSON", phone: "1162152800", webName: "CLEAN DM LIMPIEZA", domain: "CLEANDMLIMPIEZA.COM.AR", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-03-24", name: "Adrianno Ferronato", phone: "3731436935", webName: "Donaciones Arg", domain: "donacionesarg.click", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "cliente_baja", notes: "BAJA POR FRAUDE" },
  { date: "2026-04-01", name: "Kevin Hector Manuel Lopez", phone: "2617692451", webName: "Mendoza Transfer", domain: "mendozatransfer.com.ar", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-08", name: "Cesar Fabian Trindades", phone: "1130437363", webName: "Electricista Triny", domain: "electricistatriny.com.ar", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-10", name: "Sol Ramirez", phone: "5493548504321", webName: "Sol Coach", domain: "solramirezcoach.com.ar", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-13", name: "Javier Antonio Jara", phone: "3517404524", webName: "Jara Bus", domain: "jarabus.com.ar", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-16", name: "Leandro", phone: "", webName: "Turbos LR", domain: "turboslr.com.ar", email: "", activationPrice: 50000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-27", name: "Manuel Alberto Chena", phone: "3424296808", webName: "Itema", domain: "itemacursos.com.ar", email: "", activationPrice: 75000, monthlyPrice: 15000, status: "web_activada" },
  { date: "2026-04-28", name: "Carlos Gonzalo Etchart", phone: "2241472227", webName: "GyG Aberturas", domain: "aberturasgyg.com.ar", email: "", activationPrice: 75000, monthlyPrice: 12500, status: "web_activada" },
  { date: "2026-04-29", name: "Maximiliano Sonic Boom", phone: "3832464812", webName: "Sonic Boom", domain: "sonicboomstore.com.ar", email: "", activationPrice: 75000, monthlyPrice: 12500, status: "web_activada" },
];

// DEMOS CSV - 64 Demos REALES pausadas
const demosData = [
  { date: "2026-02-17", name: "RAMIRO FERNANDEZ", phone: "1123113666", webName: "DEKU PINTURA", demoUrl: "dekupintura.tupaginaya.com.ar", email: "ramirobenjamin828@gmail.com" },
  { date: "2026-02-19", name: "ISABEL", phone: "1139251494", webName: "MAS SALUD CURSOS", demoUrl: "massalud.tupaginaya.com.ar", email: "massalud66@hotmail.com" },
  { date: "2026-02-20", name: "GABRIEL ANGELO", phone: "3415806802", webName: "REFUGIO CREATIVO", demoUrl: "refugiocreativo.tupaginaya.com.ar", email: "refugiocreativo2024@gmail.com" },
  { date: "2026-02-20", name: "Carlos Valdivia Mercado", phone: "56965692422", webName: "Instituto PC Training", demoUrl: "institutopctraining.tupaginaya.com.ar", email: "cvaldivia211@gmail.com" },
  { date: "2026-02-20", name: "ANDRES RABOSI", phone: "3624625889", webName: "HOSTERIA NIRVANA", demoUrl: "hosteriairvana.tupaginaya.com.ar", email: "hosterianirvana@gmail.com" },
  { date: "2026-02-23", name: "LAURA", phone: "3492216487", webName: "LAURA INDUMENTARIA", demoUrl: "lauraindumentaria.tupaginaya.com.ar", email: "" },
  { date: "2026-02-24", name: "Juan Cardozo", phone: "1151178494", webName: "JECETV", demoUrl: "jecetv.tupaginaya.com.ar", email: "" },
  { date: "2026-02-24", name: "Manuel Chena", phone: "3424296808", webName: "ITEMA Cursos Automotrices", demoUrl: "itema.tupaginaya.com.ar", email: "manuchena@hotmail.com" },
  { date: "2026-02-24", name: "MATIAS LLANES", phone: "3704087878", webName: "MATIAS TRAINER", demoUrl: "matiastrainer.tupaginaya.com.ar", email: "matiasllanes1@outlook.com" },
  { date: "2026-02-27", name: "Elias", phone: "1138541993", webName: "Elias Construcciones", demoUrl: "eliasconstrucciones.tupaginaya.com.ar", email: "" },
  { date: "2026-02-27", name: "Willy", phone: "1168913206", webName: "Mini Fletes Willy", demoUrl: "minifleteswilly.tupaginaya.com.ar", email: "" },
  { date: "2026-02-28", name: "Matias", phone: "1162876476", webName: "GM COMEX", demoUrl: "gmcomex.tupaginaya.com.ar", email: "" },
  { date: "2026-02-28", name: "Arturo", phone: "3454945389", webName: "Impregnados Litoral", demoUrl: "impregnadoslitoral.tupaginaya.com.ar", email: "" },
  { date: "2026-03-01", name: "Gustavo", phone: "2645843105", webName: "Diario Popular SJ", demoUrl: "diariopopular.tupaginaya.com.ar", email: "gustavosanchez1203@gmail.com" },
  { date: "2026-03-02", name: "Lorena", phone: "1133980947", webName: "JJprotecciones", demoUrl: "jjproteccion.tupaginaya.com.ar", email: "" },
  { date: "2026-03-02", name: "Yacare", phone: "2216002445", webName: "GR instalaciones", demoUrl: "grinstalaciones.tupaginaya.com.ar", email: "" },
  { date: "2026-03-02", name: "Alberti", phone: "1123364476", webName: "Refrigeracion Alberti", demoUrl: "refrigeracionalberti.tupaginaya.com.ar", email: "" },
  { date: "2026-03-03", name: "Megan Jaz", phone: "1128639024", webName: "Megan Jaz", demoUrl: "meganjaz.tupaginaya.com.ar", email: "" },
  { date: "2026-03-03", name: "Construcciones Quintana", phone: "2216702733", webName: "Construcciones Quintana", demoUrl: "https://tusitiowebya.github.io/demoquintanas/", email: "" },
  { date: "2026-03-03", name: "Claudia Acosta", phone: "", webName: "Refugio Zen", demoUrl: "refugiozen.tupaginaya.com.ar", email: "" },
  { date: "2026-03-06", name: "Raul", phone: "1128828330", webName: "UnDesafioGourmet", demoUrl: "undesafiogourmet.tupaginaya.com.ar", email: "" },
  { date: "2026-03-06", name: "Seguros Matjom", phone: "1164108146", webName: "Seguros Matjom", demoUrl: "matjomseguros.tupaginaya.com.ar", email: "" },
  { date: "2026-03-07", name: "Joel Orlando", phone: "5491169916339", webName: "Durlok S.A", demoUrl: "joelorlandodurlocks.tupaginaya.com.ar", email: "" },
  { date: "2026-03-07", name: "Estetica Lalash", phone: "5493434707391", webName: "Estetica Lalash", demoUrl: "http://lalalash.tupaginaya.com.ar/", email: "" },
  { date: "2026-03-07", name: "Antonio Acosta", phone: "1124521942", webName: "LyB", demoUrl: "lyblimpieza.tupaginaya.com.ar", email: "briandamian233@gmail.com" },
  { date: "2026-03-07", name: "David Lahoz Martinez", phone: "1132956863", webName: "TheMuebles", demoUrl: "themuebles.tupaginaya.com.ar", email: "" },
  { date: "2026-03-07", name: "Javier Iglesias", phone: "1160342764", webName: "Cimes Los Hermanos", demoUrl: "http://agualoshermanos.tupaginaya.com.ar/", email: "" },
  { date: "2026-03-11", name: "Pablo", phone: "1127336783", webName: "Plan Gastro", demoUrl: "http://plangastro.tupaginaya.com.ar", email: "" },
  { date: "2026-03-16", name: "Joaquin", phone: "3625487196", webName: "Veterinaria Martin", demoUrl: "veterinariamartin.tupaginaya.com.ar", email: "" },
  { date: "2026-03-20", name: "Marcel", phone: "5491176059204", webName: "MN Eventos", demoUrl: "https://tusitiowebya.github.io/demomneventos/", email: "" },
  { date: "2026-03-20", name: "Fernando Herrera", phone: "5493804781670", webName: "Tegno Refrigeracion", demoUrl: "https://tusitiowebya.github.io/demotegnorefrigeracion/", email: "" },
  { date: "2026-03-20", name: "LavaderoSplash", phone: "5491156999400", webName: "LavaderoSplash", demoUrl: "https://tusitiowebya.github.io/demolavaderosplash/", email: "" },
  { date: "2026-03-23", name: "Leo", phone: "5492996295763", webName: "JleoConstrucciones", demoUrl: "jlconstrucciones.tupaginaya.com.ar", email: "" },
  { date: "2026-03-23", name: "Damian Oscar", phone: "5493541225479", webName: "Frosttech clima y energia", demoUrl: "frosttech.tupaginaya.com.ar", email: "" },
  { date: "2026-03-23", name: "Alex Torales", phone: "5491128942070", webName: "TheGarrissonVinoteca", demoUrl: "garrison.tupaginaya.com.ar", email: "" },
  { date: "2026-03-24", name: "Victoria Martinez", phone: "", webName: "Victoria Martinez Servicios Inmobiliarios", demoUrl: "https://tusitiowebya.github.io/demovictoriamartinez/", email: "" },
  { date: "2026-04-03", name: "Sabores de la Tata", phone: "", webName: "Sabores de la Tata", demoUrl: "https://tusitiowebya.github.io/demosaboresdelatata/", email: "" },
  { date: "2026-04-09", name: "Sol Ramires", phone: "", webName: "Sol Coach", demoUrl: "https://tusitiowebya.github.io/demosolcoach/", email: "" },
  { date: "2026-04-09", name: "Walter Ariel Cogno", phone: "", webName: "Narubaby", demoUrl: "https://tusitiowebya.github.io/demonarubaby/", email: "" },
  { date: "2026-04-10", name: "NaturalGreen", phone: "5491132699452", webName: "NaturalGreen", demoUrl: "https://tusitiowebya.github.io/demonaturalgreen/", email: "" },
  { date: "2026-04-10", name: "Turismo Silver", phone: "1151429746", webName: "Turismo Silver", demoUrl: "https://tusitiowebya.github.io/demoturismosilver/", email: "" },
  { date: "2026-04-11", name: "Espacio Verde", phone: "1123952850", webName: "Espacio Verde", demoUrl: "https://tusitiowebya.github.io/demoespacioverde/", email: "" },
  { date: "2026-04-11", name: "Leandro", phone: "", webName: "Turbos LR", demoUrl: "https://tusitiowebya.github.io/demoturboslr/", email: "" },
  { date: "2026-04-16", name: "Nicolas Correa", phone: "", webName: "Cercos Electricos NC", demoUrl: "https://tusitiowebya.github.io/democercosnc/", email: "" },
  { date: "2026-04-17", name: "Luis", phone: "5493813382103", webName: "TopAccesorios", demoUrl: "https://tusitiowebya.github.io/demotop/", email: "" },
  { date: "2026-04-17", name: "CarCenterHS", phone: "1138251168", webName: "CarCenterHS", demoUrl: "https://tusitiowebya.github.io/democarcenterhs/", email: "" },
  { date: "2026-04-17", name: "Victoria Albornoz", phone: "", webName: "BurletesVyK", demoUrl: "https://tusitiowebya.github.io/demoburletes/", email: "" },
  { date: "2026-04-18", name: "Maggie Selzer", phone: "1151104171", webName: "PsicologaMaggie", demoUrl: "https://tusitiowebya.github.io/demopsicologamaggie/", email: "" },
  { date: "2026-04-20", name: "Lopez", phone: "1155846870", webName: "Fletes Lopez", demoUrl: "https://tusitiowebya.github.io/demofleteslopez/", email: "" },
  { date: "2026-04-20", name: "Hector Guillermo", phone: "", webName: "HGB Refrigeracion", demoUrl: "https://tusitiowebya.github.io/demohgb", email: "" },
  { date: "2026-04-21", name: "Dulce Zaira", phone: "", webName: "Metales Zaira", demoUrl: "https://tusitiowebya.github.io/demometaleszaira/", email: "" },
  { date: "2026-04-21", name: "Ivan Rojas", phone: "1123864671", webName: "AlquiSeason", demoUrl: "https://tusitiowebya.github.io/demoalqui/", email: "" },
  { date: "2026-04-21", name: "AMAF Soluciones Tecnicas", phone: "5492246508672", webName: "AMAF Soluciones Tecnicas", demoUrl: "https://tusitiowebya.github.io/demoamafst/", email: "" },
  { date: "2026-04-21", name: "Hogar Fibra", phone: "5491169604170", webName: "Hogar Fibra", demoUrl: "https://tusitiowebya.github.io/demofibrahogar/", email: "" },
  { date: "2026-04-23", name: "Beto Perez Righentini", phone: "1130567295", webName: "ConeBean", demoUrl: "https://tusitiowebya.github.io/democonebeam/", email: "" },
  { date: "2026-04-23", name: "Gonzalo", phone: "1167659070", webName: "Viva la Pepa", demoUrl: "https://tusitiowebya.github.io/demovivalapepa/", email: "" },
  { date: "2026-04-23", name: "Ian Luca", phone: "1129203354301", webName: "TeleComunicaciones", demoUrl: "https://tusitiowebya.github.io/demotelecom/", email: "" },
  { date: "2026-04-27", name: "Marcelo Soria", phone: "5493512053949", webName: "Marcelo Inmobiliaria", demoUrl: "https://tusitiowebya.github.io/demomarceloinmo/", email: "" },
  { date: "2026-04-28", name: "Alejandra Madril", phone: "5492234373732", webName: "Residencia Francisco", demoUrl: "residenciafrancisco.tupaginaya.com.ar", email: "" },
  { date: "2026-04-28", name: "TarotDC", phone: "5491123255500", webName: "TarotDC", demoUrl: "tarotdc.tupaginaya.com.ar", email: "" },
  { date: "2026-04-28", name: "L@lo", phone: "5493876639255", webName: "TVDigital", demoUrl: "tvdigital.tupaginaya.com.ar", email: "" },
  { date: "2026-04-28", name: "DNdiggit", phone: "5492964669153", webName: "DNdiggit", demoUrl: "dndiggit.tupaginaya.com.ar", email: "" },
  { date: "2026-04-28", name: "Fabian Bogado", phone: "5491156350158", webName: "Muebleria Renacer", demoUrl: "muebleriarenacer.tupaginaya.com.ar", email: "" },
  { date: "2026-04-28", name: "SonicBoom", phone: "5493832464812", webName: "SonicBoom", demoUrl: "sonicboom.tupaginaya.com.ar", email: "" },
];

// CAJA CSV - Transacciones REALES (Ingresos: $1,515,681 / Egresos: $1,465,900 / Balance: $49,781)
const cajaData = [
  // FEBRERO 2026 - INGRESOS
  { type: "ingreso", category: "Activacion + Suscripcion", description: "ElectroBohemia act + sus", amount: 100000, date: "2026-02-20", clientName: "NICOLAS RABIALES" },
  { type: "ingreso", category: "Activacion + Suscripcion", description: "ReDeGloria act + sus", amount: 65000, date: "2026-02-19", clientName: "RAFAEL CARLOS REYNOSO" },
  { type: "ingreso", category: "Activacion + Suscripcion", description: "FerreOnline act + sus", amount: 65000, date: "2026-02-19", clientName: "NUSSBAUM PABLO ANDRES" },
  { type: "ingreso", category: "Suscripcion", description: "SueñosDeColores sus", amount: 13500, date: "2026-02-23", clientName: "ARIEL RICARDO SEQUEIRA" },
  { type: "ingreso", category: "Ampliacion", description: "Ampliacion FerreOnline", amount: 45000, date: "2026-02-24", clientName: "NUSSBAUM PABLO ANDRES" },
  { type: "ingreso", category: "Activacion", description: "MSE Jose Luis Act", amount: 95000, date: "2026-02-25", clientName: "JOSE LUIS LABANDEIRA" },
  // FEBRERO 2026 - EGRESOS
  { type: "egreso", category: "Anuncios", description: "ANUNCIOS", amount: 60000, date: "2026-02-28" },
  { type: "egreso", category: "Servidor", description: "CloudSv", amount: 293000, date: "2026-02-18" },
  { type: "egreso", category: "Dominio", description: "DominioRey", amount: 8500, date: "2026-02-19" },
  { type: "egreso", category: "Dominio", description: "DominioFerre", amount: 8500, date: "2026-02-20" },
  { type: "egreso", category: "Dominio", description: "DominioElectroB", amount: 8500, date: "2026-02-20" },
  { type: "egreso", category: "Dominio", description: "DominioMSE", amount: 8500, date: "2026-02-25" },
  { type: "egreso", category: "Pago Empleado", description: "PagoBau", amount: 50000, date: "2026-02-25" },
  // MARZO 2026 - INGRESOS
  { type: "ingreso", category: "Activacion", description: "CATARATAS TRASLADOS", amount: 64000, date: "2026-03-03", clientName: "Diego Raul Rosa Garcia" },
  { type: "ingreso", category: "Activacion", description: "RB DIGITAL", amount: 63000, date: "2026-03-10", clientName: "Reinaldo Benitez" },
  { type: "ingreso", category: "Suscripcion", description: "ELECTROBOHEMIA", amount: 13802, date: "2026-03-11", clientName: "NICOLAS RABIALES" },
  { type: "ingreso", category: "Suscripcion", description: "SUEÑOS DE COLORES", amount: 13802, date: "2026-03-11", clientName: "ARIEL RICARDO SEQUEIRA" },
  { type: "ingreso", category: "Suscripcion", description: "Cataratas Traslados", amount: 13577, date: "2026-03-11", clientName: "Diego Raul Rosa Garcia" },
  { type: "ingreso", category: "Activacion", description: "DanielProducciones", amount: 63000, date: "2026-03-14", clientName: "Omar Oscar Daniel Paez" },
  { type: "ingreso", category: "Suscripcion", description: "ReyDeGloria", amount: 20000, date: "2026-03-17", clientName: "RAFAEL CARLOS REYNOSO" },
  { type: "ingreso", category: "Activacion", description: "PlasticosHD", amount: 50000, date: "2026-03-18", clientName: "ADRIAN EDUARDO CHRISTON" },
  { type: "ingreso", category: "Activacion", description: "CleanDM", amount: 50000, date: "2026-03-18", clientName: "CRUZ ERICKSON" },
  { type: "ingreso", category: "Suscripcion", description: "PlasticosHD", amount: 13500, date: "2026-03-18", clientName: "ADRIAN EDUARDO CHRISTON" },
  { type: "ingreso", category: "Suscripcion", description: "CleanDM", amount: 13500, date: "2026-03-19", clientName: "CRUZ ERICKSON" },
  { type: "ingreso", category: "Activacion", description: "donacionesarg", amount: 63500, date: "2026-03-24", clientName: "Adrianno Ferronato" },
  // MARZO 2026 - EGRESOS
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
  // ABRIL 2026 - INGRESOS
  { type: "ingreso", category: "Activacion", description: "Electricista triny", amount: 63500, date: "2026-04-08", clientName: "Cesar Fabian Trindades" },
  { type: "ingreso", category: "Activacion", description: "mendozatransfer", amount: 63500, date: "2026-04-01", clientName: "Kevin Hector Manuel Lopez" },
  { type: "ingreso", category: "Activacion", description: "Sol Ramirez Coach", amount: 63500, date: "2026-04-10", clientName: "Sol Ramirez" },
  { type: "ingreso", category: "Suscripcion", description: "Daniel producciones", amount: 13500, date: "2026-04-11", clientName: "Omar Oscar Daniel Paez" },
  { type: "ingreso", category: "Suscripcion", description: "electrobohemia", amount: 13500, date: "2026-04-11", clientName: "NICOLAS RABIALES" },
  { type: "ingreso", category: "Activacion", description: "JARABUS", amount: 63500, date: "2026-04-13", clientName: "Javier Antonio Jara" },
  { type: "ingreso", category: "Activacion", description: "PlasticosHD", amount: 50000, date: "2026-04-15", clientName: "ADRIAN EDUARDO CHRISTON" },
  { type: "ingreso", category: "Suscripcion", description: "sus plasticoshd", amount: 13500, date: "2026-04-16", clientName: "ADRIAN EDUARDO CHRISTON" },
  { type: "ingreso", category: "Activacion", description: "turbolr", amount: 63500, date: "2026-04-16", clientName: "Leandro" },
  { type: "ingreso", category: "Suscripcion", description: "iglesia Carlos suscrip", amount: 15500, date: "2026-04-21", clientName: "RAFAEL CARLOS REYNOSO" },
  { type: "ingreso", category: "Activacion", description: "Itema", amount: 90000, date: "2026-04-27", clientName: "Manuel Alberto Chena" },
  { type: "ingreso", category: "Activacion", description: "aberturasgyg", amount: 87000, date: "2026-04-28", clientName: "Carlos Gonzalo Etchart" },
  { type: "ingreso", category: "Activacion", description: "SonicBoom", amount: 90000, date: "2026-04-29", clientName: "Maximiliano Sonic Boom" },
  // ABRIL 2026 - EGRESOS
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
];

// ==================== IMPORT FUNCTIONS ====================

async function importClients() {
  console.log('Importando clientes REALES del CSV ACTIVADAS...');
  
  let clientesActivos = 0;
  
  for (const client of activadasData) {
    const activationDate = new Date(client.date);
    
    const newClient = new TPY_Client({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      webName: client.webName,
      domain: client.domain,
      status: client.status,
      activationPrice: client.activationPrice,
      monthlyPrice: client.monthlyPrice,
      activationDate: activationDate,
      createdDate: activationDate,
      notes: client.notes || '',
      sellerName: 'VICTORIA'
    });
    
    await newClient.save();
    
    // Crear venta solo si esta activada
    if (client.status === 'web_activada') {
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
      clientesActivos++;
    }
  }
  
  console.log(`Clientes importados: ${activadasData.length}`);
  console.log(`Ventas activas creadas: ${clientesActivos}`);
}

async function importDemos() {
  console.log('Importando demos REALES del CSV DEMOS...');
  
  for (const demo of demosData) {
    const newDemo = new TPY_Demo({
      name: demo.name || 'Sin nombre',
      phone: demo.phone || '',
      email: demo.email || '',
      webName: demo.webName,
      demoUrl: demo.demoUrl,
      status: 'demo_pausada',
      createdDate: new Date(demo.date),
      sellerName: 'VICTORIA'
    });
    
    await newDemo.save();
  }
  
  console.log(`Demos importadas: ${demosData.length}`);
}

async function importTransactions() {
  console.log('Importando transacciones REALES del CSV CAJA...');
  
  let totalIngresos = 0;
  let totalEgresos = 0;
  
  for (const tx of cajaData) {
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
    
    if (tx.type === "ingreso") {
      totalIngresos += tx.amount;
    } else {
      totalEgresos += tx.amount;
    }
  }
  
  console.log(`Transacciones importadas: ${cajaData.length}`);
  console.log(`Total Ingresos: $${totalIngresos.toLocaleString()}`);
  console.log(`Total Egresos: $${totalEgresos.toLocaleString()}`);
  console.log(`Balance: $${(totalIngresos - totalEgresos).toLocaleString()}`);
}

async function clearExistingData() {
  console.log('Limpiando datos TPY existentes...');
  await TPY_Client.deleteMany({});
  await TPY_Demo.deleteMany({});
  await TPY_Transaction.deleteMany({});
  await TPY_Sale.deleteMany({});
  console.log('Datos TPY eliminados');
}

async function main() {
  try {
    console.log('===========================================');
    console.log('IMPORTACION DE DATOS REALES DE TuPaginaYa');
    console.log('===========================================\n');
    
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado!\n');
    
    await clearExistingData();
    console.log('');
    
    await importClients();
    console.log('');
    
    await importDemos();
    console.log('');
    
    await importTransactions();
    
    console.log('\n===========================================');
    console.log('IMPORTACION COMPLETADA EXITOSAMENTE');
    console.log('===========================================');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
