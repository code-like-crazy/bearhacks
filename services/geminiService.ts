import {
  FunctionCall,
  FunctionDeclaration,
  GenerateContentResponse, // Import for response type
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part, // Import Part for response checking
  SchemaType,
} from "@google/generative-ai";
import axios from "axios";

import { SelectAiOutput } from "@/lib/db/schema"; // For potential return type hinting

// --- Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.9, // Adjust creativity vs. factuality
  topP: 1, // Adjust the probability threshold for token selection
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Using flash as requested
  safetySettings,
  generationConfig,
});

// --- Function Declarations ---

// Use the potentially resolved SchemaType constant
const searchFlightsFunction: FunctionDeclaration = {
  name: "searchFlights",
  description:
    "Searches for flight options based on destination, dates, and budget.",
  parameters: {
    properties: {
      destination: {
        type: SchemaType.STRING,
        description: "City and country of destination (e.g., Tokyo, Japan)",
      },
      departureDate: {
        type: SchemaType.STRING,
        description: "Departure date in YYYY-MM-DD format",
      },
      returnDate: {
        type: SchemaType.STRING,
        description: "Return date in YYYY-MM-DD format",
      },
      maxPrice: {
        type: SchemaType.NUMBER,
        description:
          "Maximum budget for the round-trip flight per person (optional)",
      },
    },
    type: SchemaType.OBJECT,
    required: ["destination", "departureDate", "returnDate"],
  },
};

const searchHotelsFunction: FunctionDeclaration = {
  name: "searchHotels",
  description:
    "Searches for hotel options based on destination, dates, and preferences.",
  parameters: {
    properties: {
      destination: {
        type: SchemaType.STRING,
        description: "City and country of destination (e.g., Tokyo, Japan)",
      },
      checkInDate: {
        type: SchemaType.STRING,
        description: "Check-in date in YYYY-MM-DD format",
      },
      checkOutDate: {
        type: SchemaType.STRING,
        description: "Check-out date in YYYY-MM-DD format",
      },
      numberOfGuests: {
        type: SchemaType.NUMBER,
        description: "Number of guests staying (default 1)",
      },
      maxPricePerNight: {
        type: SchemaType.NUMBER,
        description: "Maximum budget per night for the hotel room (optional)",
      },
      minRating: {
        type: SchemaType.NUMBER,
        description:
          "Minimum desired hotel rating (e.g., 4 for 4-star and above) (optional)",
      },
    },
    type: SchemaType.OBJECT,
    required: ["destination", "checkInDate", "checkOutDate"],
  },
};

const generateDestinationImageFunction: FunctionDeclaration = {
  name: "generateDestinationImage",
  description:
    "Generates a visually appealing image representing the travel destination.",
  parameters: {
    properties: {
      destinationDescription: {
        type: SchemaType.STRING,
        description:
          "A brief description or keywords for the image generation model (e.g., 'Vibrant Shibuya Crossing at night, Tokyo', 'Relaxing beach scene in Bali')",
      },
    },
    required: ["destinationDescription"],
    type: SchemaType.STRING,
  },
};

const functionDeclarations = [
  searchFlightsFunction,
  searchHotelsFunction,
  generateDestinationImageFunction,
];

// --- Main Service Function ---

// Placeholder types for external API responses
type FlightResult = {
  id: string;
  airline: string;
  price: number;
  departure: string /* ... */;
};
type HotelResult = {
  id: string;
  name: string;
  pricePerNight: number;
  rating?: number /* ... */;
};
type ImageResult = { imageUrl: string };

// Placeholder functions for calling external APIs

const TRAVEL_ADVISOR_API_KEY =
  "a462edae62msh505ff93a62af7b0p15813ajsn41b41771d1e9"; // Replace with your actual Travel Advisor API key
const BOOKING_COM_API_KEY =
  "a462edae62msh505ff93a62af7b0p15813ajsn41b41771d1e9"; // Replace with your actual Booking.com API key

