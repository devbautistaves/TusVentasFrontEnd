// Script para testear los endpoints de Leads API
// Ejecutar con: node scripts/test-leads-api.js

const API_URL = process.env.API_URL || "https://vps-5905394-x.dattaweb.com"

// Credenciales de prueba (admin)
const TEST_EMAIL = process.env.TEST_EMAIL || "admin@test.com"
const TEST_PASSWORD = process.env.TEST_PASSWORD || "admin123"

async function login() {
  console.log("\n1. Intentando login como admin...")
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  })
  
  const data = await response.json()
  
  if (!response.ok || !data.success) {
    throw new Error(`Login failed: ${data.error || data.message || "Unknown error"}`)
  }
  
  console.log("   Login exitoso! Usuario:", data.user.name, "- Rol:", data.user.role)
  return data.token
}

async function getSellers(token) {
  console.log("\n2. Obteniendo lista de vendedores...")
  const response = await fetch(`${API_URL}/api/admin/users`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Get users failed: ${data.error || "Unknown error"}`)
  }
  
  const sellers = data.users.filter(u => u.role === "seller" && u.isActive)
  console.log(`   Encontrados ${sellers.length} vendedores activos`)
  
  if (sellers.length === 0) {
    throw new Error("No hay vendedores activos para asignar leads")
  }
  
  return sellers
}

async function getPlans(token) {
  console.log("\n3. Obteniendo lista de planes...")
  const response = await fetch(`${API_URL}/api/plans`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Get plans failed: ${data.error || "Unknown error"}`)
  }
  
  const activePlans = data.plans.filter(p => p.isActive)
  console.log(`   Encontrados ${activePlans.length} planes activos`)
  
  return activePlans
}

async function testCreateLead(token, sellerId, planId) {
  console.log("\n4. Test: Crear lead con datos minimos...")
  
  const leadData = {
    name: "Test Lead Minimo",
    phone: "1122334455",
    assignedTo: sellerId,
  }
  
  const response = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  })
  
  const data = await response.json()
  console.log("   Response status:", response.status)
  console.log("   Response body:", JSON.stringify(data, null, 2))
  
  if (!response.ok) {
    console.log("   ERROR: No se pudo crear el lead con datos minimos")
    return null
  }
  
  console.log("   EXITO: Lead creado con ID:", data.lead._id)
  return data.lead
}

async function testCreateLeadWithEmptyFields(token, sellerId) {
  console.log("\n5. Test: Crear lead con campos vacios (interestedPlanId vacio)...")
  
  const leadData = {
    name: "Test Lead Campos Vacios",
    phone: "1155667788",
    email: "",  // vacio
    dni: "",    // vacio
    address: {
      street: "",
      number: "",
      city: "",
      province: "",
      postalCode: "",
    },
    source: "facebook",
    sourceDetail: "",
    assignedTo: sellerId,
    priority: "media",
    interestedPlanId: "",  // <-- Este es el problema potencial
    notes: "",
  }
  
  const response = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  })
  
  const data = await response.json()
  console.log("   Response status:", response.status)
  console.log("   Response body:", JSON.stringify(data, null, 2))
  
  if (!response.ok) {
    console.log("   ERROR: No se pudo crear el lead con campos vacios")
    console.log("   Detalles del error:", data.details || data.error)
    return null
  }
  
  console.log("   EXITO: Lead creado con ID:", data.lead._id)
  return data.lead
}

async function testCreateLeadWithPlan(token, sellerId, planId) {
  console.log("\n6. Test: Crear lead con plan de interes valido...")
  
  const leadData = {
    name: "Test Lead Con Plan",
    phone: "1199887766",
    email: "test@email.com",
    assignedTo: sellerId,
    priority: "alta",
    interestedPlanId: planId,
    source: "instagram",
  }
  
  const response = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(leadData),
  })
  
  const data = await response.json()
  console.log("   Response status:", response.status)
  console.log("   Response body:", JSON.stringify(data, null, 2))
  
  if (!response.ok) {
    console.log("   ERROR: No se pudo crear el lead con plan")
    return null
  }
  
  console.log("   EXITO: Lead creado con ID:", data.lead._id)
  return data.lead
}

async function testGetLeads(token) {
  console.log("\n7. Test: Obtener todos los leads...")
  
  const response = await fetch(`${API_URL}/api/leads`, {
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  })
  
  const data = await response.json()
  console.log("   Response status:", response.status)
  
  if (!response.ok) {
    console.log("   ERROR: No se pudieron obtener los leads")
    return []
  }
  
  console.log(`   EXITO: Obtenidos ${data.leads.length} leads`)
  return data.leads
}

async function testDeleteLead(token, leadId) {
  console.log(`\n8. Test: Eliminar lead ${leadId}...`)
  
  const response = await fetch(`${API_URL}/api/leads/${leadId}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  })
  
  const data = await response.json()
  console.log("   Response status:", response.status)
  
  if (!response.ok) {
    console.log("   ERROR: No se pudo eliminar el lead")
    return false
  }
  
  console.log("   EXITO: Lead eliminado")
  return true
}

async function runTests() {
  console.log("=========================================")
  console.log("     TEST DE ENDPOINTS DE LEADS API     ")
  console.log("=========================================")
  console.log("API URL:", API_URL)
  
  try {
    // 1. Login
    const token = await login()
    
    // 2. Get sellers
    const sellers = await getSellers(token)
    const testSellerId = sellers[0]._id
    console.log("   Usando vendedor:", sellers[0].name, "ID:", testSellerId)
    
    // 3. Get plans
    const plans = await getPlans(token)
    const testPlanId = plans.length > 0 ? plans[0]._id : null
    if (testPlanId) {
      console.log("   Usando plan:", plans[0].name, "ID:", testPlanId)
    }
    
    // 4. Test create lead con datos minimos
    const lead1 = await testCreateLead(token, testSellerId, testPlanId)
    
    // 5. Test create lead con campos vacios (el caso problematico)
    const lead2 = await testCreateLeadWithEmptyFields(token, testSellerId)
    
    // 6. Test create lead con plan (si hay planes)
    let lead3 = null
    if (testPlanId) {
      lead3 = await testCreateLeadWithPlan(token, testSellerId, testPlanId)
    }
    
    // 7. Get all leads
    await testGetLeads(token)
    
    // 8. Cleanup - eliminar leads de prueba
    console.log("\n9. Limpieza: Eliminando leads de prueba...")
    if (lead1) await testDeleteLead(token, lead1._id)
    if (lead2) await testDeleteLead(token, lead2._id)
    if (lead3) await testDeleteLead(token, lead3._id)
    
    console.log("\n=========================================")
    console.log("     TESTS COMPLETADOS                  ")
    console.log("=========================================")
    
  } catch (error) {
    console.error("\n!!! ERROR EN LOS TESTS !!!")
    console.error(error.message)
    process.exit(1)
  }
}

runTests()
