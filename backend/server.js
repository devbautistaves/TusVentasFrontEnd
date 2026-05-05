const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()
const axios = require('axios')
const nodemailer = require('nodemailer');
const authenticateToken = require("./middleware/auth")


const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Firebase deshabilitado - usamos almacenamiento local en VPS
let bucket = null;
console.log('Almacenamiento local VPS configurado. Los archivos se guardaran en /uploads/');



const app = express()
const PORT = 3000

const CHAT_ID = '-1002813962725'; // tu chat_id

async function enviarMensajeTelegram(texto) {
  try {
    if (!process.env.TELEGRAM_TOKEN) {
      return; // Silenciosamente saltar si no hay token
    }
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: texto,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Error enviando mensaje de Telegram:', error.message);
    // No propagar el error para no afectar el endpoint
  }
}

// Configuracion de nodemailer para enviar emails
let transporter = null;
try {
  if (process.env.EMAIL_SMTP && process.env.PASSWORD_SMTP) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_SMTP,
        pass: process.env.PASSWORD_SMTP,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verificar la conexion al iniciar
    transporter.verify(function(error, success) {
      if (error) {
        console.error('Error verificando conexion SMTP:', error.message);
        console.error('Detalles del error SMTP:', error);
      } else {
        console.log('Servidor SMTP listo para enviar emails');
      }
    });
    
    console.log('Nodemailer configurado correctamente con:', process.env.EMAIL_SMTP);
  } else {
    console.warn('EMAIL_SMTP o PASSWORD_SMTP no configurados. Las notificaciones por email estaran deshabilitadas.');
    console.warn('EMAIL_SMTP:', process.env.EMAIL_SMTP ? 'configurado' : 'NO configurado');
    console.warn('PASSWORD_SMTP:', process.env.PASSWORD_SMTP ? 'configurado' : 'NO configurado');
  }
} catch (error) {
  console.error('Error configurando nodemailer:', error);
}

async function enviarEmailNuevaVenta(sale, seller, plan) {
  try {
    console.log('=== INICIO enviarEmailNuevaVenta ===');
    console.log('Sale ID:', sale._id);
    console.log('Seller:', seller?.name);
    console.log('Plan:', plan?.name);
    
    // Verificar que el transporter este configurado
    if (!transporter) {
      console.log('ERROR: Email transporter no configurado. Saltando envio de email de nueva venta.');
      return;
    }
    console.log('Transporter OK');

    const User = mongoose.model('User');

    // Buscar admins y usuarios de soporte activos
    const recipients = await User.find({
      role: { $in: ['admin', 'support'] },
      isActive: true
    });

    console.log('Recipients encontrados:', recipients.length);
    recipients.forEach(r => console.log(`  - ${r.name} (${r.role}): ${r.email}`));

    if (recipients.length === 0) {
      console.log('No hay admins ni soporte para notificar');
      return;
    }
    
    console.log(`Enviando email de nueva venta a ${recipients.length} usuario(s) (admins y soporte) en paralelo...`);

    // Filtrar recipients con email y enviar en paralelo
    const validRecipients = recipients.filter(r => r.email);
    
    const generateEmailHtml = (recipientName) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #f59e0b; margin: 0;">TusVentas</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f9fa;">
          <h2 style="color: #1a1a2e;">Hola ${recipientName},</h2>
          <p style="font-size: 16px; color: #333;">Se ha registrado una nueva venta en el sistema:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #1a1a2e;">Detalles de la venta</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;"><strong>Plan:</strong></td><td style="padding: 8px 0;">${plan.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Precio:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #10b981;">$${plan.price}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Vendedor:</strong></td><td style="padding: 8px 0;">${seller.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Comision:</strong></td><td style="padding: 8px 0;">$${sale.commission}</td></tr>
            </table>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1a1a2e;">Datos del cliente</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;"><strong>Nombre:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.email || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Telefono:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>DNI:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.dni}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Direccion:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.address.street} ${sale.customerInfo.address.number}, ${sale.customerInfo.address.city}, ${sale.customerInfo.address.province}</td></tr>
              ${sale.customerInfo.address.entreCalles ? `<tr><td style="padding: 8px 0; color: #666;"><strong>Entre calles:</strong></td><td style="padding: 8px 0;">${sale.customerInfo.address.entreCalles}</td></tr>` : ''}
            </table>
            ${sale.customerInfo.address.googleMapsLink ? `<p style="margin-top: 15px;"><a href="${sale.customerInfo.address.googleMapsLink}" style="color: #3b82f6;">Ver ubicacion en Google Maps</a></p>` : ''}
          </div>
          ${sale.customerInfo.emergencyContact?.name ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Contacto de emergencia</h4>
            <p style="margin: 0;"><strong>Nombre:</strong> ${sale.customerInfo.emergencyContact.name}</p>
            <p style="margin: 0;"><strong>Telefono:</strong> ${sale.customerInfo.emergencyContact.phone || 'No especificado'}</p>
          </div>
          ` : ''}
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://grupojv.tusventas.digital" style="display:inline-block; padding:12px 30px; background-color:#f59e0b; color:#1a1a2e; text-decoration:none; border-radius:6px; font-weight: bold;">Ver en la plataforma</a>
          </div>
        </div>
        <div style="background-color: #1a1a2e; padding: 15px; text-align: center;">
          <small style="color: #888;">Este mensaje fue enviado automaticamente por el sistema TusVentas.</small>
        </div>
      </div>
    `;

    // Enviar en paralelo (max 5 a la vez)
    const results = await Promise.allSettled(
      validRecipients.map(recipient => 
        transporter.sendMail({
          from: `"TusVentas" <${process.env.EMAIL_SMTP}>`,
          to: recipient.email,
          subject: `Nueva venta registrada: ${plan.name}`,
          html: generateEmailHtml(recipient.name)
        })
      )
    );

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        console.log(`Email de nueva venta enviado a ${validRecipients[idx].email}`);
      } else {
        console.error(`Error enviando email a ${validRecipients[idx].email}:`, result.reason?.message);
      }
    });

  } catch (error) {
    console.error('Error enviando email de nueva venta:', error.message);
  }
}

// Funcion para enviar email de nuevo lead asignado al vendedor
async function enviarEmailNuevoLead(lead, seller, assignedBy) {
  try {
    if (!transporter) {
      console.log('Email transporter no configurado. Saltando envio de email de nuevo lead.');
      return;
    }

    if (!seller.email) {
      console.log('El vendedor no tiene email configurado');
      return;
    }

    console.log(`Enviando email de nuevo lead a ${seller.email}...`);

    const priorityLabels = {
      baja: "Baja",
      media: "Media",
      alta: "Alta",
      urgente: "Urgente"
    };

    const priorityColors = {
      baja: "#6b7280",
      media: "#3b82f6",
      alta: "#f59e0b",
      urgente: "#ef4444"
    };

    await transporter.sendMail({
      from: `"TusVentas" <${process.env.EMAIL_SMTP}>`,
      to: seller.email,
      subject: `Nuevo lead asignado: ${lead.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          
          <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
            <h1 style="color: #f59e0b; margin: 0;">TusVentas</h1>
          </div>

          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #1a1a2e;">Hola ${seller.name},</h2>
            
            <p style="font-size: 16px; color: #333;">
              Se te ha asignado un nuevo lead para gestionar:
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 15px 0; color: #1a1a2e;">Datos del Lead</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Nombre:</strong></td>
                  <td style="padding: 8px 0;">${lead.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Telefono:</strong></td>
                  <td style="padding: 8px 0;">${lead.phone}</td>
                </tr>
                ${lead.email ? `<tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${lead.email}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Origen:</strong></td>
                  <td style="padding: 8px 0;">${lead.source || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Prioridad:</strong></td>
                  <td style="padding: 8px 0; color: ${priorityColors[lead.priority] || '#333'}; font-weight: bold;">
                    ${priorityLabels[lead.priority] || lead.priority}
                  </td>
                </tr>
                ${lead.interestedPlanName ? `<tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Plan de interes:</strong></td>
                  <td style="padding: 8px 0;">${lead.interestedPlanName}</td>
                </tr>` : ''}
              </table>
            </div>

            ${lead.notes ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Notas</h4>
              <p style="margin: 0;">${lead.notes}</p>
            </div>
            ` : ''}

            <p style="color: #666; font-size: 14px;">
              Asignado por: ${assignedBy?.name || 'Sistema'}
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://grupojv.tusventas.digital/seller/leads"
                style="display:inline-block; padding:12px 30px; background-color:#f59e0b; color:#1a1a2e; text-decoration:none; border-radius:6px; font-weight: bold;">
                Ver mis leads
              </a>
            </div>
          </div>

          <div style="background-color: #1a1a2e; padding: 15px; text-align: center;">
            <small style="color: #888;">Este mensaje fue enviado automaticamente por el sistema TusVentas.</small>
          </div>
        </div>
      `
    });

    console.log(`Email de nuevo lead enviado a ${seller.email}`);
  } catch (error) {
    console.error('Error enviando email de nuevo lead:', error.message);
  }
}

// Funcion para enviar email de cambio de estado al dueno de la venta (vendedor)
async function enviarEmailCambioEstado(sale, previousStatus, newStatus, notes) {
  try {
    console.log('=== INICIO enviarEmailCambioEstado ===');
    console.log('Sale ID:', sale._id);
    console.log('Sale sellerId:', sale.sellerId);
    console.log('Cambio de estado:', previousStatus, '->', newStatus);
    
    // Verificar que el transporter este configurado
    if (!transporter) {
      console.log('ERROR: Email transporter no configurado. Saltando envio de email de cambio de estado.');
      return;
    }
    console.log('Transporter OK');
    
    console.log(`Preparando email de cambio de estado: ${previousStatus} -> ${newStatus}`);
    
    const statusLabels = {
      pending: "Cargada",
      pending_signature: "Pendiente de Firma",
      pending_appointment: "Pendiente de Turno",
      observed: "Observada",
      appointed: "Turnada",
      completed: "Instalada",
      cancelled: "Cancelada"
    };

    const statusColors = {
      pending: "#f59e0b",
      pending_signature: "#f97316",
      pending_appointment: "#a855f7",
      observed: "#d97706",
      appointed: "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444"
    };

    const User = mongoose.model('User');

    // Obtener el dueno de la venta (vendedor)
    const seller = await User.findById(sale.sellerId);

    if (!seller) {
      console.log('No se encontro el vendedor dueno de la venta');
      return;
    }

    if (!seller.email) {
      console.log(`El vendedor ${seller.name} no tiene email configurado`);
      return;
    }

    console.log(`Enviando email de cambio de estado a ${seller.email} (${seller.name})`);

    await transporter.sendMail({
      from: `"TusVentas" <${process.env.EMAIL_SMTP}>`,
      to: seller.email,
      subject: `Cambio de estado de venta: ${statusLabels[newStatus] || newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          
          <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
            <h1 style="color: #f59e0b; margin: 0;">TusVentas</h1>
          </div>

          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #1a1a2e;">Hola ${seller.name},</h2>
            
            <p style="font-size: 16px; color: #333;">
              Una de tus ventas ha cambiado de estado:
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColors[newStatus] || '#6b7280'};">
              <p style="margin: 0 0 10px 0;">
                <strong>Estado anterior:</strong> 
                <span style="background:${statusColors[previousStatus] || '#6b7280'}; color:white; padding:4px 12px; border-radius:4px; font-size: 14px;">
                  ${statusLabels[previousStatus] || previousStatus}
                </span>
              </p>
              <p style="margin: 0;">
                <strong>Nuevo estado:</strong> 
                <span style="background:${statusColors[newStatus] || '#6b7280'}; color:white; padding:4px 12px; border-radius:4px; font-size: 14px;">
                  ${statusLabels[newStatus] || newStatus}
                </span>
              </p>
            </div>

            ${notes ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Nota del cambio:</strong><br/>
              ${notes}
            </div>
            ` : ''}

            <h3 style="color: #1a1a2e; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
              Detalles de la venta
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Cliente:</strong></td>
                <td style="padding: 8px 0;">${sale.customerInfo.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Telefono:</strong></td>
                <td style="padding: 8px 0;">${sale.customerInfo.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Plan:</strong></td>
                <td style="padding: 8px 0;">${sale.planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Direccion:</strong></td>
                <td style="padding: 8px 0;">${sale.customerInfo.address.street} ${sale.customerInfo.address.number}, ${sale.customerInfo.address.city}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://tusventas.netlify.app"
                style="display:inline-block; padding:12px 30px; background-color:#f59e0b; color:#1a1a2e; text-decoration:none; border-radius:6px; font-weight: bold;">
                Ver en la plataforma
              </a>
            </div>
          </div>

          <div style="background-color: #1a1a2e; padding: 15px; text-align: center;">
            <small style="color: #888;">Este mensaje fue enviado automaticamente por el sistema TusVentas.</small>
          </div>
        </div>
      `
    });

    console.log(`Email de cambio de estado enviado exitosamente a ${seller.email}`);

  } catch (error) {
    console.error('Error enviando email de cambio de estado:', error.message);
  }
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve static files from uploads directory with CORS headers
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
}, express.static(uploadsDir))

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin role required.",
    })
  }
  next()
}

const requireAdminOrSupervisor = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "supervisor") {
  return res.status(403).json({
  success: false,
  error: "Access denied. Admin or Supervisor role required.",
  })
  }
  next()
  }

const requireAdminOrSupport = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "support") {
  return res.status(403).json({
  success: false,
  error: "Access denied. Admin or Support role required.",
  })
  }
  next()
  }

app.put("/api/admin/sales/:id", authenticateToken, requireAdmin, (req, res) => {
  console.log("Llegó al backend:", req.params.id, req.body)
  res.json({ ok: true })
})
// Lista de statuses válidos según tu enum
const validStatuses = ["pending", "pending_signature", "pending_appointment", "observed", "appointed", "completed", "cancelled"]

app.put("/sales/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  // Validar ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID inválido" })
  }

  // Validar status
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Status inválido. Debe ser uno de: ${validStatuses.join(", ")}`,
    })
  }

  try {
    // Update agresivo sólo para el status y fecha
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!updatedSale) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    return res.status(200).json(updatedSale)
  } catch (error) {
    console.error("Error actualizando estado:", error)
    return res.status(500).json({ message: "Error interno del servidor" })
  }
})

// CORS configuration - Permitir TODOS los origenes
app.use(cors({
  origin: true, // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID'],
  credentials: true
}))

// Body parsing middleware - Aumentado para soportar PDFs en base64
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// MongoDB Connection with better error handling - MODIFICADO PARA MONGODB CLOUD
const connectDB = async () => {
  try {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    // Configuración específica para MongoDB Atlas Cloud
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Mantener hasta 10 conexiones socket
      serverSelectionTimeoutMS: 10000, // Tiempo de espera para seleccionar servidor
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
      family: 4, // Usar IPv4, saltar IPv6
      retryWrites: true,
      w: "majority",
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options)

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(`📋 Collections found: ${collections.map((c) => c.name).join(", ")}`)

    // Eventos de conexi��n para MongoDB Atlas
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Atlas connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB Atlas disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Atlas reconnected")
    })
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error)

    // Mensajes específicos para errores comunes de MongoDB Atlas
    if (error.name === "MongoServerSelectionError") {
      console.error("💡 Posibles soluciones para MongoDB Atlas:")
      console.error("   - Verifica que tu IP esté en la lista blanca de MongoDB Atlas")
      console.error("   - Confirma que el usuario y contraseña sean correctos")
      console.error("   - Asegúrate de que el cluster esté activo")
      console.error("   - Verifica tu conexión a internet")
    }

    if (error.message.includes("authentication failed")) {
      console.error("💡 Error de autenticación:")
      console.error("   - Verifica el usuario y contraseña en MongoDB Atlas")
      console.error("   - Asegúrate de que el usuario tenga permisos de lectura/escritura")
    }

    process.exit(1)
  }
}

// Connect to database
connectDB()

