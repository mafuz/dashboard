import {type RouteConfig, route, layout, index} from "@react-router/dev/routes";

export default 
       [

        layout("routes/admin/admin-layout.tsx", [
                route('dashboard', 'routes/admin/dashboard.tsx'),
                route('users', 'routes/admin/users.tsx'),
               
            ]),
       
        
    
] satisfies RouteConfig;