async function callFlightSearchAPI(args: any): Promise<FlightResult[]> {
  console.log("--- Calling Travel Advisor API ---", args);
  // Replace with actual API call to Travel Advisor
  try {
    const response = await axios.get(
      "https://travel-advisor.p.rapidapi.com/flights/search",
      {
        params: {
          departureAirportCode: args.destination, // Assuming destination is the departure airport for now
          arrivalAirportCode: args.destination, // Assuming destination is the arrival airport for now
          departureDate: args.departureDate,
          adults: args.adults || "1",
          currency: args.currency || "USD",
          units: args.units || "km",
          lang: args.lang || "en_US",
        },
        headers: {
          "X-RapidAPI-Key": TRAVEL_ADVISOR_API_KEY, // Use the API key here
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
        },
      },
    );

    // Process the response and map to FlightResult type
    console.log("Travel Advisor API Response:", response.data);
    const flights = response.data.data.map((flight: any) => ({
      id: flight.id,
      airline: flight.airline,
      price: flight.price,
      departure: flight.departureTime,
    }));
    return flights;
  } catch (error: any) {
    console.error("Error calling Travel Advisor API:", error);
    throw new Error(`Travel Advisor API error: ${error.message}`);
  }

  // Return mock data matching schema structure
  // return [
  //     { id: `fl-${Date.now()}`, airline: "MockAir", price: Math.round(Math.random() * 500 + 300), departure: `${args.departureDate}T09:00:00Z` },
  //     { id: `fl-${Date.now()+1}`, airline: "CloudHop", price: Math.round(Math.random() * 500 + 350), departure: `${args.departureDate}T11:30:00Z` },
  // ];
}

