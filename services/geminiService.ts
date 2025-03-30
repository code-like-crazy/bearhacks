import {
  FunctionCall,
  FunctionDeclaration,
  GenerateContentResponse,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
  SchemaType,
} from "@google/generative-ai";
import axios from "axios";
import { SelectAiOutput } from "@/lib/db/schema";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.9,
  topP: 1,
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
  model: "gemini-2.0-flash",
  safetySettings,
  generationConfig,
});

const searchFlightsFunction: FunctionDeclaration = {
  name: "searchFlights",
  description: "Searches for flight options based on destination, dates, and budget.",
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
        description: "Maximum budget for the round-trip flight per person (optional)",
      },
    },
    type: SchemaType.OBJECT,
    required: ["destination", "departureDate", "returnDate"],
  },
};

const searchHotelsFunction: FunctionDeclaration = {
  name: "searchHotels",
  description: "Searches for hotel options based on destination, dates, and preferences.",
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
        description: "Minimum desired hotel rating (e.g., 4 for 4-star and above) (optional)",
      },
    },
    type: SchemaType.OBJECT,
    required: ["destination", "checkInDate", "checkOutDate"],
  },
};

const generateDestinationImageFunction: FunctionDeclaration = {
  name: "generateDestinationImage",
  description: "Generates a visually appealing image representing the travel destination.",
  parameters: {
    properties: {
      destinationDescription: {
        type: SchemaType.STRING,
        description: "A brief description or keywords for the image generation model",
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

type FlightResult = {
  id: string;
  airline: string;
  price: number;
  departure: string;
};

type HotelResult = {
  id: string;
  name: string;
  pricePerNight: number;
  rating?: number;
};

type ImageResult = { 
  imageUrl: string 
};

const TRAVEL_ADVISOR_API_KEY = "a462edae62msh505ff93a62af7b0p15813ajsn41b41771d1e9";
const BOOKING_COM_API_KEY = "a462edae62msh505ff93a62af7b0p15813ajsn41b41771d1e9";

async function callFlightSearchAPI(args: any): Promise<FlightResult[]> {
  console.log("Searching flights for:", args);
  try {
    const response = await axios.get("https://travel-advisor.p.rapidapi.com/flights/search", {
      params: {
        departureAirportCode: args.destination,
        arrivalAirportCode: args.destination,
        departureDate: args.departureDate,
        adults: "1",
        currency: "USD",
      },
      headers: {
        "X-RapidAPI-Key": TRAVEL_ADVISOR_API_KEY,
        "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
      },
    });

    return response.data.data.map((flight: any) => ({
      id: flight.id,
      airline: flight.airline,
      price: flight.price,
      departure: flight.departureTime,
    }));
  } catch (error) {
    console.error("Flight search error:", error);
    return [];
  }
}

async function callHotelSearchAPI(args: any): Promise<HotelResult[]> {
  console.log("Searching hotels for:", args);
  try {
    const response = await axios.get("https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates", {
      params: {
        latitude: "0",
        longitude: "0",
        arrival_date: args.checkInDate,
        departure_date: args.checkOutDate,
        adults: args.numberOfGuests || "1",
        room_qty: "1",
        location: args.destination,
      },
      headers: {
        "X-RapidAPI-Key": TRAVEL_ADVISOR_API_KEY,
        "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
      },
    });

    return [
      {
        id: "mock-hotel-1",
        name: "Sample Hotel",
        pricePerNight: 150,
        rating: 4.5,
      }
    ];
  } catch (error) {
    console.error("Hotel search error:", error);
    return [];
  }
}

async function callImageGenerationAPI(args: any): Promise<ImageResult> {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return { imageUrl: "" };
  }

  const imageGenAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const imageModel = imageGenAI.getGenerativeModel({ model: "gemini-pro-vision" });

  try {
    const result = await imageModel.generateContent([`Generate an image of ${args.destinationDescription}`]);
    const response = result.response;
    const imagePart = response.candidates?.[0]?.content?.parts?.[0];

    if (imagePart?.inlineData?.data) {
      return { 
        imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` 
      };
    }
  } catch (error) {
    console.error("Image generation error:", error);
  }

  return { imageUrl: "" };
}

export async function generateTripPlan(boardContent: string): Promise<Partial<SelectAiOutput>> {
  console.log("Starting trip plan generation...");

  const chat = model.startChat({
    tools: [{ functionDeclarations }],
  });

  const initialPrompt = `
You are an expert travel planning assistant analyzing text from a collaborative whiteboard.

The input contains text elements with:
- Type (Sticky Note or Text Box)
- Content
- Position on board
- Creation timestamp

ANALYSIS INSTRUCTIONS:
1. Examine each element's:
   - Content and context
   - When it was added (evolution of discussion)
   - Position (related ideas may be grouped)

2. Identify travel preferences:
   - Destination ideas
   - Activities/interests
   - Budget constraints
   - Timing preferences
   - Travel style (luxury/adventure/etc)
   - Group details

3. Suggest ONE destination that best matches the group's needs.

4. Format your suggestion as JSON:
{
  "place": "City, Country",
  "reason": "Detailed explanation referencing specific notes from the board"
}

BOARD CONTENT:
${boardContent}

After providing destination JSON:
- Use searchFlights if dates known
- Use searchHotels if accommodation needs clear
- Use generateDestinationImage for preview

If crucial details missing (dates/budget), specify what's needed.`;

  console.log("Sending initial prompt to Gemini...");
  let result = await chat.sendMessage(initialPrompt);
  let currentResponse = result.response;
  const functionCallData: Record<string, any> = {};

  while (currentResponse.candidates?.[0]?.content?.parts?.some(part => part.functionCall)) {
    const functionCalls = currentResponse.candidates[0].content.parts
      .filter(part => part.functionCall)
      .map(part => part.functionCall as FunctionCall);

    console.log(`Processing ${functionCalls.length} function calls`);
    
    const functionResponses = [];

    for (const call of functionCalls) {
      console.log(`Executing ${call.name}:`, call.args);
      
      try {
        let response;
        switch (call.name) {
          case "searchFlights":
            response = await callFlightSearchAPI(call.args);
            functionCallData.flights = response;
            break;
          case "searchHotels":
            response = await callHotelSearchAPI(call.args);
            functionCallData.hotels = response;
            break;
          case "generateDestinationImage":
            response = await callImageGenerationAPI(call.args);
            functionCallData.imageUrl = response.imageUrl;
            break;
        }
        
        functionResponses.push({
          name: call.name,
          content: response
        });
      } catch (error) {
        console.error(`Error in ${call.name}:`, error);
        functionResponses.push({
          name: call.name,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    result = await chat.sendMessage(JSON.stringify({ 
      functionResponse: { parts: functionResponses } 
    }));
    currentResponse = result.response;
  }

  const finalText = currentResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Final response:", finalText);

  let destination = "Unknown";
  let destinationSummary = {
    place: "Unknown",
    reason: "Could not determine from board content"
  };

  try {
    const jsonMatch = finalText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.place && parsed.reason) {
        destinationSummary = parsed;
        destination = parsed.place;
      }
    }
  } catch (error) {
    console.error("Error parsing destination JSON:", error);
  }

  return {
    destination,
    destinationSummary: JSON.stringify(destinationSummary),
    destinationImageUrl: functionCallData.imageUrl || "",
    vendorOptions: {
      flights: functionCallData.flights || [],
      hotels: functionCallData.hotels || []
    },
    itinerary: { days: [] }
  };
}