// User Schema
const userSchema = new mongoose.Schema(
  {
companyId: {
    type: String,
    enum: ["prosegur", "tupaginaya"],
    default: "prosegur",
  },
// Empresas a las que puede acceder el usuario (para vendedores multi-empresa)
allowedCompanies: {
    type: [String],
    enum: ["prosegur", "tupaginaya"],
    default: [],
  },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["seller", "admin", "supervisor", "support"],
        message: "Role must be seller, admin, supervisor or support",
      },
      default: "seller",
    },
    commissionRate: {
      type: Number,
      default: 0.3,
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    supervisorBaseCommission: {
      type: Number,
      default: 750000,
      min: [0, "Supervisor base commission cannot be negative"],
    },
    // Comision fija por venta (si es null/undefined, usa la escala por tiers)
    fixedCommissionPerSale: {
      type: Number,
      default: null,
      min: [0, "Fixed commission cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: [0, "Total sales cannot be negative"],
    },
    totalCommissions: {
      type: Number,
      default: 0,
      min: [0, "Total commissions cannot be negative"],
    },
    // Campos para tracking de actividad en linea
    lastActivity: {
      type: Date,
      default: null,
    },
    sessionStart: {
      type: Date,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Sale Schema
const saleSchema = new mongoose.Schema(
  {
companyId: {
    type: String,
    enum: ["prosegur", "tupaginaya"],
    default: "prosegur",
  },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
    },
    sellerName: {
      type: String,
      required: [true, "Seller name is required"],
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "Plan ID is required"],
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
    },
planPrice: {
  type: Number,
  required: true,
  min: [0, "Plan price must be 0 or greater"],
},
    commission: {
      type: Number,
      required: [true, "Commission is required"],
      min: [0, "Commission cannot be negative"],
    },
    commissionRate: {
      type: Number,
      required: [true, "Commission rate is required"],
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "pending_signature", "pending_appointment", "observed", "appointed", "completed", "cancelled"],
        message: "Status must be one of the allowed values",
      },
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: {
            values: ["pending", "pending_signature", "pending_appointment", "observed", "appointed", "completed", "cancelled"],
          },
        },
        changedBy: {
          type: String,
          trim: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    customerInfo: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        maxlength: [100, "Customer name cannot exceed 100 characters"],
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid customer email"],
      },
    phone: {
      type: String,
      trim: true,
    },
      dni: {
        type: String,
        required: [true, "Customer DNI is required"],
        trim: true,
      },

      address: {
        street: {
          type: String,
          required: [true, "Street is required"],
          trim: true,
        },
        number: {
          type: String,
          required: [true, "Street number is required"],
          trim: true,
        },
        city: {
          type: String,
          required: [true, "City is required"],
          trim: true,
        },
        province: {
          type: String,
          required: [true, "Province is required"],
          trim: true,
        },
        postalCode: {
          type: String,
          required: [true, "Postal code is required"],
          trim: true,
        },
        floor: {
          type: String,
          trim: true,
        },
        apartment: {
          type: String,
          trim: true,
        },
        entreCalles: {
          type: String,
          trim: true,
        },
        googleMapsLink: {
          type: String,
          trim: true,
        },
      },
      birthDate: {
        type: String,
        trim: true,
      },
      emergencyContact: {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
        },
      },
    },
    planDetail: {
      type: String,
      trim: true,
    },
    customPrice: {
      type: Number,
      min: [0, "Custom price must be 0 or greater"],
    },
    // Campos para supervisor - costos adicionales
    installationCost: {
      type: Number,
      default: 0,
      min: [0, "Installation cost must be 0 or greater"],
    },
    adminCost: {
      type: Number,
      default: 0,
      min: [0, "Admin cost must be 0 or greater"],
    },
    adCost: {
      type: Number,
      default: 0,
      min: [0, "Ad cost must be 0 or greater"],
    },
    sellerCommissionPaid: {
      type: Number,
      default: 0,
      min: [0, "Seller commission must be 0 or greater"],
    },
    paymentInfo: {
      paymentMethodAbono: {
        type: String,
        enum: ["credit_card", "cbu"],
      },
      cardBrand: {
        type: String,
        enum: ["visa", "mastercard"],
      },
      cbuNumber: {
        type: String,
        trim: true,
      },
      paymentMethodInstallation: {
        type: String,
        enum: ["transfer", "mercadopago"],
      },
    },
    // Fechas de estados para el corte mensual
    appointedDate: {
      type: Date,
      default: null,
    },
    // Horario del turno (AM: 8:30-13:30, PM: 13:30-18:30)
    appointmentSlot: {
      type: String,
      enum: ["AM", "PM", null],
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    installationCostDate: {
      type: Date,
      default: null,
    },
    // Numero de CTO para ventas activadas
    ctoNumber: {
      type: String,
      trim: true,
      default: null,
    },
    // Numero de contrato
    contractNumber: {
      type: String,
      trim: true,
      default: null,
    },
    // Campos para sistema de bajas
    isBaja: {
      type: Boolean,
      default: false,
    },
    bajaDate: {
      type: Date,
      default: null,
    },
    bajaMonthsLimit: {
      type: Number,
      default: null,
    },
    bajaReason: {
      type: String,
      trim: true,
      default: null,
    },
    bajaAmount: {
      type: Number,
      default: 0,
      min: [0, "Baja amount must be 0 or greater"],
    },
    // Archivos adjuntos de la venta
    installationAttachments: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

// Plan Schema
const planSchema = new mongoose.Schema(
  {
companyId: {
    type: String,
    enum: ["prosegur", "tupaginaya"],
    default: "prosegur",
  },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      maxlength: [100, "Plan name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
      trim: true,
      maxlength: [500, "Plan description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: [0.01, "Plan price must be greater than 0"],
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)



// Lead Schema - Sistema de embudo de ventas
const leadSchema = new mongoose.Schema(
  {
companyId: {
    type: String,
    enum: ["prosegur", "tupaginaya"],
    default: "prosegur",
  },
    // Datos del contacto/lead
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dni: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      number: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    // Origen del lead
    source: {
      type: String,
      enum: ["facebook", "instagram", "google", "referido", "llamada_entrante", "puerta_a_puerta", "otro"],
      default: "otro",
    },
    sourceDetail: {
      type: String,
      trim: true,
      maxlength: [200, "Source detail cannot exceed 200 characters"],
    },
    // Asignacion
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned seller is required"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigner is required"],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    // Estado del lead en el embudo
    status: {
      type: String,
      enum: {
        values: ["nuevo", "contactado", "interesado", "no_contesta", "no_interesado", "seguimiento", "cerrado_ganado", "cerrado_perdido"],
        message: "Status must be one of the allowed values",
      },
      default: "nuevo",
    },
    // Prioridad
    priority: {
      type: String,
      enum: ["baja", "media", "alta", "urgente"],
      default: "media",
    },
    // Plan de interes (opcional)
    interestedPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    interestedPlanName: {
      type: String,
      trim: true,
    },
    // Historial de contactos/interacciones
    contactHistory: [
      {
        type: {
          type: String,
          enum: ["llamada", "whatsapp", "email", "visita", "otro"],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [500, "Notes cannot exceed 500 characters"],
        },
        outcome: {
          type: String,
          enum: ["contactado", "no_contesta", "interesado", "no_interesado", "agendar_seguimiento", "cerrar"],
          required: true,
        },
        nextAction: {
          type: String,
          trim: true,
          maxlength: [200, "Next action cannot exceed 200 characters"],
        },
        nextActionDate: {
          type: Date,
        },
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    // Fecha de proximo seguimiento
    nextFollowUp: {
      type: Date,
    },
    // Notas generales
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    // Referencia a la venta si se convierte
    convertedToSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
    convertedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const Lead = mongoose.model("Lead", leadSchema)

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya"],
      default: "prosegur",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "meeting", "material", "warning", "success", "document", "announcement", "training"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    recipientType: {
      type: String,
      enum: ["all", "selected"],
      default: "all",
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    meetingInfo: {
      date: String,
      time: String,
      duration: Number,
      platform: String,
      link: String,
      location: String,
      description: String,
    },
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    emailsSent: {
      type: Boolean,
      default: false,
    },
    emailSentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// ChatRoom Schema
const chatRoomSchema = new mongoose.Schema(
  {
companyId: {
    type: String,
    enum: ["prosegur", "tupaginaya"],
    default: "prosegur",
  },
    name: {
      type: String,
      required: [true, "Chat room name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["group", "private"],
        message: "Type must be group or private",
      },
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["text", "file", "image"],
        message: "Type must be text, file, or image",
      },
      default: "text",
    },
attachments: [
  {
    originalName: String,
    url: String,
    size: Number,
    type: String,
  },
],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  {
    timestamps: true,
  },
)

// SupervisorAdCost Schema - Costos de anuncio mensuales por supervisor
const supervisorAdCostSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      default: 0,
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

// Index compuesto para asegurar un solo registro por supervisor/mes
supervisorAdCostSchema.index({ supervisorId: 1, month: 1 }, { unique: true })

// Advance Schema (Adelantos de dinero que se descuentan de comisiones)
const advanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya"],
      default: "prosegur",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index para buscar adelantos por usuario y mes
advanceSchema.index({ userId: 1, month: 1 })

// Client Schema (para TuPaginaYa)
const clientSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya", "tusventas"],
      default: "tupaginaya",
    },
    // Datos del cliente (basicos para demo)
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    dni: {
      type: String,
      trim: true,
    },
    // Datos del negocio (para demo)
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    businessType: {
      type: String,
      trim: true,
    },
    whatTheySell: {
      type: String,
      trim: true,
    },
    // Redes sociales y archivos de demo
    socialNetworks: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      website: { type: String, trim: true },
      other: { type: String, trim: true },
    },
    flyerUrl: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    // Datos de la web
    domain: {
      type: String,
      trim: true,
    },
    demoUrl: {
      type: String,
      trim: true,
    },
    liveUrl: {
      type: String,
      trim: true,
    },
    webType: {
      type: String,
      enum: ["landing", "ecommerce", "catalogo", "institucional", "blog", "otro"],
      default: "landing",
    },
    hostingPlan: {
      type: String,
      trim: true,
    },
    // Comprobante de pago de activacion
    paymentProofUrl: {
      type: String,
      trim: true,
    },
    // Estado del cliente (nuevo flujo)
    status: {
      type: String,
      enum: ["demo_pendiente", "demo_enviada", "web_pendiente", "web_activada", "web_pausada", "cliente_baja"],
      default: "demo_pendiente",
    },
    // Fecha de activacion/inicio de cobranza
    activationDate: {
      type: Date,
    },
    // Fecha de baja si aplica
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    // Precios
    monthlyPrice: {
      type: Number,
      default: 0,
    },
    setupPrice: {
      type: Number,
      default: 0,
    },
    // Dia de corte para cobranza (1-31)
    billingDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },
    // Vendedor asignado
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Venta asociada (si existe)
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Payment Schema (Pagos de clientes)
const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya", "tusventas"],
      default: "tupaginaya",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    period: {
      type: String, // "2024-01" formato YYYY-MM
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "transferencia", "mercadopago", "tarjeta", "otro"],
      default: "transferencia",
    },
    status: {
      type: String,
      enum: ["pendiente", "pagado", "vencido", "anulado"],
      default: "pendiente",
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

// Transaction Schema (Ingresos/Egresos)
const transactionSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya", "tusventas"],
      default: "tupaginaya",
    },
    type: {
      type: String,
      enum: ["ingreso", "egreso"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Referencia opcional a cliente
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    // Referencia opcional a pago
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Liquidation Schema (Pago a vendedores)
const liquidationSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya", "tusventas"],
      default: "tupaginaya",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String, // "2024-01" formato YYYY-MM
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Detalles de las ventas/comisiones incluidas
    details: [
      {
        saleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sale",
        },
        amount: Number,
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ["pendiente", "pagado", "anulado"],
      default: "pendiente",
    },
    paidAt: {
      type: Date,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "transferencia", "mercadopago", "otro"],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index para liquidaciones
liquidationSchema.index({ userId: 1, period: 1, companyId: 1 }, { unique: true })

// ========================================
// TUPAGINAYA SPECIFIC SCHEMAS (TPY_*)
// Schemas separados para TuPaginaYa
// ========================================

// TPY_Client Schema - Clientes de TuPaginaYa
const tpyClientSchema = new mongoose.Schema(
  {
    // Datos del cliente
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Datos del negocio/web
    webName: {
      type: String,
      required: [true, "Web name is required"],
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    demoUrl: {
      type: String,
      trim: true,
    },
    // Estado del cliente (flujo TuPaginaYa)
    status: {
      type: String,
      enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada", "baja"],
      default: "pendiente_demo",
    },
    // Precios
    activationPrice: {
      type: Number,
      default: 0,
    },
    monthlyPrice: {
      type: Number,
      default: 0,
    },
    // Fechas importantes
    createdDate: {
      type: Date,
      default: Date.now,
    },
    activationDate: {
      type: Date,
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    // Vendedor asignado
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerName: {
      type: String,
      trim: true,
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// TPY_Demo Schema - Demos de TuPaginaYa
const tpyDemoSchema = new mongoose.Schema(
  {
    // Relacion con cliente
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TPY_Client",
    },
    // Datos basicos (para demos sin cliente asociado aun)
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    webName: {
      type: String,
      required: [true, "Web name is required"],
      trim: true,
    },
    demoUrl: {
      type: String,
      trim: true,
    },
    // Estado de la demo
    status: {
      type: String,
      enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada"],
      default: "pendiente_demo",
    },
    // Precios cotizados
    activationPrice: {
      type: Number,
      default: 0,
    },
    monthlyPrice: {
      type: Number,
      default: 0,
    },
    // Fecha de la demo
    demoDate: {
      type: Date,
      default: Date.now,
    },
    // Vendedor que creo la demo
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerName: {
      type: String,
      trim: true,
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
    // Archivos adjuntos
    flyerUrl: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    // Tipo de negocio y detalles
    businessType: {
      type: String,
      trim: true,
    },
    whatTheySell: {
      type: String,
      trim: true,
    },
    // Redes sociales
    socialNetworks: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      website: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
)

// TPY_Sale Schema - Ventas de TuPaginaYa (webs activadas)
const tpySaleSchema = new mongoose.Schema(
  {
    // Relacion con cliente
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TPY_Client",
      required: true,
    },
    // Datos del cliente (denormalizados)
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    // Datos de la web
    webName: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    // Estado de la venta
    status: {
      type: String,
      enum: ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada", "baja"],
      default: "pendiente_web",
    },
    // Precios
    activationPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    // Fechas
    saleDate: {
      type: Date,
      default: Date.now,
    },
    activationDate: {
      type: Date,
    },
    // Vendedor
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerName: {
      type: String,
      trim: true,
    },
    // Comision
    commission: {
      type: Number,
      default: 0,
    },
    commissionPaid: {
      type: Boolean,
      default: false,
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// TPY_Transaction Schema - Transacciones de caja TuPaginaYa
const tpyTransactionSchema = new mongoose.Schema(
  {
    // Tipo de transaccion
    type: {
      type: String,
      enum: ["ingreso", "egreso"],
      required: true,
    },
    // Categoria
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Concepto/descripcion
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    // Monto
    amount: {
      type: Number,
      required: true,
    },
    // Fecha de la transaccion
    date: {
      type: Date,
      default: Date.now,
    },
    // Mes al que pertenece (para filtros)
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    // Referencia a cliente (si aplica)
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TPY_Client",
    },
    clientName: {
      type: String,
      trim: true,
    },
    // Quien registro
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// TPY_Collection Schema - Cobranzas mensuales de TuPaginaYa
const tpyCollectionSchema = new mongoose.Schema(
  {
    // Cliente
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TPY_Client",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    webName: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    // Periodo (mes)
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    // Monto esperado
    expectedAmount: {
      type: Number,
      required: true,
    },
    // Monto pagado
    paidAmount: {
      type: Number,
      default: 0,
    },
    // Estado de la cobranza
    status: {
      type: String,
      enum: ["pendiente", "pagado", "parcial", "vencido"],
      default: "pendiente",
    },
    // Fecha de pago
    paymentDate: {
      type: Date,
    },
    // Quien registro el pago
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Notas
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index para cobranzas (un registro por cliente/mes)
tpyCollectionSchema.index({ clientId: 1, month: 1 }, { unique: true })

// Models TuPaginaYa
const TPY_Client = mongoose.model("TPY_Client", tpyClientSchema)
const TPY_Demo = mongoose.model("TPY_Demo", tpyDemoSchema)
const TPY_Sale = mongoose.model("TPY_Sale", tpySaleSchema)
const TPY_Transaction = mongoose.model("TPY_Transaction", tpyTransactionSchema)
const TPY_Collection = mongoose.model("TPY_Collection", tpyCollectionSchema)

// PaymentReminder Schema (Recordatorios enviados)
const paymentReminderSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      default: "tupaginaya",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    type: {
      type: String,
      enum: ["5_dias", "15_dias", "30_dias", "manual"],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// CompanySettings Schema (Configuracion por empresa)
const companySettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      enum: ["prosegur", "tupaginaya"],
      required: true,
      unique: true,
    },
    // Comision base por venta para vendedores de esta empresa
    baseCommissionPerSale: {
      type: Number,
      default: 200000,
      min: [0, "Base commission cannot be negative"],
    },
    // Precio base por venta (para TuPaginaYa)
    basePrice: {
      type: Number,
      default: 15000,
      min: [0, "Base price cannot be negative"],
    },
    // Sistema de comisiones por escala para vendedores (TuPaginaYa)
    commissionScales: [{
      minSales: { type: Number, required: true }, // Cantidad minima de ventas
      maxSales: { type: Number, default: null }, // Cantidad maxima (null = infinito)
      commissionAmount: { type: Number, required: true }, // Monto de comision por venta
    }],
    // Comision fija para supervisores por venta de su equipo
    supervisorFixedCommission: {
      type: Number,
      default: 0,
      min: [0, "Supervisor commission cannot be negative"],
    },
    // Otras configuraciones que se pueden agregar en el futuro
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Models
const User = mongoose.model("User", userSchema)
const CompanySettings = mongoose.model("CompanySettings", companySettingsSchema)
const Sale = mongoose.model("Sale", saleSchema)
const Plan = mongoose.model("Plan", planSchema)
const Notification = mongoose.model("Notification", notificationSchema)
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema)
const Message = mongoose.model("Message", messageSchema)
const SupervisorAdCost = mongoose.model("SupervisorAdCost", supervisorAdCostSchema)
const Client = mongoose.model("Client", clientSchema)
const Payment = mongoose.model("Payment", paymentSchema)
const Transaction = mongoose.model("Transaction", transactionSchema)
const Liquidation = mongoose.model("Liquidation", liquidationSchema)
const PaymentReminder = mongoose.model("PaymentReminder", paymentReminderSchema)
const Advance = mongoose.model("Advance", advanceSchema)

// Schema para liquidaciones enviadas por email
const liquidationEmailSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      default: "prosegur",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String, // formato YYYY-MM
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    emailSentTo: {
      type: String,
      required: true,
    },
    emailSentAt: {
      type: Date,
      default: Date.now,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoiceUploaded: {
      type: Boolean,
      default: false,
    },
    invoiceUrl: {
      type: String,
    },
    invoiceUploadedAt: {
      type: Date,
    },
    invoiceStatus: {
      type: String,
      enum: ["pending", "uploaded", "processed", "paid"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LiquidationEmail = mongoose.model("LiquidationEmail", liquidationEmailSchema);

// Marketing Materials Schema
const marketingMaterialSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      enum: ["prosegur", "tupaginaya"],
      default: "tupaginaya",
    },
    category: {
      type: String,
      required: true,
      enum: ["induccion", "publicidad", "demos_entregadas"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ["image", "video", "document", "other"],
      default: "other",
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MarketingMaterial = mongoose.model("MarketingMaterial", marketingMaterialSchema);

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Error handling helper
const handleError = (res, error, message = "Server error") => {
  console.error(`${message}:`, error)

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message)
    console.error("Validation errors details:", errors)
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: errors.join(", "),
      details: errors,
    })
  }

  if (error.name === "CastError") {
    console.error("Cast error - Invalid ObjectId:", error.value)
    return res.status(400).json({
      success: false,
      error: `Invalid ${error.path}: ${error.value}`,
      message: `El valor '${error.value}' no es valido para el campo '${error.path}'`,
    })
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
      message: `El campo ${field} ya existe`,
      code: "DUPLICATE_FIELD",
    })
  }

  res.status(500).json({
    success: false,
    error: message,
    message: error.message || message,
  })
}

// Routes

// Health check with database status
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    // Count documents to test database
    const userCount = await User.countDocuments()
    const saleCount = await Sale.countDocuments()
    const planCount = await Plan.countDocuments()
    const notificationCount = await Notification.countDocuments()
    const chatRoomCount = await ChatRoom.countDocuments()
    const messageCount = await Message.countDocuments()

    res.json({
      success: true,
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: dbStates[dbStatus],
        name: mongoose.connection.name,
        collections: {
          users: userCount,
          sales: saleCount,
          plans: planCount,
          notifications: notificationCount,
          chatRooms: chatRoomCount,
          messages: messageCount,
        },
      },
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(500).json({
      success: false,
      status: "ERROR",
      error: error.message,
      database: {
        status: "error",
      },
    })
  }
})

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body

    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      commissionRate: 0.3,
    })

    await user.save()

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    )
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        commissionRate: user.commissionRate,
      },
    })

    // Enviar notificacion de forma asincrona
    setImmediate(async () => {
      try {
        await enviarMensajeTelegram(`<b>Nuevo registro</b>\nNombre: ${name}\nEmail: ${email}\nTelefono: ${phone}`);
      } catch (e) {
        console.error('Error enviando Telegram:', e.message);
      }
    });

  } catch (error) {
    handleError(res, error, "Registration failed")
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: "Account is deactivated",
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      })
    }

const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
)

    // Marcar usuario como online y registrar inicio de sesion
    const now = new Date()
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      sessionStart: now,
      lastActivity: now,
    })

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        commissionRate: user.commissionRate,
        totalSales: user.totalSales,
        totalCommissions: user.totalCommissions,
      },
    })
  } catch (error) {
    handleError(res, error, "Login failed")
  }
})

// User Routes
app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch profile")
  }
})

// Actualizar actividad del usuario (heartbeat) - llamar cada 30 segundos
app.post("/api/users/heartbeat", authenticateToken, async (req, res) => {
  try {
    const now = new Date()
    await User.findByIdAndUpdate(req.user.userId, {
      lastActivity: now,
      isOnline: true,
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update activity" })
  }
})

// Logout - marcar usuario como offline
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      isOnline: false,
      lastActivity: new Date(),
    })
    res.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    handleError(res, error, "Logout failed")
  }
})

// Obtener usuarios en linea (solo admin)
app.get("/api/admin/online-users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin or Supervisor role required.",
      })
    }

    // Considerar "online" si la ultima actividad fue hace menos de 2 minutos
    // Considerar "idle" si fue hace entre 2 y 10 minutos
    // Considerar "offline" si fue hace mas de 10 minutos
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    
    // Obtener usuarios activos que han tenido actividad reciente
    const users = await User.find({
      isActive: true,
      role: { $ne: "admin" },
      $or: [
        { isOnline: true },
        { lastActivity: { $gte: tenMinutesAgo } }
      ]
    }).select("name email role lastActivity sessionStart isOnline")
    
    // Agregar status calculado a cada usuario
    const usersWithStatus = users.map(user => {
      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null
      let status = "offline"
      let minutesSinceActivity = null
      let minutesOnline = null
      
      if (lastActivity) {
        minutesSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / 60000)
        
        if (minutesSinceActivity <= 2) {
          status = "online"
        } else if (minutesSinceActivity <= 10) {
          status = "idle"
        } else {
          status = "offline"
        }
      }
      
      if (user.sessionStart) {
        minutesOnline = Math.floor((Date.now() - new Date(user.sessionStart).getTime()) / 60000)
      }
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status,
        lastActivity: user.lastActivity,
        sessionStart: user.sessionStart,
        minutesSinceActivity,
        minutesOnline,
        isOnline: user.isOnline,
      }
    })
    
    // Ordenar: online primero, luego idle, luego offline
    const statusOrder = { online: 0, idle: 1, offline: 2 }
    usersWithStatus.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    
    res.json({
      success: true,
      users: usersWithStatus,
      summary: {
        online: usersWithStatus.filter(u => u.status === "online").length,
        idle: usersWithStatus.filter(u => u.status === "idle").length,
        offline: usersWithStatus.filter(u => u.status === "offline").length,
      }
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch online users")
  }
})

app.put("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Si se quiere cambiar contraseña
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: "La contraseña actual es incorrecta",
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "La nueva contraseña debe tener al menos 6 caracteres",
        })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      user.password = hashedPassword
    }

    // Actualizar otros campos si se proporcionan
    if (name) user.name = name
    if (phone) user.phone = phone
    if (location) user.location = location

    await user.save()

    const updatedUser = await User.findById(req.user.userId).select("-password")

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    handleError(res, error, "Failed to update profile")
  }
})

// Sales Routes
app.post("/api/sales", authenticateToken, async (req, res) => {
  try {
    console.log("Creating sale - User:", req.user.userId)

    const { planId, description, sellerId: assignedSellerId } = req.body
    console.log('REQ BODY:', req.body)

    let customerInfo = req.body.customerInfo


    console.log('PLAN:', req.body.plan);
console.log('DESCRIPTION:', req.body.description);
console.log('CUSTOMER:', req.body.customer);
    if (!planId || !description || !customerInfo) {
      return res.status(400).json({
        success: false,
        error: "Plan, description and customer info are required",
      })
    }

    if (typeof customerInfo === "string") {
      customerInfo = JSON.parse(customerInfo)
    }

    const requiredCustomerFields = ["name", "email", "phone", "dni"]
    const requiredAddressFields = ["street", "number", "city", "province", "postalCode"]

    for (const field of requiredCustomerFields) {
      if (!customerInfo[field]) {
        return res.status(400).json({
          success: false,
          error: `Customer ${field} is required`,
        })
      }
    }

    if (!customerInfo.address) {
      return res.status(400).json({
        success: false,
        error: "Customer address is required",
      })
    }

    for (const field of requiredAddressFields) {
      if (!customerInfo.address[field]) {
        return res.status(400).json({
          success: false,
          error: `Customer address ${field} is required`,
        })
      }
    }

    const plan = await Plan.findById(planId)
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: "Plan not found or inactive",
      })
    }

    // Obtener el usuario que crea la venta
    const currentUser = await User.findById(req.user.userId)
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Si es admin o supervisor y asigna a otro vendedor
    let targetSeller = currentUser
    console.log("[v0] assignedSellerId from request:", assignedSellerId)
    console.log("[v0] currentUser role:", currentUser.role)
    
    if (assignedSellerId && (currentUser.role === "admin" || currentUser.role === "supervisor" || currentUser.role === "support")) {
      targetSeller = await User.findById(assignedSellerId)
      console.log("[v0] Found targetSeller:", targetSeller ? targetSeller._id : "NOT FOUND")
      if (!targetSeller) {
        return res.status(404).json({
          success: false,
          error: "Assigned seller not found",
        })
      }
    }
    
    console.log("[v0] Final targetSeller._id:", targetSeller._id)
    console.log("[v0] Final targetSeller.name:", targetSeller.name)

    const commission = plan.price * targetSeller.commissionRate

    const statusHistory = [
      {
        status: "pending",
        changedBy: currentUser.name,
        changedAt: new Date(),
        notes: "Venta registrada",
      },
    ]

    const { planDetail, customPrice, paymentInfo } = req.body

