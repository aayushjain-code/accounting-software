#!/usr/bin/env node

// Simple test to check if we can read from Supabase tables
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

async function testSupabaseRead() {
  console.log("🧪 Testing Supabase read operations...\n");

  try {
    // Test 1: Check connection
    console.log("1️⃣ Testing connection...");
    const { data: testData, error: testError } = await supabase
      .from("clients")
      .select("count")
      .limit(1);

    if (testError) {
      throw testError;
    }
    console.log("✅ Connection successful\n");

    // Test 2: Check table structure
    console.log("2️⃣ Checking table structure...");

    // Check clients table
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .limit(1);

    if (clientsError) {
      console.log("❌ Clients table error:", clientsError.message);
    } else {
      console.log("✅ Clients table accessible");
      console.log(`   Found ${clients.length} clients`);
      if (clients.length > 0) {
        console.log("   Sample client:", Object.keys(clients[0]));
      }
    }

    // Check projects table
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .limit(1);

    if (projectsError) {
      console.log("❌ Projects table error:", projectsError.message);
    } else {
      console.log("✅ Projects table accessible");
      console.log(`   Found ${projects.length} projects`);
      if (projects.length > 0) {
        console.log("   Sample project:", Object.keys(projects[0]));
      }
    }

    // Check timesheets table
    const { data: timesheets, error: timesheetsError } = await supabase
      .from("timesheets")
      .select("*")
      .limit(1);

    if (timesheetsError) {
      console.log("❌ Timesheets table error:", timesheetsError.message);
    } else {
      console.log("✅ Timesheets table accessible");
      console.log(`   Found ${timesheets.length} timesheets`);
      if (timesheets.length > 0) {
        console.log("   Sample timesheet:", Object.keys(timesheets[0]));
      }
    }

    // Check invoices table
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .limit(1);

    if (invoicesError) {
      console.log("❌ Invoices table error:", invoicesError.message);
    } else {
      console.log("✅ Invoices table accessible");
      console.log(`   Found ${invoices.length} invoices`);
      if (invoices.length > 0) {
        console.log("   Sample invoice:", Object.keys(invoices[0]));
      }
    }

    console.log("\n🎉 Supabase read test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testSupabaseRead();
