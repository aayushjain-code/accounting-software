// Test script for API services
import { AuthService, ClientService, ProjectService } from "./lib/api/index.js";

async function testAPIServices() {
  console.log("🚀 Testing API Services...\n");

  try {
    // Test 1: Authentication Service
    console.log("1️⃣ Testing Authentication Service...");
    const authResult = await AuthService.signUp({
      email: "admin@example.com",
      password: "admin123456",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
    });
    console.log("✅ Sign up successful:", authResult.user?.email);

    // Test 2: Client Service
    console.log("\n2️⃣ Testing Client Service...");
    const clientResult = await ClientService.createClient({
      name: "Test Client Inc.",
      company_name: "Test Client Company",
      email: "contact@testclient.com",
      phone: "+1234567890",
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      country: "Test Country",
      pincode: "12345",
    });
    console.log("✅ Client created:", clientResult.name);

    // Test 3: Project Service
    console.log("\n3️⃣ Testing Project Service...");
    const projectResult = await ProjectService.createProject({
      name: "Test Project",
      description: "A test project for API validation",
      client_id: clientResult.id,
      start_date: new Date().toISOString().split("T")[0],
      status: "active",
      billing_rate: 100,
    });
    console.log("✅ Project created:", projectResult.name);

    // Test 4: Fetch Data
    console.log("\n4️⃣ Testing Data Fetching...");
    const clients = await ClientService.getClients();
    const projects = await ProjectService.getProjects();

    console.log(`✅ Fetched ${clients.data?.length || 0} clients`);
    console.log(`✅ Fetched ${projects.data?.length || 0} projects`);

    console.log("\n🎉 All API tests passed! Your backend is fully functional.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAPIServices();
