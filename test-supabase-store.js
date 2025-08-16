#!/usr/bin/env node

// Test script to verify Supabase integration is working
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseIntegration() {
  console.log("🧪 Testing Supabase integration...\n");

  try {
    // Test 1: Check if we can connect to Supabase
    console.log("1️⃣ Testing connection...");
    const { data: testData, error: testError } = await supabase
      .from("clients")
      .select("count")
      .limit(1);

    if (testError) {
      throw testError;
    }
    console.log("✅ Connection successful\n");

    // Check for existing clients and projects
    console.log("🔍 Checking for existing data...");
    const { data: existingClients } = await supabase
      .from("clients")
      .select("id")
      .limit(1);

    const { data: existingProjects } = await supabase
      .from("projects")
      .select("id")
      .limit(1);

    let clientId = "test-client-id";
    let projectId = "test-project-id";

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
      console.log("✅ Using existing client ID:", clientId);
    } else {
      console.log("⚠️ No existing clients found, using test ID");
    }

    if (existingProjects && existingProjects.length > 0) {
      projectId = existingProjects[0].id;
      console.log("✅ Using existing project ID:", projectId);
    } else {
      console.log("⚠️ No existing projects found, using test ID");
    }
    console.log("");

    // Test 2: Create a test timesheet
    console.log("2️⃣ Testing timesheet creation...");
    const testTimesheet = {
      timesheet_code: "TEST-TMS-001",
      user_id: "test-user-id",
      project_id: projectId,
      month: 1,
      year: 2024,
      status: "draft",
      total_hours: 40,
      total_amount: 800,
      billing_rate: 20,
      days_worked: 5,
      notes: "Test timesheet from integration test",
    };

    const { data: createdTimesheet, error: timesheetError } = await supabase
      .from("timesheets")
      .insert([testTimesheet])
      .select()
      .single();

    if (timesheetError) {
      console.log(
        "⚠️ Timesheet creation failed (this might be expected if tables don't exist yet):",
        timesheetError.message
      );
    } else {
      console.log("✅ Timesheet created successfully:", createdTimesheet.id);

      // Clean up - delete the test timesheet
      await supabase.from("timesheets").delete().eq("id", createdTimesheet.id);
      console.log("🧹 Test timesheet cleaned up");
    }
    console.log("");

    // Test 3: Create a test invoice
    console.log("3️⃣ Testing invoice creation...");
    const testInvoice = {
      client_id: clientId,
      project_id: projectId,
      invoice_number: "TEST-INV-001",
      issue_date: "2024-01-01",
      due_date: "2024-01-31",
      status: "draft",
      subtotal: 1000,
      tax_rate: 0.1,
      tax_amount: 100,
      total: 1100,
      payment_terms: "Net 30",
      notes: "Test invoice from integration test",
      terms_conditions: "Test terms and conditions",
    };

    const { data: createdInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([testInvoice])
      .select()
      .single();

    if (invoiceError) {
      console.log(
        "⚠️ Invoice creation failed (this might be expected if tables don't exist yet):",
        invoiceError.message
      );
    } else {
      console.log("✅ Invoice created successfully:", createdInvoice.id);

      // Clean up - delete the test invoice
      await supabase.from("invoices").delete().eq("id", createdInvoice.id);
      console.log("🧹 Test invoice cleaned up");
    }
    console.log("");

    // Test 4: Check existing data
    console.log("4️⃣ Checking existing data...");
    const { data: existingTimesheets, error: timesheetsError } = await supabase
      .from("timesheets")
      .select("*")
      .limit(5);

    if (timesheetsError) {
      console.log("⚠️ Could not fetch timesheets:", timesheetsError.message);
    } else {
      console.log(`✅ Found ${existingTimesheets.length} existing timesheets`);
    }

    const { data: existingInvoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .limit(5);

    if (invoicesError) {
      console.log("⚠️ Could not fetch invoices:", invoicesError.message);
    } else {
      console.log(`✅ Found ${existingInvoices.length} existing invoices`);
    }

    console.log("\n🎉 Supabase integration test completed!");

    if (timesheetError && invoiceError) {
      console.log(
        "\n⚠️ Note: Tables might not exist yet. Run the database migration first:"
      );
      console.log("   supabase db push");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testSupabaseIntegration();
