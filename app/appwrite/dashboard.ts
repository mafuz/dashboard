import { parseEventData } from "lib/utils";
import { database, appwriteConfig } from "./client";

interface Document {
    [key: string]: any;
}

type FilterByDate = (
    items: Document[],
    key: string,
    start: string,
    end?: string
) => number;

export const getUsersAndEventsStats = async (): Promise<DashboardStats> => {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const startPrev = new Date(d.getFullYear(), d.getMonth() -1, 1).toISOString();
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    const [users, events] = await Promise.all([
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        ),
        database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventCollectionId
        ),
    ])

    const filterByDate: FilterByDate = (items, key, start, end) => items.filter((item) => (
        item[key] >= start && (!end || item[key] <= end)
    )).length;

    const filterUsersByRole = (role: string) => {
        return users.documents.filter((u: Document) => u.status === role)
    }

    return {
        totalUsers: users.total,
        usersJoined: {
            currentMonth: filterByDate(
                users.documents,
                'joinedAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                users.documents,
                'joinedAt',
                startPrev,
                endPrev
            )
        },
        userRole: {
            total: filterUsersByRole('user').length,
            currentMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
        totalEvents: events.total,
        eventsCreated: {
            currentMonth: filterByDate(
                events.documents,
                'createdAt',
                startCurrent,
                undefined
            ),
            lastMonth: filterByDate(
                filterUsersByRole('user'),
                'joinedAt',
                startPrev,
                endPrev
            )
        },
    }
}

export const getUserGrowthPerDay = async () => {
    const users = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId
    );

    const userGrowth = users.documents.reduce(
        (acc: { [key: string]: number }, user: Document) => {
            const date = new Date(user.joinedAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getEventsCreatedPerDay = async () => {
    const events = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.eventCollectionId
    );

    const eventsGrowth = events.documents.reduce(
        (acc: { [key: string]: number }, event: Document) => {
            const date = new Date(event.createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(eventsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getEventsByTravelStyle = async () => {
    const events = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.eventCollectionId
    );

    const travelStyleCounts = events.documents.reduce(
        (acc: { [key: string]: number }, event: Document) => {
            const eventDetail = parseEventData(event.eventDetails);

            if (eventDetail && eventDetail.travelStyle) {
                const travelStyle = eventDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};