// Si el supervisor crea la venta, guardar su ID para poder seguir viendola
    const supervisorId = currentUser.role === "supervisor" ? currentUser._id : undefined
    const companyId = getCompanyId(req);

    const sale = new Sale({
      companyId,
      sellerId: targetSeller._id,
      sellerName: targetSeller.name,
      supervisorId: supervisorId,
      planId: plan._id,
      planName: plan.name,
      planPrice: plan.price,
      commission,
      commissionRate: targetSeller.commissionRate,
      description,
      customerInfo,
      statusHistory,
      planDetail: planDetail || undefined,
      customPrice: customPrice || undefined,
      paymentInfo: paymentInfo || undefined,
    })

    await sale.save()
        // Solo sumar al total si la venta no está cancelada

    console.log("Sale created successfully:", sale._id)

    // Si la venta fue asignada a otro vendedor (no al creador), notificarle
    if (assignedSellerId && currentUser._id.toString() !== targetSeller._id.toString()) {
      const assignmentNotification = new Notification({
        title: "Nueva venta asignada",
        message: `Se te ha asignado una nueva venta del plan ${plan.name} para el cliente ${customerInfo.name}. Revisa tu panel de ventas para mas detalles.`,
        type: "info",
        priority: "high",
        recipients: [targetSeller._id],
        createdBy: currentUser._id,
      });
      await assignmentNotification.save();
    }

    if (sale.status !== "cancelled") {
      await User.findByIdAndUpdate(targetSeller._id, {
        $inc: {
          totalSales: plan.price,
          totalCommissions: commission,
        },
      })
    }

    // Responder inmediatamente con exito
    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale,
    })

    // Enviar notificaciones de forma asincrona (no bloquean la respuesta)
    setImmediate(async () => {
      try {
        await enviarMensajeTelegram(
          `Nueva venta:\nMonto: $${plan.price}\nProducto: ${plan.name}\nVendedor: ${targetSeller.name}`
        );
      } catch (e) {
        console.error('Error enviando Telegram:', e.message);
      }

      try {
        await enviarEmailNuevaVenta(sale, targetSeller, plan);
      } catch (e) {
        console.error('Error enviando email:', e.message);
      }
    });

  } catch (error) {
    console.error("Error creating sale:", error)
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
        if (err) console.error("Error deleting file:", err)
      })
    }
    handleError(res, error, "Failed to create sale")
  }
})

app.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching sales for user:", req.user.userId, "role:", req.user.role)

    const { page = 1, limit = 100, status, startDate, endDate } = req.query
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    // Convertir userId a ObjectId para comparacion correcta
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId)
    
    let query = { ...companyFilter }
    
    if (req.user.role === "supervisor") {
      // Supervisor ve: sus propias ventas + ventas donde es supervisorId
      query.$and = [
        companyFilter,
        { $or: [{ sellerId: userObjectId }, { supervisorId: userObjectId }] }
      ]
      delete query.$or
    } else {
      // Vendedor solo ve sus propias ventas
      query.sellerId = userObjectId
    }

    if (status) query.status = status
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    console.log("Sales query:", JSON.stringify(query))

    const sales = await Sale.find(query)
      .populate("planId", "name description")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Sale.countDocuments(query)

    console.log(`Found ${sales.length} sales out of ${total} total`)

    res.json({
      success: true,
      sales,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    handleError(res, error, "Failed to fetch sales")
  }
})

// Plans Routes
app.get("/api/plans", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching plans")
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    const plans = await Plan.find({ ...companyFilter, isActive: true }).select("name description price features").sort({ price: 1 })

    console.log(`Found ${plans.length} active plans for company ${companyId}`)

    res.json({
      success: true,
      plans,
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    handleError(res, error, "Failed to fetch plans")
  }
})

// Dashboard Routes
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching dashboard stats for user:", req.user.userId)

    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    const salesStats = await Sale.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$planPrice" },
          totalCommissions: { $sum: "$commission" },
          totalCount: { $sum: 1 },
          avgSale: { $avg: "$planPrice" },
        },
      },
    ])

    const monthlyStats = await Sale.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$planPrice" },
          totalCommissions: { $sum: "$commission" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ])

    const stats = salesStats[0] || {
      totalSales: 0,
      totalCommissions: 0,
      totalCount: 0,
      avgSale: 0,
    }

    console.log("Dashboard stats:", stats)

    res.json({
      success: true,
      user: {
        name: user.name,
        commissionRate: user.commissionRate,
      },
      stats,
      monthlyStats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    handleError(res, error, "Failed to fetch dashboard stats")
  }
})

// Support Routes - Gestion de ventas sin acceso a comisiones
app.get("/api/support/sales", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sellerId, startDate, endDate } = req.query
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    
    const query = { ...companyFilter }
    if (status) query.status = status
    if (sellerId) query.sellerId = sellerId
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const sales = await Sale.find(query)
      .populate("sellerId", "name email")
      .populate("supervisorId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Sale.countDocuments(query)

    res.json({
      success: true,
      sales,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch sales")
  }
})

// Support - Estadisticas basicas (sin datos financieros)
app.get("/api/support/stats", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    const totalSales = await Sale.countDocuments(companyFilter)
    const pendingSales = await Sale.countDocuments({ ...companyFilter, status: "pending" })
    const pendingAppointment = await Sale.countDocuments({ ...companyFilter, status: "pending_appointment" })
    const appointedSales = await Sale.countDocuments({ ...companyFilter, status: "appointed" })
    const completedSales = await Sale.countDocuments({ ...companyFilter, status: "completed" })
    const cancelledSales = await Sale.countDocuments({ ...companyFilter, status: "cancelled" })
    const totalSellers = await User.countDocuments({ ...companyFilter, role: "seller", isActive: true })
    const totalSupervisors = await User.countDocuments({ ...companyFilter, role: "supervisor", isActive: true })

    res.json({
      success: true,
      stats: {
        totalSales,
        pendingSales,
        pendingAppointment,
        appointedSales,
        completedSales,
        cancelledSales,
        totalSellers,
        totalSupervisors,
      },
    })
  } catch (error) {
    handleError(error, res, "Failed to fetch support stats")
  }
})

// Support - Actualizar estado de venta
app.put("/api/support/sales/:id/status", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const { status, notes, statusDate, ctoNumber } = req.body
    const { id } = req.params

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" })
    }

    const validStatuses = ["pending", "pending_signature", "pending_appointment", "observed", "appointed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
        validValues: validStatuses,
      })
    }

    const sale = await Sale.findById(id)
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" })
    }

    const previousStatus = sale.status
    const effectiveDate = statusDate ? new Date(statusDate) : new Date()

    sale.statusHistory.push({
      status,
      changedBy: req.user.userId,
      changedAt: effectiveDate,
      notes: notes || "",
    })

    sale.status = status
    
    if (status === "appointed") {
      sale.appointedDate = effectiveDate
    } else if (status === "completed") {
      sale.completedDate = effectiveDate
      // Guardar numero de CTO si se proporciona
      if (ctoNumber) {
        sale.ctoNumber = ctoNumber
      }
    }

    await sale.save()

    res.json({
      success: true,
      message: "Sale status updated successfully",
      sale,
    })
  } catch (error) {
    handleError(res, error, "Failed to update sale status")
  }
})

// Actualizar numero de contrato de una venta
app.put("/api/admin/sales/:id/contract", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const { id } = req.params;
    const { contractNumber } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

    sale.contractNumber = contractNumber || "";
    await sale.save();

    res.json({
      success: true,
      message: "Contract number updated successfully",
      sale,
    });
  } catch (error) {
    handleError(res, error, "Failed to update contract number");
  }
});

// Support - Obtener vendedores (solo nombres, sin comisiones)
app.get("/api/support/sellers", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    const sellers = await User.find({ 
      ...companyFilter,
      role: { $in: ["seller", "supervisor"] },
      isActive: true 
    }).select("_id name email role")

    res.json({
      success: true,
      sellers,
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch sellers")
  }
})

// Admin Routes
  app.get("/api/admin/stats", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    console.log("Fetching admin stats")
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    const totalStats = await Sale.aggregate([
      { $match: companyFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$planPrice" },
          totalCommissions: { $sum: "$commission" },
          totalCount: { $sum: 1 },
        },
      },
    ])

    // Para usuarios y planes, usar filtro compatible con legacy
    const userFilter = companyId === 'prosegur' 
      ? { $or: [{ companyId: 'prosegur' }, { companyId: { $exists: false } }, { companyId: null }, { companyId: '' }], role: "seller" }
      : { companyId, role: "seller" };
    const planFilter = companyId === 'prosegur'
      ? { $or: [{ companyId: 'prosegur' }, { companyId: { $exists: false } }, { companyId: null }, { companyId: '' }], isActive: true }
      : { companyId, isActive: true };
    
    const userCount = await User.countDocuments(userFilter)
    const planCount = await Plan.countDocuments(planFilter)

// Calcular ventas por estado
    const salesByStatusAgg = await Sale.aggregate([
      { $match: companyFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const salesByStatus = {}
    salesByStatusAgg.forEach((item) => {
      salesByStatus[item._id] = item.count
    })

const topSellers = await Sale.aggregate([
      { $match: companyFilter },
      {
        $group: {
          _id: "$sellerId",
          name: { $first: "$sellerName" },
          totalSales: { $sum: 1 },
          totalCommissions: { $sum: "$commission" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ])

const topPlans = await Sale.aggregate([
      { $match: companyFilter },
      {
        $group: {
          _id: "$planId",
          planName: { $first: "$planName" },
          totalSales: { $sum: "$planPrice" },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { salesCount: -1 } },
      { $limit: 10 },
    ])

    const aggregatedStats = totalStats[0] || {
      totalSales: 0,
      totalCommissions: 0,
      totalCount: 0,
    }

    console.log("Admin stats:", { aggregatedStats, userCount, planCount, salesByStatus })

    res.json({
      success: true,
      stats: {
        totalSales: aggregatedStats.totalCount,
        totalRevenue: aggregatedStats.totalSales,
        totalCommissions: aggregatedStats.totalCommissions,
        totalUsers: userCount,
        salesByStatus,
        topSellers,
      },
      planCount,
      topPlans,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    handleError(res, error, "Failed to fetch admin stats")
  }
})

app.get("/api/admin/sales", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    console.log("Fetching admin sales")
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    const { page = 1, limit = 20, status, sellerId, startDate, endDate } = req.query

    const query = { ...companyFilter }

    if (status) query.status = status
    if (sellerId) query.sellerId = sellerId
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    console.log("Admin sales query:", query)

    const sales = await Sale.find(query)
      .populate("sellerId", "name email commissionRate")
      .populate("planId", "name description")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Sale.countDocuments(query)

    console.log(`Found ${sales.length} admin sales out of ${total} total`)

    res.json({
      success: true,
      sales,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching admin sales:", error)
    handleError(res, error, "Failed to fetch admin sales")
  }
})


app.put("/api/admin/sales/:id/status", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const { status, notes, statusDate, ctoNumber, appointmentSlot } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    const validStatuses = ["pending", "pending_signature", "pending_appointment", "observed", "appointed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
        validValues: validStatuses,
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

    // Obtener el nombre del usuario que hace el cambio
    const currentUser = await User.findById(req.user.userId);
    const changedByName = currentUser ? currentUser.name : req.user.userId;

    const previousStatus = sale.status;
    
    // Para el historial siempre usar la fecha actual
    const historyDate = new Date();
    
    // Para appointedDate y completedDate, usar la fecha enviada con hora al mediodia
    // para evitar problemas de timezone
    let appointmentOrCompletionDate = new Date();
    if (statusDate) {
      // Parsear la fecha como local (no UTC) agregando hora al mediodia
      const [year, month, day] = statusDate.split('-').map(Number);
      appointmentOrCompletionDate = new Date(year, month - 1, day, 12, 0, 0);
    }

    sale.statusHistory.push({
      status,
      changedBy: changedByName,
      changedAt: historyDate,
      notes: notes || "",
    });

    sale.status = status;
    
    // Guardar fechas especificas segun el estado
    if (status === "appointed") {
      sale.appointedDate = appointmentOrCompletionDate;
      // Guardar horario del turno si se proporciona
      if (appointmentSlot) {
        sale.appointmentSlot = appointmentSlot;
      }
    } else if (status === "completed") {
      sale.completedDate = appointmentOrCompletionDate;
      // Guardar numero de CTO si se proporciona
      if (ctoNumber) {
        sale.ctoNumber = ctoNumber;
      }
    }

    // === CANCELAR venta ===
    if (status === "cancelled" && previousStatus !== "cancelled") {
      console.log("Cancelando venta. Plan y comisión a $0.");

      await User.findByIdAndUpdate(sale.sellerId, {
        $inc: {
          totalSales: -sale.planPrice,
          totalCommissions: -sale.commission,
        },
      });

      sale.planPrice = 0;
      sale.commission = 0;
    }

    // === REACTIVAR venta ===
    // Cuando se reactiva de cancelada, actualizar las fechas de estado segun el nuevo estado
if (previousStatus === "cancelled" && status !== "cancelled") {
  console.log("Reactivando venta. Consultando plan y vendedor...");

  const plan = await Plan.findById(sale.planId);
  const user = await User.findById(sale.sellerId);

  if (!plan || !user) {
    return res.status(500).json({
      success: false,
      error: "Missing plan or user to restore sale values",
    });
  }

  const restoredPlanPrice = plan.price;
  const restoredCommission = restoredPlanPrice * (user.commissionRate || 0.7);

  await User.findByIdAndUpdate(sale.sellerId, {
    $inc: {
      totalSales: restoredPlanPrice,
      totalCommissions: restoredCommission,
    },
  });

  sale.planPrice = restoredPlanPrice;
  sale.commission = restoredCommission;

  // IMPORTANTE: Actualizar la fecha del estado para que la venta aparezca en el mes correcto
  // Cuando se reactiva a turnada, la venta debe aparecer en el mes de la nueva fecha de turno
  // Cuando se reactiva a activada, la venta debe aparecer en el mes de la nueva fecha de activacion
  if (status === "appointed") {
    sale.appointedDate = appointmentOrCompletionDate;
    console.log(`Venta reactivada a TURNADA con fecha: ${appointmentOrCompletionDate}`);
  } else if (status === "completed") {
    sale.completedDate = appointmentOrCompletionDate;
    console.log(`Venta reactivada a ACTIVADA con fecha: ${appointmentOrCompletionDate}`);
  }

  console.log(`Venta reactivada con plan "${plan.name}" y comisión del vendedor: ${user.commissionRate}`);
}

    await sale.save();

    // Crear notificacion para el vendedor sobre el cambio de estado
    const statusLabels = {
  pending: "Cargada",
  pending_signature: "Pendiente de Firma",
  pending_appointment: "Pendiente de Turno",
  observed: "Observada",
  appointed: "Turnada",
  completed: "Instalada",
  cancelled: "Cancelada"
  };

    const sellerNotification = new Notification({
      title: "Estado de venta actualizado",
      message: `Tu venta de ${sale.planName} para ${sale.customerInfo.name} cambio a: ${statusLabels[status] || status}${notes ? `. Nota: ${notes}` : ""}`,
      type: "info",
      priority: status === "cancelled" ? "high" : "medium",
      recipients: [sale.sellerId],
      createdBy: req.user.userId,
    });
    await sellerNotification.save();

    // Notificar a todos los admins y supervisores sobre el cambio
    const adminsAndSupervisors = await User.find({ 
      role: { $in: ["admin", "supervisor"] },
      isActive: true,
      _id: { $ne: req.user.userId } // Excluir al que hizo el cambio
    });

    if (adminsAndSupervisors.length > 0) {
      const adminNotification = new Notification({
        title: "Cambio de estado en venta",
        message: `Venta de ${sale.sellerName} (${sale.planName}) cambio de ${statusLabels[previousStatus] || previousStatus} a ${statusLabels[status] || status}`,
        type: "info",
        priority: "low",
        recipients: adminsAndSupervisors.map(u => u._id),
        createdBy: req.user.userId,
      });
      await adminNotification.save();
    }

    // Responder inmediatamente con exito
    res.json({
      success: true,
      message: "Sale status updated successfully",
      sale,
    });

    // Enviar notificaciones de forma asincrona (no bloquean la respuesta)
    setImmediate(async () => {
      try {
        await enviarMensajeTelegram(
          `<b>Estado actualizado</b>\n` +
          `${statusLabels[previousStatus] || previousStatus} -> ${statusLabels[status] || status}\n` +
          `Cliente: ${sale.customerInfo.name}\n` +
          `Plan: ${sale.planName}\n` +
          `Vendedor: ${sale.sellerName}`
        );
      } catch (e) {
        console.error('Error enviando Telegram:', e.message);
      }

      try {
        await enviarEmailCambioEstado(sale, previousStatus, status, notes);
      } catch (e) {
        console.error('Error enviando email:', e.message);
      }
    });

  } catch (error) {
    handleError(res, error, "Failed to update sale status");
  }
});

// Actualizar costos de una venta (instalacion, admin, anuncio, comision vendedor)
app.put("/api/admin/sales/:id/costs", authenticateToken, async (req, res) => {
  try {
    const { installationCost, adminCost, adCost, sellerCommissionPaid } = req.body;
    const { id } = req.params;

    // Solo admin, supervisor y support pueden actualizar costos
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor" && currentUser.role !== "support")) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update sale costs",
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

  // Actualizar los costos
  // Si se coloca costo de instalacion por primera vez, guardar la fecha
  if (installationCost !== undefined) {
    const newInstallationCost = Number(installationCost);
    if (newInstallationCost > 0 && (!sale.installationCost || sale.installationCost === 0)) {
      sale.installationCostDate = new Date();
    }
    sale.installationCost = newInstallationCost;
  }
  if (adminCost !== undefined) sale.adminCost = Number(adminCost);
  if (adCost !== undefined) sale.adCost = Number(adCost);
  if (sellerCommissionPaid !== undefined) sale.sellerCommissionPaid = Number(sellerCommissionPaid);
  
  await sale.save();

    res.json({
      success: true,
      message: "Sale costs updated successfully",
      sale,
    });
  } catch (error) {
    handleError(res, error, "Failed to update sale costs");
  }
});

// Asignar/reasignar vendedor a una venta
app.put("/api/admin/sales/:id/assign", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: "Seller ID is required",
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

    const newSeller = await User.findById(sellerId);
    if (!newSeller || !newSeller.isActive) {
      return res.status(404).json({
        success: false,
        error: "Seller not found or inactive",
      });
    }

    const oldSellerId = sale.sellerId;
    const oldSellerName = sale.sellerName;

    // Obtener el nombre del usuario que hace el cambio
    const currentUserForAssign = await User.findById(req.user.userId);
    const changedByNameAssign = currentUserForAssign ? currentUserForAssign.name : req.user.userId;

    // Actualizar el vendedor
    sale.sellerId = newSeller._id;
    sale.sellerName = newSeller.name;

    // Agregar al historial de estados
    sale.statusHistory.push({
      status: sale.status,
      changedBy: changedByNameAssign,
      changedAt: new Date(),
      notes: `Venta asignada de ${oldSellerName} a ${newSeller.name}`,
    });

    await sale.save();

    // Si se cambio de vendedor, actualizar contadores
    if (oldSellerId.toString() !== newSeller._id.toString() && sale.status !== "cancelled") {
      // Quitar del vendedor anterior
      await User.findByIdAndUpdate(oldSellerId, {
        $inc: {
          totalSales: -sale.planPrice,
          totalCommissions: -sale.commission,
        },
      });

      // Agregar al nuevo vendedor
      await User.findByIdAndUpdate(newSeller._id, {
        $inc: {
          totalSales: sale.planPrice,
          totalCommissions: sale.commission,
        },
      });

      // Notificar al nuevo vendedor
      const assignmentNotification = new Notification({
        title: "Nueva venta asignada",
        message: `Se te ha asignado una venta del plan ${sale.planName} para el cliente ${sale.customerInfo.name}.`,
        type: "info",
        priority: "high",
        recipients: [newSeller._id],
        createdBy: req.user.userId,
      });
      await assignmentNotification.save();
    }

    res.json({
      success: true,
      message: "Sale assigned successfully",
      sale,
    });
  } catch (error) {
    handleError(res, error, "Failed to assign sale");
  }
});

// Supervisor puede asignar ventas propias a vendedores
app.put("/api/sales/:id/assign", authenticateToken, async (req, res) => {
  try {
    const { sellerId } = req.body;
    const { id } = req.params;
    const userId = req.user.userId;

    // Solo admins y supervisores pueden asignar
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para asignar ventas",
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: "Seller ID is required",
      });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

    // Si es supervisor, solo puede asignar sus propias ventas
    if (req.user.role === "supervisor" && sale.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Solo puedes asignar tus propias ventas",
      });
    }

    const newSeller = await User.findById(sellerId);
    if (!newSeller || !newSeller.isActive) {
      return res.status(404).json({
        success: false,
        error: "Seller not found or inactive",
      });
    }

    // Puede asignar a vendedores, supervisores o support
    const allowedRoles = ["seller", "supervisor", "support"];
    if (!allowedRoles.includes(newSeller.role)) {
      return res.status(400).json({
        success: false,
        error: "Solo puedes asignar a vendedores, supervisores o soporte",
      });
    }

    const oldSellerId = sale.sellerId;
    const oldSellerName = sale.sellerName;

    // Obtener el nombre del usuario que hace el cambio
    const currentUserForSupervisorAssign = await User.findById(userId);
    const changedByNameSupervisor = currentUserForSupervisorAssign ? currentUserForSupervisorAssign.name : userId;

    // Actualizar el vendedor (mantiene el supervisor como creador original)
    sale.sellerId = newSeller._id;
    sale.sellerName = newSeller.name;
    
    // Guardar quien es el supervisor que creo la venta (si no existe ya)
    if (!sale.supervisorId && req.user.role === "supervisor") {
      sale.supervisorId = userId;
    }

    // Agregar al historial de estados
    sale.statusHistory.push({
      status: sale.status,
      changedBy: changedByNameSupervisor,
      changedAt: new Date(),
      notes: `Venta asignada de ${oldSellerName} a ${newSeller.name}`,
    });

    await sale.save();

    // Si se cambio de vendedor, actualizar contadores
    if (oldSellerId.toString() !== newSeller._id.toString() && sale.status !== "cancelled") {
      // Quitar del vendedor anterior (si no es el supervisor)
      const oldSeller = await User.findById(oldSellerId);
      if (oldSeller && oldSeller.role === "seller") {
        await User.findByIdAndUpdate(oldSellerId, {
          $inc: {
            totalSales: -sale.planPrice,
            totalCommissions: -sale.commission,
          },
        });
      }

      // Agregar al nuevo vendedor
      await User.findByIdAndUpdate(newSeller._id, {
        $inc: {
          totalSales: sale.planPrice,
          totalCommissions: sale.commission,
        },
      });

      // Notificar al nuevo vendedor
      const assignmentNotification = new Notification({
        title: "Nueva venta asignada",
        message: `Se te ha asignado una venta del plan ${sale.planName} para el cliente ${sale.customerInfo.name}.`,
        type: "info",
        priority: "high",
        recipients: [newSeller._id],
        createdBy: userId,
      });
      await assignmentNotification.save();
    }

    res.json({
      success: true,
      message: "Sale assigned successfully",
      sale,
    });
  } catch (error) {
    handleError(error, res, "Failed to assign sale");
  }
});

