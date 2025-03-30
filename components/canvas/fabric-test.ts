"use client";

// This file is for testing fabric imports

export async function testFabricImport() {
  try {
    console.log("Testing fabric import...");

    // Import fabric using the V6 syntax
    const fabric = await import("fabric");
    console.log("Fabric module:", fabric);

    // Check what's available in the module
    console.log("Module keys:", Object.keys(fabric));

    // Check for Canvas class
    if ("Canvas" in fabric) {
      console.log("Fabric Canvas found:", !!fabric.Canvas);

      // Get available classes safely
      const fabricKeys = Object.keys(fabric);
      const fabricClasses = fabricKeys.filter((key) => {
        return (
          key[0] === key[0].toUpperCase() &&
          typeof (fabric as any)[key] === "function"
        );
      });

      console.log("Available fabric classes:", fabricClasses);
    } else {
      console.error("Fabric Canvas not found");
    }

    return "Fabric import test complete. Check console for results.";
  } catch (error) {
    console.error("Error testing fabric import:", error);
    return `Error: ${error}`;
  }
}
