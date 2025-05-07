import {type RouteConfig, route, layout, index} from "@react-router/dev/routes";

export default 

       [
         route('sign-in', 'routes/root/sign-in.tsx'),
         route('api/create-event', 'routes/api/create-event.ts'),
        layout("routes/admin/admin-layout.tsx", [
                route('dashboard', 'routes/admin/dashboard.tsx'),
                route('users', 'routes/admin/users.tsx'),
                route('events', 'routes/admin/events.tsx'),
                route('events/create', 'routes/admin/create-event.tsx'),
                route('events/:eventId', 'routes/admin/event-detail.tsx'),
            ]),
            layout('routes/root/page-layout.tsx', [
              index('routes/root/event-page.tsx'),
              // route('/travel/:tripId', 'routes/root/travel-detail.tsx'),
              // route('/travel/:tripId/success', 'routes/root/payment-success.tsx'),
          ])
        
    
] satisfies RouteConfig;