// ============================================
// ENDPOINTS DE ARCHIVOS ADJUNTOS DE VENTAS
// ============================================

// Subir archivo adjunto a una venta
app.post("/api/sales/:id/attachments", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Venta no encontrada" });
    }

    // Verificar permisos:
    // - Admin y Support pueden adjuntar a cualquier venta
    // - Supervisor puede adjuntar a ventas de su equipo
    // - Seller solo puede adjuntar a sus propias ventas
    if (userRole === "seller" && sale.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Solo puedes adjuntar archivos a tus propias ventas",
      });
    }
    
    if (userRole === "supervisor") {
      const isSupervisorSale = sale.supervisorId?.toString() === userId || sale.sellerId.toString() === userId;
      if (!isSupervisorSale) {
        // Verificar si es venta de un vendedor de su equipo
        const seller = await User.findById(sale.sellerId);
        if (!seller || seller.supervisorId?.toString() !== userId) {
          return res.status(403).json({
            success: false,
            error: "Solo puedes adjuntar archivos a ventas de tu equipo",
          });
        }
      }
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No se recibio ningun archivo" });
    }

    const file = req.file;
    const uniqueName = `${Date.now()}_${file.originalname}`;
    
    // Almacenamiento local en VPS
    const uploadsDir = path.join(__dirname, 'uploads', 'sales');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const localPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(localPath, file.buffer);
    const fileUrl = `/uploads/sales/${uniqueName}`;

    const attachment = {
      _id: new mongoose.Types.ObjectId(),
      originalName: file.originalname,
      filename: uniqueName,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: userId,
    };

    // Inicializar array si no existe
    if (!sale.installationAttachments) {
      sale.installationAttachments = [];
    }
    
    sale.installationAttachments.push(attachment);
    await sale.save();

    // Agregar al historial
    const currentUser = await User.findById(userId);
    sale.statusHistory.push({
      status: sale.status,
      changedBy: currentUser ? currentUser.name : userId,
      changedAt: new Date(),
      notes: `Archivo adjuntado: ${file.originalname}`,
    });
    await sale.save();

    res.json({
      success: true,
      message: "Archivo subido correctamente",
      attachment,
      sale,
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    handleError(res, error, "Error al subir archivo");
  }
});

// Eliminar archivo adjunto de una venta
app.delete("/api/sales/:saleId/attachments/:attachmentId", authenticateToken, async (req, res) => {
  try {
    const { saleId, attachmentId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ success: false, error: "Venta no encontrada" });
    }

    // Verificar permisos (misma logica que para subir)
    if (userRole === "seller" && sale.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Solo puedes eliminar archivos de tus propias ventas",
      });
    }
    
    if (userRole === "supervisor") {
      const isSupervisorSale = sale.supervisorId?.toString() === userId || sale.sellerId.toString() === userId;
      if (!isSupervisorSale) {
        const seller = await User.findById(sale.sellerId);
        if (!seller || seller.supervisorId?.toString() !== userId) {
          return res.status(403).json({
            success: false,
            error: "Solo puedes eliminar archivos de ventas de tu equipo",
          });
        }
      }
    }

    if (!sale.installationAttachments || sale.installationAttachments.length === 0) {
      return res.status(404).json({ success: false, error: "No hay archivos adjuntos" });
    }

    const attachmentIndex = sale.installationAttachments.findIndex(
      (att) => att._id.toString() === attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ success: false, error: "Archivo no encontrado" });
    }

    const attachment = sale.installationAttachments[attachmentIndex];
    
    // Eliminar archivo fisico
    try {
      const filePath = path.join(__dirname, attachment.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.error("Error eliminando archivo fisico:", fsError);
    }

    // Eliminar del array
    sale.installationAttachments.splice(attachmentIndex, 1);
    
    // Agregar al historial
    const currentUser = await User.findById(userId);
    sale.statusHistory.push({
      status: sale.status,
      changedBy: currentUser ? currentUser.name : userId,
      changedAt: new Date(),
      notes: `Archivo eliminado: ${attachment.originalName}`,
    });
    
    await sale.save();

    res.json({
      success: true,
      message: "Archivo eliminado correctamente",
      sale,
    });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    handleError(res, error, "Error al eliminar archivo");
  }
});

// Endpoint para supervisores y admins: obtener lista de vendedores activos
app.get("/api/sellers", authenticateToken, async (req, res) => {
  try {
    // Solo admins y supervisores pueden ver la lista de vendedores
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para ver la lista de vendedores",
      });
    }

    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    
    const sellers = await User.find({ 
      ...companyFilter,
      role: "seller", 
      isActive: true,
    }).select("-password");

    res.json({
      success: true,
      sellers,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch sellers");
  }
});

app.get("/api/admin/plans", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    console.log("Fetching admin plans")

    const { page = 1, limit = 20 } = req.query
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    const plans = await Plan.find(companyFilter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Plan.countDocuments(companyFilter)

    console.log(`Found ${plans.length} admin plans out of ${total} total for company ${companyId}`)

    res.json({
      success: true,
      plans,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching admin plans:", error)
    handleError(res, error, "Failed to fetch admin plans")
  }
})

app.post("/api/admin/plans", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, features } = req.body
    const companyId = getCompanyId(req);

    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        error: "Name, description and price are required",
      })
    }

    const plan = new Plan({
      name,
      description,
      price: Number(price),
      features: features || [],
      createdBy: req.user.userId,
      companyId,
    })

    await plan.save()

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    })
  } catch (error) {
    handleError(res, error, "Failed to create plan")
  }
})

app.put("/api/admin/plans/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, features, isActive } = req.body

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { name, description, price: Number(price), features, isActive },
      { new: true, runValidators: true },
    )

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Plan not found",
      })
    }

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
    })
  } catch (error) {
    handleError(res, error, "Failed to update plan")
  }
})

app.delete("/api/admin/plans/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id)

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Plan not found",
      })
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    })
  } catch (error) {
    handleError(res, error, "Failed to delete plan")
  }
})

app.get("/api/admin/users", authenticateToken, requireAdminOrSupport, async (req, res) => {
  try {
    console.log("Fetching admin users")

    const { page = 1, limit = 20, isActive } = req.query
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);

    const usersQuery = { ...companyFilter }
    if (isActive !== undefined) {
      usersQuery.isActive = isActive === "true"
    }

    const users = await User.find(usersQuery)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const totalUsers = await User.countDocuments(usersQuery)

    console.log(`Found ${users.length} users out of ${totalUsers} total for company ${companyId}`)

    res.json({
      success: true,
      users,
      pagination: {
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: Number(page),
        total: totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch admin users")
  }
})

// Create user (Admin only)
app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body
    const companyId = getCompanyId(req);

    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      })
    }

    // Verificar si existe usuario con ese email en la misma empresa
    const existingUser = await User.findOne({ email, companyId })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email in this company",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      role: role || "seller",
      commissionRate: 0.3,
      companyId,
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        commissionRate: user.commissionRate,
        isActive: user.isActive,
        companyId: user.companyId,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to create user")
  }
})

app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, location, role, commissionRate, isActive, password, fixedCommissionPerSale } = req.body

    const updateData = {
      name,
      phone,
      location,
      isActive,
    }

    if (email) updateData.email = email
    if (role) updateData.role = role
    if (commissionRate !== undefined) updateData.commissionRate = Number(commissionRate)
    
    // Comision fija por venta (null = usa escala por tiers)
    if (fixedCommissionPerSale !== undefined) {
      updateData.fixedCommissionPerSale = fixedCommissionPerSale === null ? null : Number(fixedCommissionPerSale)
    }

    // Hash password if provided
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    })
  } catch (error) {
    handleError(res, error, "Failed to update user")
  }
})

app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    handleError(res, error, "Failed to delete user")
  }
})

// Notification Routes
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority, unreadOnly } = req.query
    const userId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    const query = {
      ...companyFilter,
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } }, // Global notifications
      ],
      isActive: true,
    }

    if (type) query.type = type
    if (priority) query.priority = priority
    if (unreadOnly === "true") {
      query["readBy.userId"] = { $ne: userId }
    }

    const notifications = await Notification.find(query)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      ...query,
      "readBy.userId": { $ne: userId },
    })

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch notifications")
  }
})

// NOTA: Este endpoint estaba duplicado - se usa el de mas abajo en linea ~7355 que es mas completo
// app.post("/api/notifications" ... comentado para evitar conflicto

app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      })
    }

    const alreadyRead = notification.readBy.some((read) => read.userId.toString() === req.user.userId.toString())

    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user.userId,
        readAt: new Date(),
      })
      await notification.save()
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    handleError(res, error, "Failed to mark notification as read")
  }
})

app.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    const query = {
      ...companyFilter,
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } }, // Global notifications
      ],
      isActive: true,
      "readBy.userId": { $ne: userId }, // Solo no leídas
    }

    const count = await Notification.countDocuments(query)

    res.json({
      success: true,
      count,
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch unread notifications count")
  }
})

// Chat Routes
app.get("/api/chat/rooms", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    const rooms = await ChatRoom.find({
      ...companyFilter,
      participants: userId,
      isActive: true,
    })
      .populate("participants", "name role")
      .populate("lastMessage")
      .populate("createdBy", "name role")
      .sort({ lastActivity: -1 })

    res.json({
      success: true,
      rooms,
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch chat rooms")
  }
})

app.post("/api/chat/rooms", authenticateToken, async (req, res) => {
  try {
    const { name, type, participants } = req.body
    const userId = req.user.userId
    const companyId = getCompanyId(req)

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: "Name and type are required",
      })
    }

    let roomParticipants = [userId]
    if (participants && Array.isArray(participants)) {
      roomParticipants = [...new Set([...roomParticipants, ...participants])]
    }

    const chatRoom = new ChatRoom({
      companyId,
      name,
      type,
      participants: roomParticipants,
      createdBy: userId,
    })

    await chatRoom.save()

    const populatedRoom = await ChatRoom.findById(chatRoom._id)
      .populate("participants", "name role")
      .populate("createdBy", "name role")

    res.status(201).json({
      success: true,
      message: "Chat room created successfully",
      room: populatedRoom,
    })
  } catch (error) {
    handleError(res, error, "Failed to create chat room")
  }
})

app.get("/api/chat/rooms/:roomId/messages", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const { page = 1, limit = 50 } = req.query
    const userId = req.user.userId

    // Verify user is participant
    const room = await ChatRoom.findById(roomId)
    if (!room || !room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this chat room",
      })
    }

    const messages = await Message.find({ chatRoom: roomId })
      .populate("sender", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Message.countDocuments({ chatRoom: roomId })

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch messages")
  }
})

app.post("/api/chat/rooms/:roomId/messages", authenticateToken, upload.array("attachments", 3), async (req, res) => {
  try {
    const { roomId } = req.params
    const { content, type } = req.body
    const userId = req.user.userId

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        error: "Message content or attachments are required",
      })
    }

    // Verify user is participant
    const room = await ChatRoom.findById(roomId)
    if (!room || !room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this chat room",
      })
    }

    const attachments =
      req.files?.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      })) || []

    const message = new Message({
      chatRoom: roomId,
      sender: userId,
      content: content || "",
      type: type || "text",
      attachments,
    })

    await message.save()

    // Update room last activity and last message
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastActivity: new Date(),
    })

    const populatedMessage = await Message.findById(message._id).populate("sender", "name role")

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    })
  } catch (error) {
    handleError(res, error, "Failed to send message")
  }
})

app.get('/api/notifications/attachment/:notificationId/:filename', authenticateToken, async (req, res) => {
  try {
    const { notificationId, filename } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ error: "Notificación no encontrada" });

    // Buscar attachment que coincida con filename
    const attachment = notification.attachments.find(a => {
      try {
        const urlObj = new URL(a.url);
        const pathname = urlObj.pathname;
        const pathParts = pathname.split('/');
        const fileNameFromUrl = pathParts[pathParts.length - 1];
        return fileNameFromUrl === filename;
      } catch {
        return false;
      }
    });

    if (!attachment) return res.status(404).json({ error: "Attachment no encontrado" });

    // Redirigir directo a la URL pública fija
    res.redirect(attachment.url);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});



app.get("/api/chat/private/:userId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId
    const targetUserId = req.params.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        error: "Cannot create private chat with yourself",
      })
    }

    // Check if private room already exists
    let room = await ChatRoom.findOne({
      ...companyFilter,
      type: "private",
      participants: { $all: [currentUserId, targetUserId], $size: 2 },
    })
      .populate("participants", "name role")
      .populate("lastMessage")

if (!room) {
      // Create new private room
      const targetUser = await User.findById(targetUserId)
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: "Target user not found",
        })
      }

      room = new ChatRoom({
        companyId,
        name: `Private chat`,
        type: "private",
        participants: [currentUserId, targetUserId],
        createdBy: currentUserId,
      })

      await room.save()

      room = await ChatRoom.findById(room._id).populate("participants", "name role").populate("lastMessage")
    }

    res.json({
      success: true,
      room,
    })
  } catch (error) {
    handleError(res, error, "Failed to get or create private chat")
  }
})

// Specific Chat Routes for Frontend Compatibility
app.get("/api/chat/group", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    // Find or create group chat room
    let groupRoom = await ChatRoom.findOne({
      ...companyFilter,
      type: "group",
      name: "Equipo de Ventas",
    }).populate("participants", "name role")

if (!groupRoom) {
      // Create group chat room with all users from this company
      const allUsers = await User.find({ ...companyFilter, isActive: true }).select("_id")
      const participantIds = allUsers.map((user) => user._id)

      groupRoom = new ChatRoom({
        companyId,
        name: "Equipo de Ventas",
        type: "group",
        participants: participantIds,
        createdBy: userId,
      })

      await groupRoom.save()

      groupRoom = await ChatRoom.findById(groupRoom._id).populate("participants", "name role")
    } else {
      // Add user to group if not already a participant
      if (!groupRoom.participants.some((p) => p._id.toString() === userId.toString())) {
        groupRoom.participants.push(userId)
        await groupRoom.save()
        groupRoom = await ChatRoom.findById(groupRoom._id).populate("participants", "name role")
      }
    }

    res.json({
      success: true,
      chatRoom: groupRoom,
    })
  } catch (error) {
    handleError(res, error, "Failed to get group chat")
  }
})

app.get("/api/chat/private-admin", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    if (req.user.role === "admin") {
      return res.status(400).json({
        success: false,
        error: "Admins should use private-chats endpoint",
      })
    }

    // Find admin user from same company
    const admin = await User.findOne({ ...companyFilter, role: "admin" })
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "No admin found",
      })
    }

    // Find or create private chat with admin
    let privateRoom = await ChatRoom.findOne({
      ...companyFilter,
      type: "private",
      participants: { $all: [userId, admin._id], $size: 2 },
    }).populate("participants", "name role")

    if (!privateRoom) {
      privateRoom = new ChatRoom({
        companyId,
        name: "Chat con Admin",
        type: "private",
        participants: [userId, admin._id],
        createdBy: userId,
      })

      await privateRoom.save()
      privateRoom = await ChatRoom.findById(privateRoom._id).populate("participants", "name role")
    }

    res.json({
      success: true,
      chatRoom: privateRoom,
    })
  } catch (error) {
    handleError(res, error, "Failed to get private chat with admin")
  }
})

app.get("/api/chat/private-chats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.userId
    const companyId = getCompanyId(req)
    const companyFilter = getCompanyFilter(companyId)

    // Get all private chats where admin is a participant
    const privateChats = await ChatRoom.find({
      ...companyFilter,
      type: "private",
      participants: adminId,
    })
      .populate("participants", "name role email")
      .populate("lastMessage")
      .sort({ lastActivity: -1 })

    res.json({
      success: true,
      chatRooms: privateChats,
    })
  } catch (error) {
    handleError(res, error, "Failed to get private chats")
  }
})

// Update existing message routes to match frontend expectations
app.get("/api/chat/:chatRoomId/messages", authenticateToken, async (req, res) => {
  try {
    const { chatRoomId } = req.params
    const { page = 1, limit = 50 } = req.query
    const userId = req.user.userId

    // Verify user is participant
    const room = await ChatRoom.findById(chatRoomId)
    if (!room || !room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this chat room",
      })
    }

    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 }) // Ascending order for chat
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Message.countDocuments({ chatRoom: chatRoomId })

    res.json({
      success: true,
      messages,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch messages")
  }
})

app.post("/api/chat/:chatRoomId/messages", authenticateToken, async (req, res) => {
  try {
    const { chatRoomId } = req.params
    const { content } = req.body
    const userId = req.user.userId

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message content is required",
      })
    }

    // Verify user is participant
    const room = await ChatRoom.findById(chatRoomId)
    if (!room || !room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this chat room",
      })
    }

    const message = new Message({
      chatRoom: chatRoomId,
      sender: userId,
      content: content.trim(),
      type: "text",
    })

    await message.save()

    // Update room last activity and last message
    await ChatRoom.findByIdAndUpdate(chatRoomId, {
      lastMessage: message._id,
      lastActivity: new Date(),
    })

    const populatedMessage = await Message.findById(message._id).populate("sender", "name role")

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    })
  } catch (error) {
    handleError(res, error, "Failed to send message")
  }
})

app.put("/api/chat/:chatRoomId/read", authenticateToken, async (req, res) => {
  try {
    const { chatRoomId } = req.params
    const userId = req.user.userId

    // Mark all messages in this chat as read by this user
    await Message.updateMany(
      {
        chatRoom: chatRoomId,
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId: userId,
            readAt: new Date(),
          },
        },
      },
    )

    res.json({
      success: true,
      message: "Messages marked as read",
    })
  } catch (error) {
    handleError(res, error, "Failed to mark messages as read")
  }
})

// ==================== SUPERVISOR AD COSTS ENDPOINTS ====================

// Obtener todos los costos de anuncio (solo admin)
app.get("/api/admin/ad-costs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Solo los administradores pueden ver todos los costos de anuncio",
      });
    }

    const { month, supervisorId } = req.query;
    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    const filter = { ...companyFilter };
    
    if (month) filter.month = month;
    if (supervisorId) filter.supervisorId = supervisorId;

    const adCosts = await SupervisorAdCost.find(filter)
      .populate("supervisorId", "name email")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ month: -1, createdAt: -1 });

    res.json({
      success: true,
      adCosts,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch ad costs");
  }
});

// Crear o actualizar costo de anuncio (solo admin)
app.post("/api/admin/ad-costs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Solo los administradores pueden crear costos de anuncio",
      });
    }

    const { supervisorId, amount, month, notes } = req.body;

    if (!supervisorId || amount === undefined || !month) {
      return res.status(400).json({
        success: false,
        error: "Se requiere supervisorId, amount y month",
      });
    }

    // Verificar que el supervisor existe y es supervisor
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(404).json({
        success: false,
        error: "Supervisor no encontrado o no es un supervisor",
      });
    }

    // Buscar si ya existe un registro para este supervisor/mes
    let adCost = await SupervisorAdCost.findOne({ supervisorId, month });

    if (adCost) {
      // Actualizar existente
      adCost.amount = amount;
      adCost.notes = notes || adCost.notes;
      adCost.updatedBy = req.user.userId;
      await adCost.save();
    } else {
      // Crear nuevo
      adCost = new SupervisorAdCost({
        supervisorId,
        amount,
        month,
        notes,
        createdBy: req.user.userId,
        updatedBy: req.user.userId,
      });
      await adCost.save();
    }

    // Obtener datos populados
    const populatedAdCost = await SupervisorAdCost.findById(adCost._id)
      .populate("supervisorId", "name email")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    res.json({
      success: true,
      message: adCost.isNew ? "Costo de anuncio creado" : "Costo de anuncio actualizado",
      adCost: populatedAdCost,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Ya existe un costo de anuncio para este supervisor y mes",
      });
    }
    handleError(res, error, "Failed to create/update ad cost");
  }
});

// Eliminar costo de anuncio (solo admin)
app.delete("/api/admin/ad-costs/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Solo los administradores pueden eliminar costos de anuncio",
      });
    }

    const { id } = req.params;
    const adCost = await SupervisorAdCost.findByIdAndDelete(id);

    if (!adCost) {
      return res.status(404).json({
        success: false,
        error: "Costo de anuncio no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Costo de anuncio eliminado",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete ad cost");
  }
});

// Obtener costos de anuncio de un supervisor (para el propio supervisor)
app.get("/api/ad-costs/my", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Solo los supervisores pueden ver sus costos de anuncio",
      });
    }

    const { month } = req.query;
    const filter = { supervisorId: req.user.userId };
    if (month) filter.month = month;

    const adCosts = await SupervisorAdCost.find(filter)
      .sort({ month: -1 });

    res.json({
      success: true,
      adCosts,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch my ad costs");
  }
});

// ==================== LEADS API ====================

// Obtener todos los leads (admin/supervisor)
app.get("/api/leads", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin or Supervisor role required.",
      });
    }

    const { status, assignedTo, source, month } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (source) filter.source = source;
    
    // Filtro por mes
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leads,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch leads");
  }
});

// Obtener leads asignados al vendedor actual
app.get("/api/leads/my", authenticateToken, async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = { assignedTo: req.user.userId };

    if (status) filter.status = status;
    if (source) filter.source = source;

    const leads = await Lead.find(filter)
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price")
      .sort({ nextFollowUp: 1, createdAt: -1 });

    res.json({
      success: true,
      leads,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch my leads");
  }
});

// Obtener un lead por ID
app.get("/api/leads/:id", authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price")
      .populate("contactHistory.recordedBy", "name")
      .populate("convertedToSaleId");

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    // Verificar acceso: admin/supervisor pueden ver todos, vendedor solo los suyos
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      if (lead.assignedTo._id.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch lead");
  }
});

// Crear un nuevo lead (admin/supervisor)
app.post("/api/leads", authenticateToken, async (req, res) => {
  try {
    console.log("[POST /api/leads] Request body:", JSON.stringify(req.body, null, 2));
    
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin or Supervisor role required.",
      });
    }

    const {
      name,
      phone,
      email,
      dni,
      address,
      source,
      sourceDetail,
      assignedTo,
      priority,
      interestedPlanId,
      notes,
    } = req.body;

    // Validar campos requeridos
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Lead name is required",
        message: "El nombre del lead es obligatorio",
      });
    }
    
    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        error: "Phone is required",
        message: "El telefono es obligatorio",
      });
    }
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: "AssignedTo is required",
        message: "Debe asignar el lead a un vendedor",
      });
    }

    // Validar que el vendedor asignado existe y es vendedor activo
    const seller = await User.findById(assignedTo);
    if (!seller || seller.role !== "seller" || !seller.isActive) {
      return res.status(400).json({
        success: false,
        error: "Invalid or inactive seller",
      });
    }

    // Obtener nombre del plan si se especifica (validar que sea un ObjectId valido)
    let interestedPlanName = null;
    let validPlanId = null;
    if (interestedPlanId && interestedPlanId.trim() !== "" && mongoose.Types.ObjectId.isValid(interestedPlanId)) {
      const plan = await Plan.findById(interestedPlanId);
      if (plan) {
        interestedPlanName = plan.name;
        validPlanId = interestedPlanId;
      }
    }

    const lead = new Lead({
      name: name?.trim(),
      phone: phone?.trim(),
      email: email?.trim() || undefined,
      dni: dni?.trim() || undefined,
      address: address && Object.values(address).some(v => v && v.trim()) ? address : undefined,
      source: source || "otro",
      sourceDetail: sourceDetail?.trim() || undefined,
      assignedTo,
      assignedBy: req.user.userId,
      priority: priority || "media",
      interestedPlanId: validPlanId || undefined,
      interestedPlanName: interestedPlanName || undefined,
      notes: notes?.trim() || undefined,
      status: "nuevo",
    });

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price");

    // Crear notificacion para el vendedor asignado
    try {
      const seller = await User.findById(assignedTo);
      const assigner = await User.findById(req.user.userId);
      
      if (seller) {
        // Crear notificacion en el sistema
        const notification = new Notification({
          title: "Nuevo lead asignado",
          message: `Se te ha asignado un nuevo lead: ${name}. Telefono: ${phone}. Prioridad: ${priority || "media"}.`,
          type: "info",
          priority: priority === "urgente" ? "urgent" : priority === "alta" ? "high" : "medium",
          recipients: [assignedTo],
          createdBy: req.user.userId,
        });
        await notification.save();
        
        // Enviar email al vendedor
        await enviarEmailNuevoLead(lead, seller, assigner);
        
        console.log(`Notificacion y email enviados al vendedor ${seller.name} por nuevo lead`);
      }
    } catch (notifError) {
      console.error("Error creando notificacion de lead:", notifError.message);
      // No fallamos el request si falla la notificacion
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: populatedLead,
    });
  } catch (error) {
    handleError(res, error, "Failed to create lead");
  }
});

// Actualizar un lead (admin/supervisor)
app.put("/api/leads/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin or Supervisor role required.",
      });
    }

    const {
      name,
      phone,
      email,
      dni,
      address,
      source,
      sourceDetail,
      assignedTo,
      priority,
      interestedPlanId,
      notes,
      status,
      nextFollowUp,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (dni !== undefined) updateData.dni = dni;
    if (address) updateData.address = address;
    if (source) updateData.source = source;
    if (sourceDetail !== undefined) updateData.sourceDetail = sourceDetail;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (nextFollowUp !== undefined) updateData.nextFollowUp = nextFollowUp;

    // Si se reasigna el vendedor
    if (assignedTo) {
      const seller = await User.findById(assignedTo);
      if (!seller || seller.role !== "seller" || !seller.isActive) {
        return res.status(400).json({
          success: false,
          error: "Invalid or inactive seller",
        });
      }
      updateData.assignedTo = assignedTo;
    }

    // Actualizar plan de interes (validar que sea un ObjectId valido)
    if (interestedPlanId !== undefined) {
      if (interestedPlanId && interestedPlanId.trim() !== "" && mongoose.Types.ObjectId.isValid(interestedPlanId)) {
        const plan = await Plan.findById(interestedPlanId);
        if (plan) {
          updateData.interestedPlanId = interestedPlanId;
          updateData.interestedPlanName = plan.name;
        }
      } else {
        updateData.interestedPlanId = null;
        updateData.interestedPlanName = null;
      }
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price");

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    handleError(res, error, "Failed to update lead");
  }
});

// Agregar interaccion/contacto al historial (vendedor puede usar esto)
app.post("/api/leads/:id/contact", authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    // Verificar acceso
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      if (lead.assignedTo.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    const { type, notes, outcome, nextAction, nextActionDate } = req.body;

    if (!type || !outcome) {
      return res.status(400).json({
        success: false,
        error: "Type and outcome are required",
      });
    }

    // Agregar al historial
    lead.contactHistory.push({
      type,
      notes,
      outcome,
      nextAction,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
      recordedBy: req.user.userId,
      date: new Date(),
    });

    // Actualizar estado segun outcome
    const statusMap = {
      contactado: "contactado",
      no_contesta: "no_contesta",
      interesado: "interesado",
      no_interesado: "no_interesado",
      agendar_seguimiento: "seguimiento",
      cerrar: lead.status, // No cambia automaticamente
    };

    if (statusMap[outcome] && outcome !== "cerrar") {
      lead.status = statusMap[outcome];
    }

    // Actualizar fecha de proximo seguimiento si se especifica
    if (nextActionDate) {
      lead.nextFollowUp = new Date(nextActionDate);
    }

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price")
      .populate("contactHistory.recordedBy", "name");

    res.json({
      success: true,
      message: "Contact recorded successfully",
      lead: populatedLead,
    });
  } catch (error) {
    handleError(res, error, "Failed to record contact");
  }
});

// Actualizar estado del lead (vendedor puede actualizar estado de sus leads)
app.put("/api/leads/:id/status", authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    // Verificar acceso
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      if (lead.assignedTo.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    lead.status = status;

    // Agregar nota al historial si se proporciona
    if (notes) {
      lead.contactHistory.push({
        type: "otro",
        notes: `Cambio de estado a ${status}: ${notes}`,
        outcome: status === "cerrado_ganado" || status === "cerrado_perdido" ? "cerrar" : "contactado",
        recordedBy: req.user.userId,
        date: new Date(),
      });
    }

    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name")
      .populate("interestedPlanId", "name price");

    res.json({
      success: true,
      message: "Lead status updated",
      lead: populatedLead,
    });
  } catch (error) {
    handleError(res, error, "Failed to update lead status");
  }
});

// Convertir lead a venta
app.post("/api/leads/:id/convert", authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    // Verificar acceso
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      if (lead.assignedTo.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    if (lead.status === "cerrado_ganado" && lead.convertedToSaleId) {
      return res.status(400).json({
        success: false,
        error: "Lead already converted to sale",
        saleId: lead.convertedToSaleId,
      });
    }

    // Retornar datos prellenados para crear la venta
    res.json({
      success: true,
      message: "Lead data ready for conversion",
      leadData: {
        leadId: lead._id,
        sellerId: lead.assignedTo,
        customerInfo: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || "",
          dni: lead.dni || "",
          address: lead.address || {},
        },
        interestedPlanId: lead.interestedPlanId,
        interestedPlanName: lead.interestedPlanName,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to prepare lead conversion");
  }
});

// Marcar lead como convertido (llamado despues de crear la venta)
app.put("/api/leads/:id/mark-converted", authenticateToken, async (req, res) => {
  try {
    const { saleId } = req.body;

    if (!saleId) {
      return res.status(400).json({
        success: false,
        error: "Sale ID is required",
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: "cerrado_ganado",
        convertedToSaleId: saleId,
        convertedAt: new Date(),
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead marked as converted",
      lead,
    });
  } catch (error) {
    handleError(res, error, "Failed to mark lead as converted");
  }
});

// Eliminar lead (solo admin)
app.delete("/api/leads/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin role required.",
      });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete lead");
  }
});

// Estadisticas de leads (admin/supervisor)
app.get("/api/leads/stats/summary", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const { month, assignedTo } = req.query;
    const filter = {};

    if (assignedTo) filter.assignedTo = assignedTo;

    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const stats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalLeads = await Lead.countDocuments(filter);

    // Calcular tasas de conversion
    const statusCounts = {};
    stats.forEach((s) => {
      statusCounts[s._id] = s.count;
    });

    const conversionRate = totalLeads > 0
      ? ((statusCounts.cerrado_ganado || 0) / totalLeads * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        total: totalLeads,
        byStatus: statusCounts,
        conversionRate: parseFloat(conversionRate),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch lead stats");
  }
});

// ========================================
// RUTAS DE TUPAGINAYA - Sistema Multi-Empresa
// ========================================
  
// Middleware para obtener companyId del header
// Default es "prosegur" (empresa original del Grupo JV)
const getCompanyId = (req) => {
  const companyId = req.headers['x-company-id'] || 'prosegur';
  // Compatibilidad: si viene "tusventas" lo tratamos como "prosegur"
  return companyId === 'tusventas' ? 'prosegur' : companyId;
};

// Helper para crear filtro de companyId que incluye datos legacy (sin companyId)
// Los datos antiguos no tienen companyId, por eso los incluimos para "prosegur"
const getCompanyFilter = (companyId) => {
  if (companyId === 'prosegur') {
    // Para Prosegur, incluir datos sin companyId (legacy) o con companyId = prosegur
    return { $or: [{ companyId: 'prosegur' }, { companyId: { $exists: false } }, { companyId: null }, { companyId: '' }] };
  }
  // Para otras empresas, solo datos con su companyId específico
  return { companyId };
};

// --- RUTAS DE CLIENTES ---

// Obtener todos los clientes
app.get("/api/clients", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { status, sellerId } = req.query;
    
    const filter = { companyId };
    if (status) filter.status = status;
    if (sellerId) filter.sellerId = sellerId;
    
    // Si es vendedor, solo ve sus clientes
    if (req.user.role === "seller") {
      filter.sellerId = req.user.userId;
    }
    
    const clients = await Client.find(filter)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, clients });
  } catch (error) {
    handleError(res, error, "Failed to fetch clients");
  }
});

// Crear cliente
app.post("/api/clients", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    const client = new Client({
      ...req.body,
      companyId,
      sellerId: req.body.sellerId || req.user.userId,
    });
    
    await client.save();
    
    const populatedClient = await Client.findById(client._id)
      .populate("sellerId", "name email");
    
    res.status(201).json({ success: true, client: populatedClient });
  } catch (error) {
    handleError(res, error, "Failed to create client");
  }
});

// Actualizar cliente
app.put("/api/clients/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("sellerId", "name email");
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to update client");
  }
});

// Estadisticas de clientes
app.get("/api/clients/stats", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    const stats = await Client.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalMonthly: { $sum: "$monthlyPrice" },
        },
      },
    ]);
    
    const statusCounts = {};
    let totalRevenue = 0;
    
    stats.forEach((s) => {
      statusCounts[s._id] = s.count;
      if (s._id === "web_activada") {
        totalRevenue = s.totalMonthly;
      }
    });
    
    res.json({
      success: true,
      stats: {
        byStatus: statusCounts,
        totalActiveRevenue: totalRevenue,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch client stats");
  }
});

// --- RUTAS DE COBRANZAS/PAGOS ---

// Obtener panel de cobranzas (clientes con pagos pendientes)
app.get("/api/collections", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    // Obtener clientes activos
    const activeClients = await Client.find({
      companyId,
      status: "web_activada",
    }).populate("sellerId", "name email");
    
    // Para cada cliente, calcular dias de mora
    const today = new Date();
    const collections = activeClients.map((client) => {
      const activationDate = client.activationDate || client.createdAt;
      const billingDay = client.billingDay || 1;
      
      // Calcular ultima fecha de corte
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let lastBillingDate = new Date(currentYear, currentMonth, billingDay);
      
      if (lastBillingDate > today) {
        lastBillingDate = new Date(currentYear, currentMonth - 1, billingDay);
      }
      
      // Calcular dias de mora
      const daysSinceBilling = Math.floor((today - lastBillingDate) / (1000 * 60 * 60 * 24));
      
      return {
        client: client.toObject(),
        daysOverdue: daysSinceBilling > 0 ? daysSinceBilling : 0,
        lastBillingDate,
        amountDue: client.monthlyPrice,
      };
    });
    
    // Ordenar por dias de mora descendente
    collections.sort((a, b) => b.daysOverdue - a.daysOverdue);
    
    res.json({ success: true, collections });
  } catch (error) {
    handleError(res, error, "Failed to fetch collections");
  }
});

// Registrar pago de cliente
app.post("/api/clients/:id/payments", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    const payment = new Payment({
      companyId,
      clientId: client._id,
      amount: req.body.amount,
      period: req.body.period,
      paymentMethod: req.body.paymentMethod || "transferencia",
      status: "pagado",
      paymentDate: req.body.paymentDate || new Date(),
      notes: req.body.notes,
      recordedBy: req.user.userId,
    });
    
    await payment.save();
    
    // Crear transaccion de ingreso
    const transaction = new Transaction({
      companyId,
      type: "ingreso",
      category: "Pago mensualidad",
      amount: payment.amount,
      description: `Pago de ${client.name} - ${payment.period}`,
      clientId: client._id,
      paymentId: payment._id,
      recordedBy: req.user.userId,
    });
    
    await transaction.save();
    
    res.status(201).json({ success: true, payment, transaction });
  } catch (error) {
    handleError(res, error, "Failed to record payment");
  }
});

// Obtener historial de pagos de un cliente
app.get("/api/clients/:id/payments", authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ clientId: req.params.id })
      .populate("recordedBy", "name")
      .sort({ paymentDate: -1 });
    
    res.json({ success: true, payments });
  } catch (error) {
    handleError(res, error, "Failed to fetch payments");
  }
});

