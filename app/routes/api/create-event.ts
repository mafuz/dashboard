import {type ActionFunctionArgs, data} from "react-router";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {parseMarkdownToJson, parseEventData} from "lib/utils";
import {appwriteConfig, database} from "~/appwrite/client";
import {ID} from "appwrite";

export const action = async ({ request }: ActionFunctionArgs) => {
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId,
    } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

    try {
        const prompt = `Generate a ${numberOfDays}-day event itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the event",
        "description": "A brief description of the event and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the event in Ghana cedi, e.g.₵price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeForEvent": [
          '🌸 Season (from month to month): reason for event',
          '☀️ Season (from month to month): reason for event',
          '🍁 Season (from month to month): reason for event',
          '❄️ Season (from month to month): reason for event'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local bar"}
          ]
        },
        ...
        ]
    }`;

        const textResult = await genAI
            .getGenerativeModel({ model: 'gemini-2.0-flash' })
            .generateContent([prompt])

        const event = parseMarkdownToJson(textResult.response.text());

        const imageResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
        );

        const imageUrls = (await imageResponse.json()).results.slice(0, 3)
            .map((result: any) => result.urls?.regular || null);

        const result = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.eventCollectionId,
            ID.unique(),
            {
                eventDetails: JSON.stringify(event),
                createdAt: new Date().toISOString(),
                imageUrls,
                userId,
            }
        )

        // const eventDetail = parseEventData(result.eventDetails) as Event;
        // const eventPrice = parseInt(eventDetail.estimatedPrice.replace('₵', ''), 10)
        // const paymentLink = await createProduct(
        //      eventDetail.name,
        //      eventDetail.description,
        //     imageUrls,
        //     eventPrice,
        //     result.$id
        // )

        // await database.updateDocument(
        //     appwriteConfig.databaseId,
        //     appwriteConfig.eventCollectionId,
        //     result.$id,
        //     {
        //         payment_link: paymentLink.url
        //     }
        // )

        return data({ id: result.$id })
    } catch (e) {
        console.error('Error generating event plan: ', e);
    }
}
