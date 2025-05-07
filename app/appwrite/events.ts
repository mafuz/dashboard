import {appwriteConfig, database} from "~/appwrite/client";
import {Query} from "appwrite";

export const getAllEvents = async (limit: number, offset: number) => {
    const allEvents = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.eventCollectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
    )

    if(allEvents.total === 0) {
        console.error('No events found');
        return { allEvents: [], total: 0 }
    }

    return {
        allEvents: allEvents.documents,
        total: allEvents.total,
    }
}

export const getEventById = async (eventId: string) => {
    const event = await database.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.eventCollectionId,
        eventId
    );

    if(!event.$id) {
        console.log('Events not found')
        return null;
    }

    return event;
}