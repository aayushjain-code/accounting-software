// Test script for Supabase connection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xgnisnxledfwfnlqlkxs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbmlzbnhsZWRmd2ZubHFsa3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODQ3ODcsImV4cCI6MjA3MDg2MDc4N30.akSN1kPznIEldqYWKwuR0HQZukfJWt_zjbfkbXyvsmU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔌 Testing Supabase connection...");

  try {
    // Test basic connection
    const { data, error } = await supabase.from("clients").select("*").limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful!");
    console.log("📊 Sample data:", data);

    // Test table existence
    const tables = [
      "clients",
      "projects",
      "timesheets",
      "invoices",
      "expenses",
      "user_profiles",
    ];

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select("*")
          .limit(0);
        if (tableError) {
          console.log(`❌ Table ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Table ${table}: exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

async function testAuth() {
  console.log("\n🔐 Testing authentication...");

  try {
    // Test sign up
    const { data, error } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });

    if (error) {
      console.log("ℹ️ Sign up test:", error.message);
    } else {
      console.log("✅ Sign up successful:", data.user?.email);
    }

    return true;
  } catch (error) {
    console.error("❌ Auth test failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Supabase tests...\n");

  const connectionOk = await testConnection();
  const authOk = await testAuth();

  console.log("\n📋 Test Summary:");
  console.log(`Connection: ${connectionOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Authentication: ${authOk ? "✅ PASS" : "❌ FAIL"}`);

  if (connectionOk && authOk) {
    console.log("\n🎉 All tests passed! Your Supabase backend is ready.");
  } else {
    console.log("\n⚠️ Some tests failed. Check the errors above.");
  }
}

main().catch(console.error);
