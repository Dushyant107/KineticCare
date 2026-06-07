import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {

    const user = JSON.parse(localStorage.getItem("user"))

    const handleLogout = () => {

        localStorage.removeItem("user")

        window.location.reload()

    }
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (

        <nav className='sticky top-0 z-50 bg-white'>

            <div className='flex flex-col'>

                <div className='flex items-center justify-between w-screen px-14 py-2.5'>

                    {/* Logo */}
                    <div>
                        <Link to="/">
                        <img
                            src="logo.svg"
                            alt="Logo Here"
                            className="h-8 cursor-pointer"
                            />
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className='flex gap-8 items-center'>

                        {/* Nav Buttons */}
                        <div className='flex gap-6'>
                            <Link to="/">
                            <button >
                                Home
                            </button>
                            </Link>

                            <button onClick={() => scrollToSection("about")}>
                                About
                            </button>

                            <button onClick={() => scrollToSection("instructions")}>
                                Instructions
                            </button>

                        </div>

                        {/* Auth Section */}
                        <div className='flex items-center gap-4'>

                            {/* Profile Icon */}
                            {
                                user && (

                                    <div className='relative group cursor-pointer'>

                                        <div className='h-10 w-10 rounded-full bg-[#0047D9] text-white flex items-center justify-center font-semibold'>

                                            {user.username[0].toUpperCase()}

                                        </div>

                                        {/* Dropdown */}
                                        <div className='absolute right-0 top-14 hidden group-hover:flex flex-col bg-white shadow-lg border w-[220px] p-4 z-50'>

                                            <div className='border-b pb-3'>

                                                <h1 className='font-semibold text-lg'>
                                                    {user.username}
                                                </h1>

                                                <p className='text-sm text-gray-500'>
                                                    {user.email}
                                                </p>

                                            </div>

                                            <div className='flex flex-col gap-2 mt-4'>

                                                <button className='text-left hover:text-[#0047D9]'>
                                                    Dashboard
                                                </button>

                                                <button className='text-left hover:text-[#0047D9]'>
                                                    Starred
                                                </button>

                                                <button className='text-left hover:text-[#0047D9]'>
                                                    Settings
                                                </button>
                                                <p className='text-xs text-red-600'>these features are not fuctional at this time</p>

                                            </div>

                                        </div>

                                    </div>

                                )
                            }

                            {/* Login / Logout */}
                            {
                                user ? (

                                    <button
                                        onClick={handleLogout}
                                        className="px-7 py-2.5 text-white text-[16px] font-normal bg-linear-to-r drop-shadow-md/15 from-[#63b3ff] to-[#0047d9] transition-all duration-200 hover:opacity-95 hover:-translate-y-px "
                                    >
                                        Logout
                                    </button>

                                ) : (

                                    <Link to="/login">

                                        <button className="px-7 py-2.5 text-white text-[16px] font-normal bg-linear-to-r drop-shadow-md/15 from-[#63b3ff] to-[#0047d9] transition-all duration-200 hover:opacity-95 hover:-translate-y-px ">

                                            Login

                                        </button>

                                    </Link>

                                )
                            }

                        </div>

                    </div>

                </div>

                {/* Bottom Border */}
                <div className='h-px w-screen bg-black opacity-30'></div>

            </div>

        </nav>

    )
}

export default Navbar