import {Header, EventCard} from "../../../components";
import {type LoaderFunctionArgs, useSearchParams} from "react-router";
import {getAllEvents, getEventById} from "~/appwrite/events";
import {parseEventData} from "lib/utils";
import type {Route} from './+types/events'
import {useState} from "react";
import {PagerComponent} from "@syncfusion/ej2-react-grids";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const limit = 8;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || "1", 10);
    const offset = (page - 1) * limit;

    const { allEvents, total } = await getAllEvents(limit, offset);

    return {
      events: allEvents.map(({ $id, eventDetails, imageUrls }) => ({
            id: $id,
            ...parseEventData(eventDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }
}

const Events = ({ loaderData }: Route.ComponentProps) => {
    const events = loaderData.events as Event[] | [];

    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1')

    const [currentPage, setCurrentPage] = useState(initialPage);

//---pagination function---
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`
    }

    return (
        <main className="all-users wrapper">
            <Header
                title="Events"
                description="View and edit AI-generated event plans"
                ctaText="Create a event"
                ctaUrl="/events/create"
            />

            <section>
                <h1 className="p-24-semibold text-dark-100 mb-4">
                    Manage Created Event
                </h1>

                <div className="trip-grid mb-4">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            name={event.name}
                            imageUrl={event.imageUrls[0]}
                            location={event.itinerary?.[0]?.location ?? ""}
                            tags={[event.interests,event.travelStyle]}
                            price={event.estimatedPrice}
                        />
                    ))}
                </div>

                <PagerComponent
                    totalRecordsCount={loaderData.total}
                    pageSize={8}
                    currentPage={currentPage}
                    click={(args) => handlePageChange(args.currentPage)}
                    cssClass="!mb-4"
                />
            </section>
        </main>
    )
}
export default Events
