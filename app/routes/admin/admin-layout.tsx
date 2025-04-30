import { Outlet } from "react-router"

const AdminLayout = () => {

    return (
  
      <div className="admin-layout">
       {/* <MobileSidebar /> */}
       MobileSidebar

<aside className="w-full max-w-[270px] hidden lg:block">
    {/* <SidebarComponent width={270} enableGestures={false}>
        <NavItems />
    </SidebarComponent> */} Sidebar
</aside>

<aside className="children"> 
    <Outlet /> 
</aside>
      </div>
    )
  }
  
  export default AdminLayout