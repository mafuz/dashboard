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
               
            ]),
       
        
    
] satisfies RouteConfig;
