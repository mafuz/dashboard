import {Header, StatsCard, EventCard} from "../../../components";
import {getAllUsers, getUser} from "~/appwrite/auth";
import type { Route } from './+types/dashboard';
import {getEventsByTravelStyle, getUserGrowthPerDay, getUsersAndEventsStats} from "~/appwrite/dashboard";
import {getAllEvents} from "~/appwrite/events";
import {parseEventData} from "lib/utils";
import {
    Category,
    ChartComponent,
    ColumnSeries,
    DataLabel, SeriesCollectionDirective, SeriesDirective,
    SplineAreaSeries,
    Tooltip
} from "@syncfusion/ej2-react-charts";
import {ColumnDirective, ColumnsDirective, GridComponent, Inject} from "@syncfusion/ej2-react-grids";
import {eventXAxis, eventyAxis, userXAxis, useryAxis} from "~/constants";
//import { dashboardStats } from "~/constants";
import {redirect} from "react-router";

export const clientLoader = async () => {
    const [
        user,
         dashboardStats,
         events,
         userGrowth,
        eventsByTravelStyle,
         allUsers,
    ] = await Promise.all([
        await getUser(),
         await getUsersAndEventsStats(),
         await getAllEvents(4, 0),
         await getUserGrowthPerDay(),
         await getEventsByTravelStyle(),
          await getAllUsers(4, 0),
    ])

    const allEvents = events.allEvents.map(({ $id, eventDetails, imageUrls }) => ({
        id: $id,
        ...parseEventData(eventDetails),
        imageUrls: imageUrls ?? []
    }))

    const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user) => ({
        imageUrl: user.imageUrl,
        name: user.name,
        count: user.itineraryCount ?? Math.floor(Math.random() * 10),
    }))

    return {
        user,
        dashboardStats,
        allEvents,
        userGrowth,
        eventsByTravelStyle,
        allUsers: mappedUsers
    }
}


const Dashboard = ({ loaderData }: Route.ComponentProps) => {

    const user = loaderData.user as User | null;
    const { dashboardStats,  allEvents, userGrowth, eventsByTravelStyle, allUsers} = loaderData;

    const events = allEvents.map((event) => ({
        imageUrl: event.imageUrls[0],
        name: event.name,
        interest: event.interests,
    }))



    const usersAndEvents = [
        {
            title: 'Latest user signups',
            dataSource: allUsers,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Events based on interests',
            dataSource: events,
            field: 'interest',
            headerText: 'Interests'
        }
    ]

    // console.log("hhhh "+eventsByTravelStyle);

    // console.log("fffff" + userGrowth);
  return (

    <main className="dashboard wrapper">
    <Header
        title= {`Welcome ${user?.name ?? 'Guest'} 👋`}
         
        description="Track activity, trends and popular destinations in real time"
    />
      <section className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={dashboardStats.totalUsers}
                         currentMonthCount={dashboardStats.usersJoined.currentMonth}
                         lastMonthCount={dashboardStats.usersJoined.lastMonth}
                    />
                        <StatsCard
                        headerTitle="Total Events"
                        total={dashboardStats.totalEvents}
                        currentMonthCount={dashboardStats.eventsCreated.currentMonth}
                        lastMonthCount={dashboardStats.eventsCreated.lastMonth}
                    /> 
                    <StatsCard
                        headerTitle="Active Users"
                        total={dashboardStats.userRole.total}
                        currentMonthCount={dashboardStats.userRole.currentMonth}
                        lastMonthCount={dashboardStats.userRole.lastMonth}
                    />
                 
                </div>
            </section>
            <section className="container">
                <h1 className="text-xl font-semibold text-dark-100">Created Events</h1>

                <div className='trip-grid'>
                    {allEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            id={event.id.toString()}
                            name={event.name!}
                            imageUrl={event.imageUrls[0]}
                            location={event.itinerary?.[0]?.location ?? ''}
                            tags={[event.interests!, event.travelStyle!]}
                            price={event.estimatedPrice!}
                        />
                    ))}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartComponent
                    id="chart-1"
                    primaryXAxis={userXAxis}
                    primaryYAxis={useryAxis}
                    title="User Growth"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="Column"
                            name="Column"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />

                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="SplineArea"
                            name="Wave"
                            fill="rgba(71, 132, 238, 0.3)"
                            border={{ width: 2, color: '#4784EE'}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>

                <ChartComponent
                    id="chart-2"
                    primaryXAxis={eventXAxis}
                    primaryYAxis={eventyAxis}
                    title="Events Trends"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={eventsByTravelStyle}
                            xName="travelStyle"
                            yName="count"
                            type="Column"
                            name="day"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
            </section>

            <section className="user-trip wrapper">
                {usersAndEvents.map(({ title, dataSource, field, headerText}, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <GridComponent dataSource={dataSource} gridLines="None">
                            <ColumnsDirective>
                                <ColumnDirective
                                    field="name"
                                    headerText="Name"
                                    width="200"
                                    textAlign="Left"
                                    template={(props: UserData) => (
                                        <div className="flex items-center gap-1.5 px-4">
                                            <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                            <span>{props.name}</span>
                                        </div>
                                    )}
                                />

                                <ColumnDirective
                                    field={field}
                                    headerText={headerText}
                                    width="150"
                                    textAlign="Left"
                                />
                            </ColumnsDirective>
                        </GridComponent>
                    </div>
                ))}
            </section>


</main>

  )
}

export default Dashboard