async function callHotelSearchAPI(args: any): Promise<HotelResult[]> {
  console.log("--- Calling Booking.com API ---", args);
  // Replace with actual API call to Booking.com
  const options = {
    method: "GET",
    url: "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates",
    params: {
      latitude: args.latitude,
      longitude: args.longitude,
      arrival_date: args.checkInDate,
      departure_date: args.checkOutDate,
      adults: args.numberOfGuests || "1",
      children_age: "0,17",
      room_qty: "1",
      units: "metric",
      page_number: "1",
      temperature_unit: "c",
      languagecode: "en-us",
      currency_code: "EUR",
      location: args.destination,
    },
    headers: {
      "x-rapidapi-key": TRAVEL_ADVISOR_API_KEY, // Use the API key here
      "x-rapidapi-host": "booking-com15.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log("Booking.com API Response:", response.data);
    // Process the response and map to HotelResult type
    // This is just an example, the actual response structure may vary
    const hotels = [
      {
        id: "hotel-1",
        name: "Example Hotel",
        pricePerNight: 100,
        rating: 4.5,
      },
    ];
    return hotels;
  } catch (error: any) {
    console.error("Error calling Booking.com API:", error);
    throw new Error(`Booking.com API error: ${error.message}`);
  }
}

async function callImageGenerationAPI(args: any): Promise<ImageResult> {
  console.log("--- Calling Image Generation API ---", args);
  const GEMINI_IMAGE_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_IMAGE_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return { imageUrl: "" };
  }

  const genAI = new GoogleGenerativeAI(GEMINI_IMAGE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = `Generate a visually appealing image representing the travel destination: ${args.destinationDescription}`;

  try {
    const result = await model.generateContent([prompt]);
    const response = result.response;
    const imagePart = response.candidates?.[0]?.content?.parts?.[0];

    if (imagePart?.inlineData?.data && imagePart?.inlineData?.mimeType) {
      const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      return { imageUrl: imageUrl };
    } else {
      console.error("No image data found in the response.");
      return { imageUrl: "" };
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    return { imageUrl: "" };
  }
}

export async function generateTripPlan(
  boardContent: string,
): Promise<Partial<SelectAiOutput>> {
  console.log("Starting Gemini trip generation...");

  const chat = model.startChat({
    tools: [{ functionDeclarations }],
  });

  const initialPrompt = `
You are a helpful travel planning assistant. Analyze the following user inputs gathered from a collaborative whiteboard. Identify the key travel preferences (destination ideas, activities, budget, dates, style, etc.).

Based on your analysis, suggest ONE primary travel destination (City, Country).

Then, determine the necessary information needed to create a basic travel plan (flights, hotels, a representative image). Use the available tools (searchFlights, searchHotels, generateDestinationImage) to gather this information. If crucial information like dates or a clear destination isn't present in the user inputs, state what's missing instead of calling the functions.

User Inputs:
---
${boardContent}
---

First, provide the suggested destination and a brief summary in JSON format like this:
{
  "place": "Destination City, Country",
  "reason": "Brief explanation of why this destination matches the preferences."
}

Then, call the necessary functions to get flight options, hotel options, and a destination image URL.
`;

  console.log("Sending initial prompt to Gemini...");
  let result = await chat.sendMessage(initialPrompt);
  let response = result.response;
  let functionCallData: Record<string, any> = {}; // To store results from function calls

  // --- Function Calling Loop ---
  // Refined loop condition and access based on potential response structure
  let currentResponse: GenerateContentResponse = result.response; // Use the imported type

  while (
    currentResponse.candidates?.[0]?.content?.parts?.some(
      (part: Part) => part.functionCall,
    )
  ) {
    const functionCalls = currentResponse.candidates[0].content.parts
      .filter((part: Part) => part.functionCall)
      .map((part: Part) => part.functionCall as FunctionCall); // Extract function calls

    console.log(
      `Gemini wants to call ${functionCalls.length} function(s):`,
      functionCalls.map((fc: FunctionCall) => fc.name),
    );

    const functionResponses = [];

    // Iterate directly over the extracted functionCalls array
    for (const call of functionCalls) {
      const functionName = call.name;
      const args = call.args;
      let apiResponseContent;
      let success = false;

      console.log(
        `Executing function: ${functionName} with args:`,
        JSON.stringify(args),
      );

      try {
        if (functionName === "searchFlights") {
          console.log("Calling searchFlights with args:", args);
          apiResponseContent = await callFlightSearchAPI(args);
          console.log("searchFlights API Response:", apiResponseContent);
          functionCallData.flights = apiResponseContent; // Store result
          success = true;
        } else if (functionName === "searchHotels") {
          console.log("Calling searchHotels with args:", args);
          apiResponseContent = await callHotelSearchAPI(args);
          console.log("searchHotels API Response:", apiResponseContent);
          functionCallData.hotels = apiResponseContent; // Store result
          success = true;
        } else if (functionName === "generateDestinationImage") {
          apiResponseContent = await callImageGenerationAPI(args);
          functionCallData.imageUrl = apiResponseContent.imageUrl; // Store result
          success = true;
        } else {
          console.warn(`Unknown function call requested: ${functionName}`);
          apiResponseContent = { error: `Unknown function: ${functionName}` };
        }
      } catch (error: any) {
        console.error(`Error executing function ${functionName}:`, error);
        apiResponseContent = {
          error: `Failed to execute ${functionName}: ${error.message}`,
        };
      }

      functionResponses.push({
        functionName,
        response: {
          name: functionName,
          content: apiResponseContent, // Send structured data back
        },
      });
    } // end for loop

    // Send the function responses back to Gemini
    console.log("Sending function responses back to Gemini...");
    try {
      // Sending function response part back
      result = await chat.sendMessage(
        JSON.stringify({ functionResponse: { parts: functionResponses } }),
      ); // Structure might vary slightly based on exact API needs
      currentResponse = result.response; // Update response for the next loop iteration
    } catch (error) {
      console.error("Error sending function responses back to Gemini:", error);
      // Handle potential errors during the follow-up message
      throw new Error(
        "Failed to continue conversation with Gemini after function calls.",
      );
    }
  } // end while loop

  // --- Process Final Response ---
  console.log(
    "Gemini finished calling functions. Processing final response...",
  );
  // Ensure we get text from the final response object
  const finalResponseText =
    currentResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Final Text from Gemini:", finalResponseText);

  // Attempt to parse the initial destination/summary JSON from the text
  let destination = "Unknown";
  let destinationSummary = {
    place: "Unknown",
    reason: "Could not parse summary",
  };
  try {
    // Basic parsing - might need more robust regex or structured output enforcement
    const jsonMatch = finalResponseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedSummary = JSON.parse(jsonMatch[0]);
      if (parsedSummary.place && parsedSummary.reason) {
        destinationSummary = parsedSummary;
        destination = parsedSummary.place;
      }
    }
  } catch (e) {
    console.error(
      "Failed to parse destination summary JSON from final text:",
      e,
    );
  }

  // TODO: Instruct Gemini to generate itinerary in the final step or parse from finalResponseText

  // Construct the final output object based on parsed info and function call results
  const output: Partial<SelectAiOutput> = {
    destination: destination,
    destinationSummary: JSON.stringify(destinationSummary), // Store as stringified JSON
    destinationImageUrl: functionCallData.imageUrl || "No image generated", // Use stored URL
    vendorOptions: {
      // Use stored flight/hotel data
      flights: functionCallData.flights || [],
      hotels: functionCallData.hotels || [],
    },
    itinerary: { days: [] }, // Placeholder - needs itinerary generation/parsing
    // createdAt will be set in the API route
  };

  console.log("Generated trip plan output (partial):", output);
  return output;
}