// Enviar recordatorio de pago
app.post("/api/collections/send-reminder/:clientId", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    const { type } = req.body; // "5_dias", "15_dias", "30_dias", "manual"
    
    // Enviar email de recordatorio
    let emailSent = false;
    let emailError = null;
    
    if (transporter && client.email) {
      try {
        await transporter.sendMail({
          from: `"TuPaginaYa" <${process.env.EMAIL_SMTP}>`,
          to: client.email,
          subject: `Recordatorio de pago - ${client.businessName || client.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">TuPaginaYa</h1>
              </div>
              <div style="padding: 30px; background-color: #f8f9fa;">
                <h2>Hola ${client.name},</h2>
                <p>Te recordamos que tienes un pago pendiente por tu servicio web.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Monto:</strong> $${client.monthlyPrice}</p>
                  <p><strong>Servicio:</strong> ${client.domain || 'Tu pagina web'}</p>
                </div>
                <p>Por favor, realiza el pago a la brevedad para evitar la suspension del servicio.</p>
                <p>Si ya realizaste el pago, por favor ignora este mensaje.</p>
              </div>
              <div style="background-color: #1a1a2e; padding: 15px; text-align: center;">
                <small style="color: #888;">TuPaginaYa - Grupo JV</small>
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (error) {
        emailError = error.message;
      }
    }
    
    // Registrar recordatorio
    const reminder = new PaymentReminder({
      companyId: "tupaginaya",
      clientId: client._id,
      type,
      sentBy: req.user.userId,
      emailSent,
      emailError,
    });
    
    await reminder.save();
    
    res.json({ success: true, reminder, emailSent });
  } catch (error) {
    handleError(res, error, "Failed to send reminder");
  }
});

// --- RUTAS DE TRANSACCIONES ---

// Obtener transacciones
app.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { type, month, category } = req.query;
    
    const filter = { companyId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const transactions = await Transaction.find(filter)
      .populate("clientId", "name businessName")
      .populate("recordedBy", "name")
      .sort({ date: -1 });
    
    res.json({ success: true, transactions });
  } catch (error) {
    handleError(res, error, "Failed to fetch transactions");
  }
});

// Crear transaccion
app.post("/api/transactions", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "supervisor") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    const companyId = getCompanyId(req);
    
    const transaction = new Transaction({
      ...req.body,
      companyId,
      recordedBy: req.user.userId,
    });
    
    await transaction.save();
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("clientId", "name businessName")
      .populate("recordedBy", "name");
    
    res.status(201).json({ success: true, transaction: populatedTransaction });
  } catch (error) {
    handleError(res, error, "Failed to create transaction");
  }
});

// Resumen financiero
app.get("/api/transactions/summary", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { month } = req.query;
    
    const filter = { companyId };
    
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const result = {
      ingresos: 0,
      egresos: 0,
      balance: 0,
    };
    
    summary.forEach((s) => {
      if (s._id === "ingreso") result.ingresos = s.total;
      if (s._id === "egreso") result.egresos = s.total;
    });
    
    result.balance = result.ingresos - result.egresos;
    
    res.json({ success: true, summary: result });
  } catch (error) {
    handleError(res, error, "Failed to fetch summary");
  }
});

// Eliminar transaccion
app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Solo los administradores pueden eliminar transacciones" });
    }
    
    const { id } = req.params;
    const companyId = getCompanyId(req);
    
    const transaction = await Transaction.findOneAndDelete({ _id: id, companyId });
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaccion no encontrada" });
    }
    
    res.json({ success: true, message: "Transaccion eliminada correctamente" });
  } catch (error) {
    handleError(res, error, "Failed to delete transaction");
  }
});

// --- RUTAS DE LIQUIDACIONES ---

// Obtener liquidaciones
app.get("/api/liquidations", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { userId, period, status } = req.query;
    
    const filter = { companyId };
    if (userId) filter.userId = userId;
    if (period) filter.period = period;
    if (status) filter.status = status;
    
    const liquidations = await Liquidation.find(filter)
      .populate("userId", "name email")
      .populate("paidBy", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, liquidations });
  } catch (error) {
    handleError(res, error, "Failed to fetch liquidations");
  }
});

// Crear liquidacion
app.post("/api/liquidations", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    const companyId = getCompanyId(req);
    
    const liquidation = new Liquidation({
      ...req.body,
      companyId,
      createdBy: req.user.userId,
    });
    
    await liquidation.save();
    
    const populatedLiquidation = await Liquidation.findById(liquidation._id)
      .populate("userId", "name email")
      .populate("createdBy", "name");
    
    res.status(201).json({ success: true, liquidation: populatedLiquidation });
  } catch (error) {
    handleError(res, error, "Failed to create liquidation");
  }
});

// Marcar liquidacion como pagada
app.put("/api/liquidations/:id/pay", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    
    const liquidation = await Liquidation.findByIdAndUpdate(
      req.params.id,
      {
        status: "pagado",
        paidAt: new Date(),
        paidBy: req.user.userId,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
      },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("paidBy", "name");
    
    if (!liquidation) {
      return res.status(404).json({ success: false, error: "Liquidation not found" });
    }
    
    // Crear transaccion de egreso
    const companyId = getCompanyId(req);
    const transaction = new Transaction({
      companyId,
      type: "egreso",
      category: "Liquidacion vendedor",
      amount: liquidation.totalAmount,
      description: `Liquidacion ${liquidation.period} - ${liquidation.userId.name}`,
      recordedBy: req.user.userId,
    });
    
    await transaction.save();
    
    res.json({ success: true, liquidation });
  } catch (error) {
    handleError(res, error, "Failed to pay liquidation");
  }
});

// --- RUTAS DE ADELANTOS (ADVANCES) ---

// Admin: Obtener todos los adelantos
app.get("/api/admin/advances", authenticateToken, async (req, res) => {
  try {
    // Solo admin puede ver todos los adelantos
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const companyId = getCompanyId(req);
    const companyFilter = getCompanyFilter(companyId);
    const { month, userId } = req.query;

    const query = { ...companyFilter };
    if (month) query.month = month;
    if (userId) query.userId = userId;

    const advances = await Advance.find(query)
      .populate("userId", "name email role")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, advances });
  } catch (error) {
    handleError(res, error, "Failed to fetch advances");
  }
});

// Admin: Crear un adelanto
app.post("/api/admin/advances", authenticateToken, async (req, res) => {
  try {
    // Solo admin puede crear adelantos
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const { userId, amount, date, month, reason } = req.body;

    if (!userId || !amount || !date || !month || !reason) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "userId, amount, date, month and reason are required",
      });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const companyId = getCompanyId(req);

    const advance = new Advance({
      companyId,
      userId,
      amount,
      date: new Date(date),
      month,
      reason,
      createdBy: req.user.userId,
    });

    await advance.save();

    // Populate para devolver datos completos
    await advance.populate("userId", "name email role");
    await advance.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      message: "Advance created successfully",
      advance,
    });
  } catch (error) {
    handleError(res, error, "Failed to create advance");
  }
});

// Admin: Eliminar un adelanto
app.delete("/api/admin/advances/:id", authenticateToken, async (req, res) => {
  try {
    // Solo admin puede eliminar adelantos
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const { id } = req.params;

    const advance = await Advance.findByIdAndDelete(id);
    if (!advance) {
      return res.status(404).json({ success: false, error: "Advance not found" });
    }

    res.json({ success: true, message: "Advance deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete advance");
  }
});

// Usuario: Obtener mis adelantos
app.get("/api/advances/my", authenticateToken, async (req, res) => {
  try {
    const { month } = req.query;

    const query = { userId: req.user.userId };
    if (month) query.month = month;

    const advances = await Advance.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, advances });
  } catch (error) {
    handleError(res, error, "Failed to fetch advances");
  }
});

// --- RUTAS DE CLIENTES (TuPaginaYa) ---

// Obtener todos los clientes (admin)
app.get("/api/clients", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { status, sellerId } = req.query;
    
    const filter = { companyId };
    if (status) filter.status = status;
    if (sellerId) filter.sellerId = sellerId;
    
    const clients = await Client.find(filter)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, clients });
  } catch (error) {
    handleError(res, error, "Failed to fetch clients");
  }
});

// Obtener mis clientes (vendedor)
app.get("/api/clients/my", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { status } = req.query;
    
    const filter = { 
      companyId,
      sellerId: req.user.userId 
    };
    if (status) filter.status = status;
    
    const clients = await Client.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({ success: true, clients });
  } catch (error) {
    handleError(res, error, "Failed to fetch my clients");
  }
});

// Obtener un cliente por ID
app.get("/api/clients/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("sellerId", "name email");
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to fetch client");
  }
});

// Crear una nueva demo (cliente en estado demo_pendiente)
app.post("/api/clients/demo", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    const client = new Client({
      ...req.body,
      companyId,
      sellerId: req.user.userId,
      status: "demo_pendiente",
    });
    
    await client.save();
    
    res.status(201).json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to create demo");
  }
});

// Actualizar cliente
app.put("/api/clients/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("sellerId", "name email");
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to update client");
  }
});

// Cambiar estado de cliente
app.put("/api/clients/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ["demo_pendiente", "demo_enviada", "web_pendiente", "web_activada", "web_pausada", "cliente_baja"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid status",
        validStatuses 
      });
    }
    
    const updateData = { status };
    
    // Si pasa a web_activada, setear fecha de activacion
    if (status === "web_activada") {
      updateData.activationDate = new Date();
      // Setear billingDay al dia actual si no esta seteado
      const client = await Client.findById(req.params.id);
      if (client && !client.billingDay) {
        updateData.billingDay = new Date().getDate();
      }
    }
    
    // Si es baja, setear fecha de cancelacion
    if (status === "cliente_baja") {
      updateData.cancellationDate = new Date();
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("sellerId", "name email");
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    res.json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to update client status");
  }
});

// Convertir demo a venta (desde demo_enviada a web_pendiente o web_activada)
app.post("/api/clients/:id/convert", authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      whatsapp, 
      domain, 
      monthlyPrice, 
      setupPrice, 
      paymentProofUrl,
      activateNow 
    } = req.body;
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    if (!["demo_pendiente", "demo_enviada"].includes(client.status)) {
      return res.status(400).json({ 
        success: false, 
        error: "Client is not in demo status" 
      });
    }
    
    // Actualizar datos del cliente para la venta
    client.name = name || client.name;
    client.email = email;
    client.whatsapp = whatsapp;
    client.domain = domain;
    client.monthlyPrice = monthlyPrice;
    client.setupPrice = setupPrice;
    client.paymentProofUrl = paymentProofUrl;
    
    if (activateNow) {
      client.status = "web_activada";
      client.activationDate = new Date();
      client.billingDay = new Date().getDate();
    } else {
      client.status = "web_pendiente";
    }
    
    await client.save();
    
    res.json({ success: true, client });
  } catch (error) {
    handleError(res, error, "Failed to convert demo to sale");
  }
});

// Estadisticas de clientes
app.get("/api/clients/stats/summary", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    const [
      totalClients,
      demoPendiente,
      demoEnviada,
      webPendiente,
      webActivada,
      webPausada,
      clienteBaja
    ] = await Promise.all([
      Client.countDocuments({ companyId }),
      Client.countDocuments({ companyId, status: "demo_pendiente" }),
      Client.countDocuments({ companyId, status: "demo_enviada" }),
      Client.countDocuments({ companyId, status: "web_pendiente" }),
      Client.countDocuments({ companyId, status: "web_activada" }),
      Client.countDocuments({ companyId, status: "web_pausada" }),
      Client.countDocuments({ companyId, status: "cliente_baja" }),
    ]);
    
    // Calcular setups cobrados del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const setupsThisMonth = await Client.aggregate([
      {
        $match: {
          companyId,
          activationDate: { $gte: startOfMonth },
          setupPrice: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$setupPrice" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calcular ingreso mensual recurrente (MRR)
    const mrrResult = await Client.aggregate([
      {
        $match: {
          companyId,
          status: "web_activada",
          monthlyPrice: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$monthlyPrice" }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        total: totalClients,
        demoPendiente,
        demoEnviada,
        webPendiente,
        webActivada,
        webPausada,
        clienteBaja,
        setupsThisMonth: setupsThisMonth[0]?.total || 0,
        setupsCount: setupsThisMonth[0]?.count || 0,
        mrr: mrrResult[0]?.total || 0
      }
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch client stats");
  }
});

// --- RUTAS DE COBRANZAS ---

// Obtener lista de clientes con estado de cobranza
app.get("/api/collections", authenticateToken, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    
    // Obtener clientes activos
    const clients = await Client.find({ 
      companyId, 
      status: "web_activada",
      monthlyPrice: { $gt: 0 }
    }).populate("sellerId", "name email");
    
    // Para cada cliente, calcular dias de mora
    const collections = clients.map(client => {
      // Calcular ultimo corte
      const today = new Date();
      const billingDay = client.billingDay || 1;
      
      // Fecha del ultimo corte
      let lastCutDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
      if (lastCutDate > today) {
        lastCutDate = new Date(today.getFullYear(), today.getMonth() - 1, billingDay);
      }
      
      // Dias desde el corte
      const diffTime = today.getTime() - lastCutDate.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Estado de cobranza
      let collectionStatus = "al_dia";
      if (daysOverdue >= 30) {
        collectionStatus = "critico";
      } else if (daysOverdue >= 15) {
        collectionStatus = "urgente";
      } else if (daysOverdue >= 5) {
        collectionStatus = "pendiente";
      }
      
      return {
        client: {
          _id: client._id,
          name: client.name,
          email: client.email,
          whatsapp: client.whatsapp,
          businessName: client.businessName,
          domain: client.domain,
          monthlyPrice: client.monthlyPrice,
          billingDay: client.billingDay,
          sellerId: client.sellerId,
        },
        lastCutDate: lastCutDate.toISOString(),
        daysOverdue,
        status: collectionStatus,
        monthlyAmount: client.monthlyPrice,
      };
    });
    
    // Ordenar por dias de mora (mayor a menor)
    collections.sort((a, b) => b.daysOverdue - a.daysOverdue);
    
    res.json({ success: true, collections });
  } catch (error) {
    handleError(res, error, "Failed to fetch collections");
  }
});

// Enviar recordatorio de pago
app.post("/api/collections/send-reminder/:clientId", authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { type } = req.body; // 5_dias, 15_dias, 30_dias, manual
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    // Registrar el recordatorio
    const reminder = new PaymentReminder({
      companyId: client.companyId,
      clientId: client._id,
      type,
      sentAt: new Date(),
      sentBy: req.user.userId,
    });
    
    await reminder.save();
    
    // TODO: Enviar email real
    // Por ahora solo registramos el recordatorio
    
    res.json({ 
      success: true, 
      emailSent: false, // Cambiar a true cuando se implemente el envio de emails
      reminder 
    });
  } catch (error) {
    handleError(res, error, "Failed to send reminder");
  }
});

// Agregar pago de cliente
app.post("/api/clients/:id/payments", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, period, paymentMethod, paymentDate, notes } = req.body;
    
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    
    const payment = new Payment({
      companyId: client.companyId,
      clientId: client._id,
      amount,
      period,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || "transferencia",
      status: "pagado",
      notes,
      recordedBy: req.user.userId,
    });
    
    await payment.save();
    
    // Registrar transaccion de ingreso
    const transaction = new Transaction({
      companyId: client.companyId,
      type: "ingreso",
      category: "Pago mensualidad",
      amount,
      description: `Pago ${period} - ${client.name} (${client.businessName})`,
      clientId: client._id,
      recordedBy: req.user.userId,
    });
    
    await transaction.save();
    
    res.status(201).json({ success: true, payment });
  } catch (error) {
    handleError(res, error, "Failed to add payment");
  }
});

// --- RUTAS DE LIQUIDACION POR EMAIL ---

// Enviar liquidacion por email
app.post("/api/liquidations/send-email", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Solo los administradores pueden enviar liquidaciones" });
    }

    const { userId, period, totalAmount, liquidationHtml, pdfBase64 } = req.body;
    const companyId = getCompanyId(req);

    if (!userId || !period || totalAmount === undefined) {
      return res.status(400).json({ success: false, error: "Faltan campos requeridos" });
    }

    // Obtener datos del usuario
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado o sin email" });
    }

    if (!transporter) {
      return res.status(500).json({ success: false, error: "El servicio de email no esta configurado" });
    }

    // Formatear el periodo para el asunto
    const [year, month] = period.split("-");
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const periodFormatted = `${monthNames[parseInt(month) - 1]} ${year}`;

    // Construir el email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f59e0b;">
          <h1 style="color: #f59e0b; margin: 0;">GRUPO JV S.A.S.</h1>
          <p style="color: #9ca3af; margin: 5px 0;">Liquidacion de Comisiones</p>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="color: #d1d5db;">Estimado/a <strong>${user.name}</strong>,</p>
          <p style="color: #d1d5db;">Adjunto encontrara su liquidacion de comisiones correspondiente al periodo <strong>${periodFormatted}</strong>.</p>
          <p style="color: #d1d5db;">El monto total a facturar es: <strong style="color: #10b981; font-size: 1.2em;">$${totalAmount.toLocaleString("es-AR")}</strong></p>
        </div>
        
        <div style="background: #2d2d44; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #f59e0b; margin-top: 0;">Instrucciones para facturar:</h3>
          <p style="color: #d1d5db; margin: 10px 0;"><strong>CUIT:</strong> 30-71903750-6</p>
          <p style="color: #d1d5db; margin: 10px 0;"><strong>Razon Social:</strong> GRUPO JV S.A.S.</p>
          <p style="color: #d1d5db; margin: 10px 0;"><strong>Descripcion:</strong> "Prestacion de Servicios de Ventas"</p>
        </div>
        
        <div style="background: #1e3a5f; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #60a5fa; margin-top: 0;">Pasos a seguir:</h3>
          <ol style="color: #d1d5db; padding-left: 20px;">
            <li style="margin: 10px 0;">Genere la factura con los datos indicados arriba</li>
            <li style="margin: 10px 0;">Envie la factura adjunta a: <strong style="color: #f59e0b;">liquidaciones@grupojv.com.ar</strong></li>
            <li style="margin: 10px 0;">En el asunto del email escriba: <strong>"Facturacion"</strong></li>
          </ol>
        </div>
        
        <div style="background: #374151; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="color: #9ca3af; margin: 0;">El plazo de pago es de hasta <strong style="color: #f59e0b;">5 dias habiles</strong> de procesada la factura.</p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #374151; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 12px;">Este email fue generado automaticamente desde TusVentas</p>
        </div>
      </div>
    `;

    // Preparar adjuntos
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `Liquidacion_${user.name.replace(/\s+/g, "_")}_${period}.pdf`,
        content: Buffer.from(pdfBase64, "base64"),
        contentType: "application/pdf",
      });
    }

    // Enviar email
    await transporter.sendMail({
      from: `"TusVentas - Liquidaciones" <${process.env.EMAIL_SMTP}>`,
      to: user.email,
      subject: `Liquidacion Prosegur ${month}/${year}`,
      html: emailHtml,
      attachments,
    });

    // Registrar el envio
    const liquidationEmail = new LiquidationEmail({
      companyId,
      userId,
      period,
      totalAmount,
      emailSentTo: user.email,
      sentBy: req.user.userId,
    });
    await liquidationEmail.save();

    res.json({ success: true, message: "Liquidacion enviada correctamente", liquidationEmailId: liquidationEmail._id });
  } catch (error) {
    handleError(res, error, "Failed to send liquidation email");
  }
});

