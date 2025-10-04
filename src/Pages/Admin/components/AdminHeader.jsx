import React from 'react'
import { useNavigate } from 'react-router-dom';
import { MdInventory, MdLocalBar, MdBarChart, MdDashboard, MdNotifications } from "react-icons/md";
import { FaChartLine, FaSignOutAlt } from "react-icons/fa";

const adminItems = [
    { icon: MdDashboard, title: 'Overview'},
    { icon: MdInventory, title: 'Stocks'},
    { icon: MdLocalBar, title: 'Liquor'},
    { icon: FaChartLine, title: 'Analytics'},
    { icon: MdNotifications, title: 'Notifications'},
]

export default function AdminHeader({ activeSection, onSectionChange }) {    
    const navigate = useNavigate();

    const handleActive = (item) => {
        onSectionChange(item)
    }

    const handleLogout = () => {
        // Clear any stored data and navigate to home
        navigate('/');
    }

    return (
        <div className='gap-5 flex items-center'>
            {
                adminItems.map((item, i) => (
                    <div 
                        key={i}
                        onClick={ () => handleActive(item.title)}
                        className='flex flex-col text-center cursor-pointer'>
                        <div className={`h-16 w-16 flex items-center justify-center rounded-full ${activeSection === item.title ? 'bg-primaryColor text-white': 'text-other1 border'}`}>
                            <item.icon size={36}/>            
                        </div>
                        <h1 className='text-[16px] mt-1 font-semibold text-other1'>{item.title}</h1>
                    </div>
                ))
            }
            {/* Logout Button */}
            <div className='ml-8'>
                <button
                    onClick={handleLogout}
                    className='flex flex-col items-center text-center cursor-pointer group'
                >
                    <div className='h-16 w-16 flex items-center justify-center rounded-full bg-red text-white hover:bg-other2 transition-colors'>
                        <FaSignOutAlt size={36}/>            
                    </div>
                    <h1 className='text-[16px] mt-1 font-semibold text-red group-hover:text-other2'>Logout</h1>
                </button>
            </div>
        </div>
    )
}
