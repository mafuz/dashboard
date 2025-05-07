import type {LoaderFunctionArgs} from "react-router";
import {getAllEvents, getEventById} from "~/appwrite/events";
import type { Route } from './+types/event-detail';
import {cn, getFirstWord, parseEventData} from "lib/utils";
import {Header, InfoPill, EventCard} from "../../../components";
import {ChipDirective, ChipListComponent, ChipsDirective} from "@syncfusion/ej2-react-buttons";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { eventId } = params;
    if(!eventId) throw new Error ('EventID is required');

    const [event, events] = await Promise.all([
        getEventById(eventId),
        getAllEvents(4, 0)
    ]);

    return {
        event,
        allEvents: events.allEvents.map(({ $id, eventDetails, imageUrls }) => ({
            id: $id,
            ...parseEventData(eventDetails),
            imageUrls: imageUrls ?? []
        }))
    }
}

const TripDetail = ({ loaderData }: Route.ComponentProps) => {
    const imageUrls = loaderData?.event?.imageUrls || [];
    const eventData = parseEventData(loaderData?.event?.eventDetails);

    const {
        name, duration, itinerary, travelStyle,
        groupType, budget, interests, estimatedPrice,
        description, bestTimeToVisit, weatherInfo, country
    } = eventData || {};
    const allEvents = loaderData.allEvents as Event[] | [];

    const pillItems = [
        { text: travelStyle, bg: '!bg-pink-50 !text-pink-500' },
        { text: groupType, bg: '!bg-primary-50 !text-primary-500' },
        { text: budget, bg: '!bg-success-50 !text-success-700' },
        { text: interests, bg: '!bg-navy-50 !text-navy-500' },
    ]

    const visitTimeAndWeatherInfo = [
        { title: 'Best Time to Visit:', items: bestTimeToVisit},
        { title: 'Weather:', items: weatherInfo}
    ]

    return (
        <main className="travel-detail wrapper">
            <Header title="Event Details" description="View and edit AI-generated travel plans" />

            <section className="container wrapper-md">
                <header>
                    <h1 className="p-40-semibold text-dark-100">{name}</h1>
                    <div className="flex items-center gap-5">
                <InfoPill
                    text={`${duration} day plan`}
                    image="/assets/icons/calendar.svg"
                />

                <InfoPill
                    text={itinerary?.slice(0,4)
                        .map((item) => item.location).join(', ') || ''}
                    image="/assets/icons/location-mark.svg"
                />
                    </div>
                </header>

                <section className="gallery">
                    {imageUrls.map((url: string, i: number) => (
                        <img
                            src={url}
                            key={i}
                            className={cn('w-full rounded-xl object-cover', i === 0
                            ? 'md:col-span-2 md:row-span-2 h-[330px]'
                            : 'md:row-span-1 h-[150px]')}
                        />
                    ))}
                </section>

                <section className="flex gap-3 md:gap-5 items-center flex-wrap">
                    <ChipListComponent id="travel-chip">
                        <ChipsDirective>
                            {pillItems.map((pill, i) => (
                                <ChipDirective
                                    key={i}
                                    text={getFirstWord(pill.text)}
                                    cssClass={`${pill.bg} !text-base !font-medium !px-4`}
                                />
                            ))}
                        </ChipsDirective>
                    </ChipListComponent>

                    <ul className="flex gap-1 items-center">
                        {Array(5).fill('null').map((_, index) => (
                            <li key={index}>
                                <img
                                    src="/assets/icons/star.svg"
                                    alt="star"
                                    className="size-[18px]"
                                />
                            </li>
                        ))}

                        <li className="ml-1">
                            <ChipListComponent>
                                <ChipsDirective>
                                    <ChipDirective
                                        text="4.9/5"
                                        cssClass="!bg-yellow-50 !text-yellow-700"
                                    />
                                </ChipsDirective>
                            </ChipListComponent>
                        </li>
                    </ul>
                </section>

                <section className="title">
                    <article>
                        <h3>
                            {duration}-Day {country} {travelStyle} Trip
                        </h3>
                        <p>{budget}, {groupType} and {interests}</p>
                    </article>

                    <h2>{estimatedPrice}</h2>
                </section>

                <p className="text-sm md:text-lg font-normal text-dark-400">{description}</p>

                <ul className="itinerary">
                    {itinerary?.map((dayPlan: DayPlan, index: number) => (
                        <li key={index}>
                            <h3>
                                Day {dayPlan.day}: {dayPlan.location}
                            </h3>

                            <ul>
                                {dayPlan.activities.map((activity, index: number) => (
                                    <li key={index}>
                                        <span className="flex-shring-0 p-18-semibold">{activity.time}</span>
                                        <p className="flex-grow">{activity.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                {visitTimeAndWeatherInfo.map((section) => (
                    <section key={section.title} className="visit">
                        <div>
                            <h3>{section.title}</h3>

                            <ul>
                                {section.items?.map((item) => (
                                    <li key={item}>
                                        <p className="flex-grow">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                ))}

            </section>

            <section className="flex flex-col gap-6">
                <h2 className="p-24-semibold text-dark-100">Popular Events</h2>

                <div className="trip-grid">
                    {allEvents.map((trip) => (
                        <EventCard
                            key={trip.id}
                            id={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ""}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}
export default TripDetail



//681892640012221b4285