// Obtener liquidaciones enviadas
app.get("/api/liquidations/emails", authenticateToken, async (req, res) => {
  try {
    const { userId, period } = req.query;
    const companyId = getCompanyId(req);
    
    const filter = { companyId };
    if (userId) filter.userId = userId;
    if (period) filter.period = period;

    const emails = await LiquidationEmail.find(filter)
      .populate("userId", "name email")
      .populate("sentBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, liquidationEmails: emails });
  } catch (error) {
    handleError(res, error, "Failed to get liquidation emails");
  }
});

// Subir factura para una liquidacion
app.post("/api/liquidations/emails/:id/upload-invoice", authenticateToken, upload.single("invoice"), async (req, res) => {
  try {
    const { id } = req.params;
    
    const liquidationEmail = await LiquidationEmail.findById(id);
    if (!liquidationEmail) {
      return res.status(404).json({ success: false, error: "Liquidacion no encontrada" });
    }

    // Verificar permisos (admin o el propio usuario)
    if (req.user.role !== "admin" && liquidationEmail.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: "No tienes permiso para subir facturas a esta liquidacion" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No se recibio archivo" });
    }

    // Subir a Firebase Storage
    const filename = `invoices/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(filename);
    
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Hacer el archivo publico y obtener URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Actualizar la liquidacion
    liquidationEmail.invoiceUploaded = true;
    liquidationEmail.invoiceUrl = publicUrl;
    liquidationEmail.invoiceUploadedAt = new Date();
    liquidationEmail.invoiceStatus = "uploaded";
    await liquidationEmail.save();

    res.json({ success: true, message: "Factura subida correctamente", invoiceUrl: publicUrl });
  } catch (error) {
    handleError(res, error, "Failed to upload invoice");
  }
});

// Actualizar estado de factura
app.put("/api/liquidations/emails/:id/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Solo los administradores pueden actualizar el estado" });
    }

    const { id } = req.params;
    const { invoiceStatus, paymentDate, notes } = req.body;

    const liquidationEmail = await LiquidationEmail.findByIdAndUpdate(
      id,
      { 
        invoiceStatus, 
        paymentDate: paymentDate || undefined,
        notes: notes || undefined,
      },
      { new: true }
    ).populate("userId", "name email");

    if (!liquidationEmail) {
      return res.status(404).json({ success: false, error: "Liquidacion no encontrada" });
    }

    res.json({ success: true, liquidationEmail });
  } catch (error) {
    handleError(res, error, "Failed to update liquidation status");
  }
});

// --- RUTA DE EMPRESAS ---

// Obtener empresas disponibles
// NOTA: TusVentas es el nombre del SOFTWARE, no una empresa
// Las empresas del Grupo JV son: Prosegur (internet) y TuPaginaYa (webs)
app.get("/api/companies", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    companies: [
      {
        id: "prosegur",
        name: "Prosegur",
        displayName: "Prosegur - Internet",
        isActive: true,
      },
      {
        id: "tupaginaya",
        name: "TuPaginaYa",
        displayName: "TuPaginaYa - Webs",
        isActive: true,
      },
    ],
  });
});

// --- CONFIGURACION DE EMPRESAS ---

// Obtener configuracion de una empresa
app.get("/api/company-settings/:companyId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!["prosegur", "tupaginaya"].includes(companyId)) {
      return res.status(400).json({ success: false, error: "Company ID invalido" });
    }
    
    // Buscar o crear configuracion por defecto
    let settings = await CompanySettings.findOne({ companyId });
    
    if (!settings) {
      settings = new CompanySettings({
        companyId,
        baseCommissionPerSale: companyId === "tupaginaya" ? 200000 : 200000,
        settings: {},
      });
      await settings.save();
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    handleError(res, error, "Failed to get company settings");
  }
});

// Actualizar configuracion de una empresa
app.put("/api/company-settings/:companyId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      baseCommissionPerSale, 
      basePrice,
      commissionScales,
      supervisorFixedCommission,
      settings: additionalSettings 
    } = req.body;
    
    console.log(`[CompanySettings] Updating settings for ${companyId}:`, req.body);
    
    if (!["prosegur", "tupaginaya"].includes(companyId)) {
      return res.status(400).json({ success: false, error: "Company ID invalido" });
    }
    
    // Buscar o crear configuracion
    let companySettings = await CompanySettings.findOne({ companyId });
    
    if (!companySettings) {
      companySettings = new CompanySettings({
        companyId,
        baseCommissionPerSale: baseCommissionPerSale || 200000,
        basePrice: basePrice || 15000,
        commissionScales: commissionScales || [],
        supervisorFixedCommission: supervisorFixedCommission || 0,
        settings: additionalSettings || {},
      });
    } else {
      // Actualizar campos individuales
      if (baseCommissionPerSale !== undefined) {
        companySettings.baseCommissionPerSale = baseCommissionPerSale;
      }
      if (basePrice !== undefined) {
        companySettings.basePrice = basePrice;
      }
      if (commissionScales !== undefined) {
        companySettings.commissionScales = commissionScales;
        console.log(`[CompanySettings] Updated commissionScales:`, commissionScales);
      }
      if (supervisorFixedCommission !== undefined) {
        companySettings.supervisorFixedCommission = supervisorFixedCommission;
      }
      if (additionalSettings) {
        companySettings.settings = { ...companySettings.settings, ...additionalSettings };
      }
    }
    
    await companySettings.save();
    console.log(`[CompanySettings] Saved settings for ${companyId}:`, companySettings);
    
    res.json({
      success: true,
      message: "Configuracion actualizada correctamente",
      settings: companySettings
    });
  } catch (error) {
    handleError(res, error, "Failed to update company settings");
  }
});

// --- SISTEMA DE NOTIFICACIONES/ANUNCIOS ---

// Funcion para enviar email de anuncio (optimizada para envio en paralelo)
async function enviarEmailAnuncio(notification, recipients) {
  if (!transporter) {
    console.log('Email transporter no configurado. Saltando envio de emails de anuncio.');
    return 0;
  }

  const typeLabels = {
    info: "Informacion",
    warning: "Aviso Importante",
    success: "Buenas Noticias",
    meeting: "Reunion Programada",
    material: "Nuevo Material",
    document: "Documento",
    announcement: "Anuncio",
    training: "Capacitacion",
  };

  const priorityColors = {
    low: "#6b7280",
    medium: "#3b82f6",
    high: "#f59e0b",
    urgent: "#ef4444",
  };

  console.log(`[Anuncio] Enviando "${notification.title}" a ${recipients.length} destinatarios en background`);
  
  // Filtrar recipients con email
  const validRecipients = recipients.filter(r => r.email);
  console.log(`[Anuncio] ${validRecipients.length} destinatarios con email valido`);

  let meetingHtml = '';
  if (notification.type === 'meeting' && notification.meetingInfo) {
    const mi = notification.meetingInfo;
    meetingHtml = `
      <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #1e40af;">Detalles de la Reunion</h4>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${mi.date || 'Por confirmar'}</p>
        <p style="margin: 5px 0;"><strong>Hora:</strong> ${mi.time || 'Por confirmar'}</p>
        ${mi.location ? `<p style="margin: 5px 0;"><strong>Ubicacion:</strong> ${mi.location}</p>` : ''}
        ${mi.link ? `<p style="margin: 10px 0;"><a href="${mi.link}" style="color: #3b82f6; font-weight: bold;">Unirse a la reunion</a></p>` : ''}
      </div>
    `;
  }

  // Generar HTML para attachments
  const baseUrl = process.env.BACKEND_URL || 'https://api.tusventas.digital';
  let attachmentsHtml = '';
  if (notification.attachments && notification.attachments.length > 0) {
    const attachmentItems = notification.attachments.map(att => {
      const fullUrl = att.url.startsWith('http') ? att.url : `${baseUrl}${att.url}`;
      const isImage = att.type && att.type.startsWith('image/');
      const fileName = att.originalName || att.filename || 'archivo';
      const fileSize = att.size ? `(${(att.size / 1024).toFixed(1)} KB)` : '';
      
      if (isImage) {
        return `
          <div style="margin-bottom: 15px; text-align: center;">
            <img src="${fullUrl}" alt="${fileName}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">${fileName} ${fileSize}</p>
          </div>
        `;
      } else {
        return `
          <div style="margin-bottom: 10px; padding: 12px; background-color: #e5e7eb; border-radius: 6px;">
            <a href="${fullUrl}" download="${fileName}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
              📎 ${fileName} ${fileSize}
            </a>
          </div>
        `;
      }
    }).join('');

    attachmentsHtml = `
      <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 15px 0; color: #374151;">Archivos Adjuntos</h4>
        ${attachmentItems}
      </div>
    `;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a2e; padding: 20px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0;">TusVentas</h1>
      </div>
      <div style="padding: 30px; background-color: #f8f9fa;">
        <div style="display: inline-block; padding: 4px 12px; border-radius: 4px; background-color: ${priorityColors[notification.priority]}; color: white; font-size: 12px; margin-bottom: 15px;">
          ${notification.priority === 'urgent' ? 'URGENTE' : notification.priority === 'high' ? 'PRIORIDAD ALTA' : ''}
        </div>
        <h2 style="color: #1a1a2e; margin-top: 0;">${notification.title}</h2>
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="white-space: pre-wrap; margin: 0; color: #333;">${notification.message}</p>
        </div>
        ${attachmentsHtml}
        ${meetingHtml}
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://tusventas.netlify.app"
            style="display:inline-block; padding:12px 30px; background-color:#f59e0b; color:#1a1a2e; text-decoration:none; border-radius:6px; font-weight: bold;">
            Ver en la plataforma
          </a>
        </div>
      </div>
      <div style="background-color: #1a1a2e; padding: 15px; text-align: center;">
        <small style="color: #888;">Este mensaje fue enviado automaticamente por el sistema TusVentas.</small>
      </div>
    </div>
  `;

  // Enviar emails en lotes paralelos (maximo 10 a la vez para velocidad optima)
  const BATCH_SIZE = 10;
  let emailsSent = 0;
  
  for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
    const batch = validRecipients.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(recipient => 
        transporter.sendMail({
          from: `"TusVentas" <${process.env.EMAIL_SMTP}>`,
          to: recipient.email,
          subject: `${typeLabels[notification.type] || 'Anuncio'}: ${notification.title}`,
          html: emailHtml
        })
      )
    );
    
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        emailsSent++;
      } else {
        console.error(`[Anuncio] Error enviando a ${batch[idx].email}: ${result.reason?.message || 'Unknown error'}`);
      }
    });
    
    // Pausa minima entre lotes (solo si hay mas lotes)
    if (i + BATCH_SIZE < validRecipients.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  console.log(`[Anuncio] Emails enviados: ${emailsSent}/${validRecipients.length}`);
  return emailsSent;
}

// Obtener todas las notificaciones
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    const companyId = req.headers["x-company-id"] || user.companyId || "prosegur";

    // Buscar notificaciones para este usuario
    let query = { companyId };
    
    // Si no es admin, filtrar por destinatarios
    if (user.role !== "admin") {
      query.$or = [
        { recipientType: "all" },
        { recipients: user._id }
      ];
    }

    const notifications = await Notification.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    // Agregar campo isRead para cada notificacion
    const notificationsWithRead = notifications.map(n => {
      const notif = n.toObject();
      notif.isRead = n.readBy.some(r => r.userId.toString() === user._id.toString());
      return notif;
    });

    res.json({ success: true, notifications: notificationsWithRead });
  } catch (error) {
    handleError(res, error, "Failed to get notifications");
  }
});

// Obtener conteo de notificaciones no leidas
app.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    const companyId = req.headers["x-company-id"] || user.companyId || "prosegur";

    let query = { 
      companyId,
      "readBy.userId": { $ne: user._id }
    };
    
    if (user.role !== "admin") {
      query.$or = [
        { recipientType: "all" },
        { recipients: user._id }
      ];
    }

    const count = await Notification.countDocuments(query);
    res.json({ success: true, count });
  } catch (error) {
    handleError(res, error, "Failed to get unread count");
  }
});

// Crear nueva notificacion/anuncio (solo admin)
app.post("/api/notifications", authenticateToken, requireAdmin, upload.array("attachments", 5), async (req, res) => {
  try {
    const { title, message, type, priority, recipientType, recipients, meetingInfo } = req.body;
    const companyId = req.headers["x-company-id"] || "prosegur";

    if (!title || !message) {
      return res.status(400).json({ success: false, error: "Titulo y mensaje son requeridos" });
    }

    // Parsear recipients si viene como string JSON
    let parsedRecipients = [];
    if (recipients) {
      try {
        parsedRecipients = typeof recipients === 'string' ? JSON.parse(recipients) : recipients;
      } catch (e) {
        console.error("Error parsing recipients:", e);
      }
    }

    // Parsear meetingInfo si viene como string JSON
    let parsedMeetingInfo = null;
    if (meetingInfo) {
      try {
        parsedMeetingInfo = typeof meetingInfo === 'string' ? JSON.parse(meetingInfo) : meetingInfo;
      } catch (e) {
        console.error("Error parsing meetingInfo:", e);
      }
    }

    // Procesar archivos adjuntos EN PARALELO para mayor velocidad
    let attachments = [];
    if (req.files && req.files.length > 0) {
      // Crear directorio de uploads si no existe
      const uploadsDir = path.join(__dirname, 'uploads', 'notifications');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Procesar todos los archivos en paralelo
      const uploadPromises = req.files.map(async (file, index) => {
        const uniqueName = `${Date.now()}_${index}_${file.originalname}`;
        
        try {
          // Intentar subir a Firebase si esta configurado
          if (bucket) {
            const fileName = `notifications/${uniqueName}`;
            const fileUpload = bucket.file(fileName);
            
            await fileUpload.save(file.buffer, {
              metadata: { contentType: file.mimetype },
            });
            
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            
            console.log(`[Anuncio] Archivo subido a Firebase: ${file.originalname}`);
            return { originalName: file.originalname, filename: file.originalname, url: publicUrl, type: file.mimetype, size: file.size || 0 };
          } else {
            // Guardar localmente si Firebase no esta configurado
            const localPath = path.join(uploadsDir, uniqueName);
            fs.writeFileSync(localPath, file.buffer);
            const localUrl = `/uploads/notifications/${uniqueName}`;
            
            console.log(`[Anuncio] Archivo guardado localmente: ${file.originalname}`);
            return { originalName: file.originalname, filename: file.originalname, url: localUrl, type: file.mimetype, size: file.size || 0 };
          }
        } catch (uploadError) {
          console.error("Error subiendo archivo:", uploadError.message);
          
          // Fallback a local si Firebase falla
          try {
            const localPath = path.join(uploadsDir, uniqueName);
            fs.writeFileSync(localPath, file.buffer);
            const localUrl = `/uploads/notifications/${uniqueName}`;
            
            console.log(`[Anuncio] Archivo guardado localmente (fallback): ${file.originalname}`);
            return { originalName: file.originalname, filename: file.originalname, url: localUrl, type: file.mimetype, size: file.size || 0 };
          } catch (localError) {
            console.error("Error guardando archivo localmente:", localError.message);
            return null;
          }
        }
      });
      
      // Esperar todos los uploads en paralelo
      const results = await Promise.all(uploadPromises);
      attachments = results.filter(r => r !== null);
    }

const notification = new Notification({
      companyId,
      title,
      message,
      type: type || "info",
      priority: priority || "medium",
      recipientType: recipientType || "all",
      recipients: recipientType === "selected" ? parsedRecipients : [],
      meetingInfo: parsedMeetingInfo,
      attachments: attachments,
      createdBy: req.user.userId,
      readBy: [],
    });

    await notification.save();

    // Obtener destinatarios para enviar emails
    let emailRecipients = [];
    
    console.log(`[Anuncio] Creando anuncio - recipientType: ${recipientType}, empresa: ${companyId}`);
    
    if (recipientType === "all") {
      // Enviar a todos los vendedores/supervisores activos de la empresa
      // Buscar usuarios que tengan esta empresa como principal O en allowedCompanies
      emailRecipients = await User.find({
        $or: [
          { companyId: companyId },
          { allowedCompanies: companyId }
        ],
        role: { $in: ["seller", "supervisor"] },
        isActive: true,
      });
      
      console.log(`[Anuncio] Encontrados ${emailRecipients.length} destinatarios para empresa ${companyId}`);
    } else if (parsedRecipients.length > 0) {
      emailRecipients = await User.find({
        _id: { $in: parsedRecipients },
        isActive: true,
      });
      console.log(`[Anuncio] ${emailRecipients.length} destinatarios seleccionados manualmente`);
    } else {
      console.log(`[Anuncio] Sin destinatarios`);
    }

    // Poblar createdBy para la respuesta
    await notification.populate("createdBy", "name");

    // Responder inmediatamente con exito (los emails se envian en background)
    res.json({ 
      success: true, 
      notification,
      emailsSent: 0, // Se actualizara en background
      message: `Anuncio creado. Los emails se estan enviando en segundo plano.`
    });

    // Enviar emails en background (no bloquea la respuesta)
    setImmediate(async () => {
      try {
        const emailsSent = await enviarEmailAnuncio(notification, emailRecipients);
        
        // Actualizar notificacion con conteo de emails enviados
        await Notification.findByIdAndUpdate(notification._id, {
          emailsSent: emailsSent > 0,
          emailSentCount: emailsSent
        });
        
        console.log(`[Anuncio] Emails enviados en background: ${emailsSent}`);
      } catch (e) {
        console.error('[Anuncio] Error enviando emails en background:', e.message);
      }
    });
  } catch (error) {
    handleError(res, error, "Failed to create notification");
  }
});

// Marcar notificacion como leida
app.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notificacion no encontrada" });
    }

    // Verificar si ya esta marcada como leida
    const alreadyRead = notification.readBy.some(
      r => r.userId.toString() === req.user.userId
    );

    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user.userId,
        readAt: new Date(),
      });
      await notification.save();
    }

    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to mark notification as read");
  }
});

// Marcar todas las notificaciones como leidas
app.put("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    const companyId = req.headers["x-company-id"] || user.companyId || "prosegur";

    // Buscar notificaciones no leidas
    let query = { 
      companyId,
      "readBy.userId": { $ne: user._id }
    };
    
    if (user.role !== "admin") {
      query.$or = [
        { recipientType: "all" },
        { recipients: user._id }
      ];
    }

    const notifications = await Notification.find(query);

    // Marcar todas como leidas
    for (const notification of notifications) {
      notification.readBy.push({
        userId: user._id,
        readAt: new Date(),
      });
      await notification.save();
    }

    res.json({ success: true, markedCount: notifications.length });
  } catch (error) {
    handleError(res, error, "Failed to mark all notifications as read");
  }
});

// Eliminar notificacion (solo admin)
app.delete("/api/notifications/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: "Notificacion no encontrada" });
    }

    res.json({ success: true, message: "Notificacion eliminada" });
  } catch (error) {
    handleError(res, error, "Failed to delete notification");
  }
});

// Endpoint de test para verificar el sistema de emails
app.get("/api/test-email", authenticateToken, async (req, res) => {
  try {
    // Solo admin puede probar
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Solo admin puede probar emails" });
    }

    console.log('=== TEST DE EMAIL ===');
    console.log('EMAIL_SMTP:', process.env.EMAIL_SMTP ? 'configurado' : 'NO configurado');
    console.log('PASSWORD_SMTP:', process.env.PASSWORD_SMTP ? 'configurado (' + process.env.PASSWORD_SMTP.length + ' chars)' : 'NO configurado');
    console.log('Transporter:', transporter ? 'configurado' : 'NO configurado');

    if (!transporter) {
      return res.json({
        success: false,
        error: "Transporter no configurado",
        details: {
          EMAIL_SMTP: process.env.EMAIL_SMTP ? 'configurado' : 'NO',
          PASSWORD_SMTP: process.env.PASSWORD_SMTP ? 'configurado' : 'NO'
        }
      });
    }

    // Intentar enviar un email de prueba
    const testResult = await transporter.sendMail({
      from: `"TusVentas Test" <${process.env.EMAIL_SMTP}>`,
      to: user.email,
      subject: "Test de email - TusVentas",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h1>Test de Email</h1>
          <p>Este es un email de prueba enviado desde el sistema TusVentas.</p>
          <p>Fecha: ${new Date().toLocaleString('es-AR')}</p>
        </div>
      `
    });

    console.log('Email de test enviado:', testResult);

    res.json({
      success: true,
      message: `Email de prueba enviado a ${user.email}`,
      messageId: testResult.messageId
    });

  } catch (error) {
    console.error('Error en test de email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      command: error.command
    });
  }
});

// ========================================
// MARKETING MATERIALS ENDPOINTS
// ========================================

// Get all materials for a category (accessible by all authenticated users)
app.get("/api/materials", authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const companyId = req.headers["x-company-id"] || "tupaginaya";
    
    const query = { companyId };
    if (category) {
      query.category = category;
    }
    
    const materials = await MarketingMaterial.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, materials });
  } catch (error) {
    handleError(res, error, "Failed to get materials");
  }
});

// Upload new material (admin only)
app.post("/api/materials", authenticateToken, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const { category, name, description } = req.body;
    const companyId = req.headers["x-company-id"] || "tupaginaya";
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No se ha subido ningún archivo" });
    }
    
    if (!category || !name) {
      return res.status(400).json({ success: false, error: "Categoría y nombre son requeridos" });
    }
    
    // Determine file type from mimetype
    let fileType = "other";
    if (req.file.mimetype.startsWith("image/")) fileType = "image";
    else if (req.file.mimetype.startsWith("video/")) fileType = "video";
    else if (req.file.mimetype.includes("pdf") || req.file.mimetype.includes("document") || req.file.mimetype.includes("word")) fileType = "document";
    
    // Create uploads directory if it doesn't exist
    const materialsDir = path.join(__dirname, "uploads", "materials", category);
    if (!fs.existsSync(materialsDir)) {
      fs.mkdirSync(materialsDir, { recursive: true });
    }
    
    let fileUrl;
    
    // Try to upload to Firebase if available
    if (bucket) {
      try {
        const fileName = `materials/${category}/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);
        
        await fileUpload.save(req.file.buffer, {
          metadata: { contentType: req.file.mimetype },
        });
        
        await fileUpload.makePublic();
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(`[Materials] Archivo subido a Firebase: ${req.file.originalname}`);
      } catch (firebaseError) {
        console.error("Error subiendo a Firebase, guardando localmente:", firebaseError.message);
        // Fallback to local storage
        const uniqueName = `${Date.now()}_${req.file.originalname}`;
        const localPath = path.join(materialsDir, uniqueName);
        fs.writeFileSync(localPath, req.file.buffer);
        fileUrl = `/uploads/materials/${category}/${uniqueName}`;
        console.log(`[Materials] Archivo guardado localmente: ${req.file.originalname}`);
      }
    } else {
      // Save locally if Firebase not configured
      const uniqueName = `${Date.now()}_${req.file.originalname}`;
      const localPath = path.join(materialsDir, uniqueName);
      fs.writeFileSync(localPath, req.file.buffer);
      fileUrl = `/uploads/materials/${category}/${uniqueName}`;
      console.log(`[Materials] Archivo guardado localmente: ${req.file.originalname}`);
    }
    
    const material = new MarketingMaterial({
      companyId,
      category,
      name,
      description,
      fileType,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.userId,
    });
    
    await material.save();
    await material.populate("uploadedBy", "name");
    
    res.json({ success: true, material, message: "Material subido correctamente" });
  } catch (error) {
    handleError(res, error, "Failed to upload material");
  }
});

// Delete material (admin only)
app.delete("/api/materials/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const material = await MarketingMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, error: "Material no encontrado" });
    }
    
    // Try to delete the file
    if (material.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await MarketingMaterial.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: "Material eliminado correctamente" });
  } catch (error) {
    handleError(res, error, "Failed to delete material");
  }
});

// Middleware para autenticar via header O query parameter (para links de descarga)
const authenticateTokenFlexible = (req, res, next) => {
  // Try header first
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  
  // If not in header, try query parameter
  if (!token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ success: false, error: "Token requerido" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tusventassecretkey2024");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Token invalido" });
  }
};

// Download material file (accessible by all authenticated users)
app.get("/api/materials/:id/download", authenticateTokenFlexible, async (req, res) => {
  try {
    const material = await MarketingMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, error: "Material no encontrado" });
    }
    
    // If it's a local file
    if (material.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, material.fileUrl);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "Archivo no encontrado en el servidor" });
      }
      
      // Set headers for download
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(material.fileName)}"`);
      res.setHeader("Content-Type", material.mimeType || "application/octet-stream");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // External URL (Firebase, etc.) - redirect
      res.redirect(material.fileUrl);
    }
  } catch (error) {
    handleError(res, error, "Failed to download material");
  }
});

// View material file (accessible by all authenticated users)
app.get("/api/materials/:id/view", authenticateTokenFlexible, async (req, res) => {
  try {
    const material = await MarketingMaterial.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, error: "Material no encontrado" });
    }
    
    // If it's a local file
    if (material.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, material.fileUrl);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: "Archivo no encontrado en el servidor" });
      }
      
      // Set headers for inline viewing
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(material.fileName)}"`);
      res.setHeader("Content-Type", material.mimeType || "application/octet-stream");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // External URL (Firebase, etc.) - redirect
      res.redirect(material.fileUrl);
    }
  } catch (error) {
    handleError(res, error, "Failed to view material");
  }
});

// ========================================
// TUPAGINAYA API ROUTES (TPY_*)
// Endpoints separados para TuPaginaYa
// ========================================

// Mapeo de estados para display
const TPY_STATUS_LABELS = {
  "pendiente_demo": "Pendiente de Demo",
  "demo_enviada": "Demo Enviada",
  "demo_pausada": "Demo Pausada",
  "pendiente_web": "Pendiente Web",
  "web_activada": "Web Activada",
  "baja": "Baja"
}

// ---------- TPY_CLIENTS ----------

// GET all TPY clients
app.get("/api/tpy/clients", authenticateToken, async (req, res) => {
  try {
    const { status, month, search } = req.query
    let query = {}
    
    if (status && status !== "all") {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { webName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }
    
    // Filtro por mes si se proporciona
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)
      query.createdAt = { $gte: startDate, $lte: endDate }
    }
    
    const clients = await TPY_Client.find(query)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
    
    res.json({ success: true, clients })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY clients")
  }
})

// GET single TPY client
app.get("/api/tpy/clients/:id", authenticateToken, async (req, res) => {
  try {
    const client = await TPY_Client.findById(req.params.id)
      .populate("sellerId", "name email")
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" })
    }
    
    res.json({ success: true, client })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY client")
  }
})

// CREATE TPY client
app.post("/api/tpy/clients", authenticateToken, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      sellerId: req.body.sellerId || req.user.userId,
      sellerName: req.body.sellerName || req.user.name,
    }
    
    const client = new TPY_Client(clientData)
    await client.save()
    
    res.status(201).json({ success: true, client })
  } catch (error) {
    handleError(res, error, "Failed to create TPY client")
  }
})

// UPDATE TPY client
app.put("/api/tpy/clients/:id", authenticateToken, async (req, res) => {
  try {
    const client = await TPY_Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" })
    }
    
    res.json({ success: true, client })
  } catch (error) {
    handleError(res, error, "Failed to update TPY client")
  }
})

// UPDATE TPY client status
app.patch("/api/tpy/clients/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada", "baja"]
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      })
    }
    
    const updateData = { status }
    
    // Si se activa la web, guardar fecha de activacion
    if (status === "web_activada") {
      updateData.activationDate = new Date()
    }
    
    // Si es baja, guardar fecha de baja
    if (status === "baja") {
      updateData.cancellationDate = new Date()
    }
    
    const client = await TPY_Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" })
    }
    
    res.json({ success: true, client })
  } catch (error) {
    handleError(res, error, "Failed to update TPY client status")
  }
})

// DELETE TPY client
app.delete("/api/tpy/clients/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const client = await TPY_Client.findByIdAndDelete(req.params.id)
    
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" })
    }
    
    res.json({ success: true, message: "Client deleted" })
  } catch (error) {
    handleError(res, error, "Failed to delete TPY client")
  }
})

// ---------- TPY_DEMOS ----------

// GET all TPY demos
app.get("/api/tpy/demos", authenticateToken, async (req, res) => {
  try {
    const { status, month, search } = req.query
    let query = {}
    
    if (status && status !== "all") {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { webName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }
    
    // Filtro por mes
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)
      query.demoDate = { $gte: startDate, $lte: endDate }
    }
    
    const demos = await TPY_Demo.find(query)
      .populate("sellerId", "name email")
      .sort({ demoDate: -1 })
    
    res.json({ success: true, demos })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY demos")
  }
})

// GET TPY demo by ID
app.get("/api/tpy/demos/:id", authenticateToken, async (req, res) => {
  try {
    const demo = await TPY_Demo.findById(req.params.id)
      .populate("sellerId", "name email")
    
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }
    
    res.json({ success: true, demo })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY demo")
  }
})

// CREATE TPY demo
app.post("/api/tpy/demos", authenticateToken, async (req, res) => {
  try {
    const demoData = {
      ...req.body,
      sellerId: req.body.sellerId || req.user.userId,
      sellerName: req.body.sellerName || req.user.name,
    }
    
    const demo = new TPY_Demo(demoData)
    await demo.save()
    
    res.status(201).json({ success: true, demo })
  } catch (error) {
    handleError(res, error, "Failed to create TPY demo")
  }
})

// UPDATE TPY demo
app.put("/api/tpy/demos/:id", authenticateToken, async (req, res) => {
  try {
    const demo = await TPY_Demo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }
    
    res.json({ success: true, demo })
  } catch (error) {
    handleError(res, error, "Failed to update TPY demo")
  }
})

// UPDATE TPY demo status
app.patch("/api/tpy/demos/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada"]
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      })
    }
    
    const demo = await TPY_Demo.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }
    
    res.json({ success: true, demo })
  } catch (error) {
    handleError(res, error, "Failed to update TPY demo status")
  }
})

// CONVERT TPY demo to client (activar web)
app.post("/api/tpy/demos/:id/convert", authenticateToken, async (req, res) => {
  try {
    const demo = await TPY_Demo.findById(req.params.id)
    
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }
    
    // Crear cliente a partir de la demo
    const clientData = {
      name: demo.name,
      phone: demo.phone,
      email: demo.email,
      webName: demo.webName,
      domain: req.body.domain || demo.demoUrl,
      status: "web_activada",
      activationPrice: req.body.activationPrice || demo.activationPrice,
      monthlyPrice: req.body.monthlyPrice || demo.monthlyPrice,
      activationDate: new Date(),
      sellerId: demo.sellerId,
      sellerName: demo.sellerName,
    }
    
    const client = new TPY_Client(clientData)
    await client.save()
    
    // Actualizar demo
    demo.status = "web_activada"
    demo.clientId = client._id
    await demo.save()
    
    // Crear venta
    const saleData = {
      clientId: client._id,
      clientName: client.name,
      clientPhone: client.phone,
      webName: client.webName,
      domain: client.domain,
      status: "web_activada",
      activationPrice: client.activationPrice,
      monthlyPrice: client.monthlyPrice,
      saleDate: new Date(),
      activationDate: new Date(),
      sellerId: demo.sellerId,
      sellerName: demo.sellerName,
    }
    
    const sale = new TPY_Sale(saleData)
    await sale.save()
    
    // Crear transaccion de ingreso por activacion
    if (client.activationPrice && client.activationPrice > 0) {
      const activationDate = new Date()
      const month = `${activationDate.getFullYear()}-${String(activationDate.getMonth() + 1).padStart(2, '0')}`
      
      const transaction = new TPY_Transaction({
        type: "ingreso",
        category: "Activacion Web",
        concept: `Activacion web - ${client.name} (${client.webName || client.domain})`,
        amount: client.activationPrice,
        date: activationDate,
        month: month,
        clientId: client._id,
        clientName: client.name,
        recordedBy: req.user._id,
      })
      await transaction.save()
    }
    
    res.json({ success: true, client, sale, demo })
  } catch (error) {
    handleError(res, error, "Failed to convert TPY demo")
  }
})

// DELETE TPY demo
app.delete("/api/tpy/demos/:id", authenticateToken, async (req, res) => {
  try {
    const demo = await TPY_Demo.findByIdAndDelete(req.params.id)
    
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }
    
    res.json({ success: true, message: "Demo deleted" })
  } catch (error) {
    handleError(res, error, "Failed to delete TPY demo")
  }
})

// Upload files for TPY demo
app.post("/api/tpy/demos/:id/upload", authenticateToken, upload.fields([
  { name: 'flyer', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res) => {
  try {
    const demo = await TPY_Demo.findById(req.params.id)
    if (!demo) {
      return res.status(404).json({ success: false, error: "Demo not found" })
    }

    const uploadsDir = path.join(__dirname, 'uploads', 'tpy-demos')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const updateData = {}
    const files = req.files

    // Procesar flyer
    if (files.flyer && files.flyer[0]) {
      const file = files.flyer[0]
      const uniqueName = `${Date.now()}_flyer_${file.originalname}`
      const localPath = path.join(uploadsDir, uniqueName)
      fs.writeFileSync(localPath, file.buffer)
      updateData.flyerUrl = `/uploads/tpy-demos/${uniqueName}`
    }

    // Procesar logo
    if (files.logo && files.logo[0]) {
      const file = files.logo[0]
      const uniqueName = `${Date.now()}_logo_${file.originalname}`
      const localPath = path.join(uploadsDir, uniqueName)
      fs.writeFileSync(localPath, file.buffer)
      updateData.logoUrl = `/uploads/tpy-demos/${uniqueName}`
    }

    if (Object.keys(updateData).length > 0) {
      const updatedDemo = await TPY_Demo.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      )
      res.json({ success: true, demo: updatedDemo })
    } else {
      res.json({ success: true, demo, message: "No files uploaded" })
    }
  } catch (error) {
    handleError(res, error, "Failed to upload files for TPY demo")
  }
})

// Create TPY demo with files
app.post("/api/tpy/demos/with-files", authenticateToken, upload.fields([
  { name: 'flyer', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', 'tpy-demos')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Parse form data
    const demoData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      webName: req.body.webName || req.body.businessName,
      demoUrl: req.body.demoUrl,
      status: req.body.status || "pendiente_demo",
      activationPrice: parseFloat(req.body.activationPrice) || 0,
      monthlyPrice: parseFloat(req.body.monthlyPrice) || 0,
      notes: req.body.notes,
      businessType: req.body.businessType,
      whatTheySell: req.body.whatTheySell,
      sellerId: req.body.sellerId || req.user.userId,
      sellerName: req.body.sellerName || req.user.name,
    }

    // Parse social networks if provided
    if (req.body.socialNetworks) {
      try {
        demoData.socialNetworks = typeof req.body.socialNetworks === 'string' 
          ? JSON.parse(req.body.socialNetworks) 
          : req.body.socialNetworks
      } catch (e) {
        console.error("Error parsing socialNetworks:", e)
      }
    }

    const files = req.files

    // Procesar flyer
    if (files && files.flyer && files.flyer[0]) {
      const file = files.flyer[0]
      const uniqueName = `${Date.now()}_flyer_${file.originalname}`
      const localPath = path.join(uploadsDir, uniqueName)
      fs.writeFileSync(localPath, file.buffer)
      demoData.flyerUrl = `/uploads/tpy-demos/${uniqueName}`
    }

    // Procesar logo
    if (files && files.logo && files.logo[0]) {
      const file = files.logo[0]
      const uniqueName = `${Date.now()}_logo_${file.originalname}`
      const localPath = path.join(uploadsDir, uniqueName)
      fs.writeFileSync(localPath, file.buffer)
      demoData.logoUrl = `/uploads/tpy-demos/${uniqueName}`
    }

    const demo = new TPY_Demo(demoData)
    await demo.save()

    res.status(201).json({ success: true, demo })
  } catch (error) {
    handleError(res, error, "Failed to create TPY demo with files")
  }
})

// General file upload endpoint
app.post("/api/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" })
    }

    const folder = req.body.folder || "general"
    const uploadsDir = path.join(__dirname, 'uploads', folder)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const uniqueName = `${Date.now()}_${req.file.originalname}`
    const localPath = path.join(uploadsDir, uniqueName)
    fs.writeFileSync(localPath, req.file.buffer)
    const url = `/uploads/${folder}/${uniqueName}`

    res.json({ 
      success: true, 
      url, 
      filename: req.file.originalname,
      type: req.file.mimetype 
    })
  } catch (error) {
    handleError(res, error, "Failed to upload file")
  }
})

// ---------- TPY_SALES ----------

// GET all TPY sales
app.get("/api/tpy/sales", authenticateToken, async (req, res) => {
  try {
    const { status, month, search, sellerId } = req.query
    let query = {}
    
    if (status && status !== "all") {
      query.status = status
    }
    
    if (sellerId) {
      query.sellerId = sellerId
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { webName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
      ]
    }
    
    // Filtro por mes
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)
      query.saleDate = { $gte: startDate, $lte: endDate }
    }
    
    const sales = await TPY_Sale.find(query)
      .populate("sellerId", "name email")
      .populate("clientId", "name phone")
      .sort({ saleDate: -1 })
    
    res.json({ success: true, sales })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY sales")
  }
})

// CREATE TPY sale
app.post("/api/tpy/sales", authenticateToken, async (req, res) => {
  try {
    const saleData = {
      ...req.body,
      sellerId: req.body.sellerId || req.user.userId,
      sellerName: req.body.sellerName || req.user.name,
    }
    
    const sale = new TPY_Sale(saleData)
    await sale.save()
    
    res.status(201).json({ success: true, sale })
  } catch (error) {
    handleError(res, error, "Failed to create TPY sale")
  }
})

// UPDATE TPY sale
app.put("/api/tpy/sales/:id", authenticateToken, async (req, res) => {
  try {
    const sale = await TPY_Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" })
    }
    
    res.json({ success: true, sale })
  } catch (error) {
    handleError(res, error, "Failed to update TPY sale")
  }
})

// UPDATE TPY sale status
app.patch("/api/tpy/sales/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pendiente_demo", "demo_enviada", "demo_pausada", "pendiente_web", "web_activada", "baja"]
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      })
    }
    
    const updateData = { status }
    
    if (status === "web_activada" && !req.body.activationDate) {
      updateData.activationDate = new Date()
    }
    
    const sale = await TPY_Sale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" })
    }
    
    // Actualizar cliente asociado tambien
    if (sale.clientId) {
      await TPY_Client.findByIdAndUpdate(sale.clientId, { status })
    }
    
    res.json({ success: true, sale })
  } catch (error) {
    handleError(res, error, "Failed to update TPY sale status")
  }
})

// ---------- TPY_TRANSACTIONS ----------

// GET all TPY transactions
app.get("/api/tpy/transactions", authenticateToken, async (req, res) => {
  try {
    const { type, month, category } = req.query
    let query = {}
    
    if (type && type !== "all") {
      query.type = type
    }
    
    if (category) {
      query.category = { $regex: category, $options: "i" }
    }
    
    // Filtro por mes (obligatorio para transacciones)
    if (month) {
      query.month = month
    }
    
    const transactions = await TPY_Transaction.find(query)
      .populate("clientId", "name webName")
      .populate("recordedBy", "name")
      .sort({ date: -1 })
    
    // Calcular totales
    const ingresos = transactions.filter(t => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
    const egresos = transactions.filter(t => t.type === "egreso").reduce((sum, t) => sum + t.amount, 0)
    const balance = ingresos - egresos
    
    res.json({ success: true, transactions, totals: { ingresos, egresos, balance } })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY transactions")
  }
})

// CREATE TPY transaction
app.post("/api/tpy/transactions", authenticateToken, async (req, res) => {
  try {
    const date = new Date(req.body.date || Date.now())
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    
    const transactionData = {
      ...req.body,
      month,
      recordedBy: req.user.userId,
    }
    
    const transaction = new TPY_Transaction(transactionData)
    await transaction.save()
    
    res.status(201).json({ success: true, transaction })
  } catch (error) {
    handleError(res, error, "Failed to create TPY transaction")
  }
})

// UPDATE TPY transaction
app.put("/api/tpy/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const transaction = await TPY_Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" })
    }
    
    res.json({ success: true, transaction })
  } catch (error) {
    handleError(res, error, "Failed to update TPY transaction")
  }
})

// DELETE TPY transaction
app.delete("/api/tpy/transactions/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const transaction = await TPY_Transaction.findByIdAndDelete(req.params.id)
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: "Transaction not found" })
    }
    
    res.json({ success: true, message: "Transaction deleted" })
  } catch (error) {
    handleError(res, error, "Failed to delete TPY transaction")
  }
})

// ---------- TPY_COLLECTIONS ----------

// GET all TPY collections (cobranzas)
app.get("/api/tpy/collections", authenticateToken, async (req, res) => {
  try {
    const { month, status, search } = req.query
    let query = {}
    
    if (month) {
      query.month = month
    }
    
    if (status && status !== "all") {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { webName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
      ]
    }
    
    const collections = await TPY_Collection.find(query)
      .populate("clientId", "name phone email")
      .populate("recordedBy", "name")
      .sort({ clientName: 1 })
    
    // Calcular totales
    const totalExpected = collections.reduce((sum, c) => sum + c.expectedAmount, 0)
    const totalPaid = collections.reduce((sum, c) => sum + c.paidAmount, 0)
    const totalPending = totalExpected - totalPaid
    
    res.json({ 
      success: true, 
      collections, 
      totals: { expected: totalExpected, paid: totalPaid, pending: totalPending } 
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY collections")
  }
})

// GENERATE monthly collections for active clients
app.post("/api/tpy/collections/generate", authenticateToken, requireAdminOrSupervisor, async (req, res) => {
  try {
    const { month } = req.body
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, error: "Month is required in YYYY-MM format" })
    }
    
    // Obtener todos los clientes activos (web_activada)
    const activeClients = await TPY_Client.find({ status: "web_activada" })
    
    let created = 0
    let skipped = 0
    
    for (const client of activeClients) {
      try {
        // Verificar si ya existe cobranza para este cliente/mes
        const existing = await TPY_Collection.findOne({ clientId: client._id, month })
        
        if (existing) {
          skipped++
          continue
        }
        
        // Crear cobranza
        const collection = new TPY_Collection({
          clientId: client._id,
          clientName: client.name,
          clientPhone: client.phone,
          webName: client.webName,
          domain: client.domain,
          month,
          expectedAmount: client.monthlyPrice || 0,
          status: "pendiente",
        })
        
        await collection.save()
        created++
      } catch (err) {
        // Ignorar errores individuales (duplicados, etc)
        skipped++
      }
    }
    
    res.json({ 
      success: true, 
      message: `Created ${created} collections, skipped ${skipped} (existing or errors)`,
      created,
      skipped
    })
  } catch (error) {
    handleError(res, error, "Failed to generate TPY collections")
  }
})

// UPDATE TPY collection (registrar pago)
app.put("/api/tpy/collections/:id", authenticateToken, async (req, res) => {
  try {
    const { paidAmount, status, paymentDate, notes } = req.body
    
    const updateData = {
      ...req.body,
      recordedBy: req.user.userId,
    }
    
    // Si se paga completo, marcar como pagado
    const collection = await TPY_Collection.findById(req.params.id)
    if (collection && paidAmount >= collection.expectedAmount) {
      updateData.status = "pagado"
      updateData.paymentDate = paymentDate || new Date()
    } else if (paidAmount > 0 && paidAmount < collection.expectedAmount) {
      updateData.status = "parcial"
    }
    
    const updated = await TPY_Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updated) {
      return res.status(404).json({ success: false, error: "Collection not found" })
    }
    
    // Si se marco como pagado, crear transaccion de ingreso
    if (updateData.status === "pagado" && paidAmount > 0) {
      const transaction = new TPY_Transaction({
        type: "ingreso",
        category: "Suscripcion",
        concept: `${updated.webName} - ${updated.month}`,
        amount: paidAmount,
        date: paymentDate || new Date(),
        month: updated.month,
        clientId: updated.clientId,
        clientName: updated.clientName,
        recordedBy: req.user.userId,
      })
      await transaction.save()
    }
    
    res.json({ success: true, collection: updated })
  } catch (error) {
    handleError(res, error, "Failed to update TPY collection")
  }
})

// ---------- TPY STATS ----------

// GET TPY dashboard stats
app.get("/api/tpy/stats", authenticateToken, async (req, res) => {
  try {
    const { month } = req.query
    
    // Conteos por estado
    const clientsByStatus = await TPY_Client.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
    
    // Clientes activos
    const activeClients = await TPY_Client.countDocuments({ status: "web_activada" })
    
    // Total demos
    const totalDemos = await TPY_Demo.countDocuments()
    
    // Ventas del mes
    let monthQuery = {}
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)
      monthQuery = { saleDate: { $gte: startDate, $lte: endDate } }
    }
    
    const salesThisMonth = await TPY_Sale.countDocuments(monthQuery)
    
    // Cobranzas del mes
    const collections = month 
      ? await TPY_Collection.find({ month })
      : []
    
    const collectionStats = {
      total: collections.length,
      paid: collections.filter(c => c.status === "pagado").length,
      pending: collections.filter(c => c.status === "pendiente").length,
      expectedAmount: collections.reduce((sum, c) => sum + c.expectedAmount, 0),
      paidAmount: collections.reduce((sum, c) => sum + c.paidAmount, 0),
    }
    
    // Transacciones del mes
    const transactions = month
      ? await TPY_Transaction.find({ month })
      : []
    
    const transactionStats = {
      ingresos: transactions.filter(t => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0),
      egresos: transactions.filter(t => t.type === "egreso").reduce((sum, t) => sum + t.amount, 0),
    }
    transactionStats.balance = transactionStats.ingresos - transactionStats.egresos
    
    res.json({
      success: true,
      stats: {
        clientsByStatus: clientsByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        activeClients,
        totalDemos,
        salesThisMonth,
        collections: collectionStats,
        transactions: transactionStats,
      }
    })
  } catch (error) {
    handleError(res, error, "Failed to fetch TPY stats")
  }
})

// ---------- TPY DATA IMPORT ----------

// Bulk import TPY data (for CSV import)
app.post("/api/tpy/import", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, data } = req.body
    
    if (!type || !data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, error: "Type and data array are required" })
    }
    
    let imported = 0
    let errors = []
    
    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i]
        
        switch (type) {
          case "clients":
            await TPY_Client.create(item)
            break
          case "demos":
            await TPY_Demo.create(item)
            break
          case "sales":
            await TPY_Sale.create(item)
            break
          case "transactions":
            await TPY_Transaction.create(item)
            break
          case "collections":
            await TPY_Collection.create(item)
            break
          default:
            throw new Error(`Unknown type: ${type}`)
        }
        imported++
      } catch (err) {
        errors.push({ index: i, error: err.message })
      }
    }
    
    res.json({
      success: true,
      message: `Imported ${imported} records, ${errors.length} errors`,
      imported,
      errors
    })
  } catch (error) {
    handleError(res, error, "Failed to import TPY data")
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
