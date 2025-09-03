import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className='min-h-screen w-full flex pb-16 md:pb-0'>
         <LeftSidebar/>
        <div className='flex-1 w-full md:pl-[16%]'>
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout