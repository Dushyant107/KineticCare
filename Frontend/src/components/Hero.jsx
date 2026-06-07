import React from 'react'
import About from './About'
import { Link } from 'react-router-dom'
import Instructions from './Instructions'

const Hero = () => {
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
        });
    };
    return (
        <>

            <div className='w-screen flex flex-col items-center justify-center mt-50'>
                <img src="logo.svg" alt="Logo Here" className="h-30" />
                <div className='h-px bg-black opacity-20 w-[60vw] '></div>
                <div className='w-[60vw] text-center text-base'>
                    <p>An intelligent, real-time physical therapy companion. Using computer vision and advanced spatial 3D tracking, helping people rehabiliting their routines with perfect posture and immediate corrective guidance </p>
                </div>
                <div className='flex gap-6 mt-5'>
                    <Link to="/exercises">
                        <button className="px-7 py-2.5 text-white text-[16px] font-normal bg-linear-to-r drop-shadow-md/15 from-[#63b3ff] to-[#0047d9] transition-all duration-200 hover:opacity-95 hover:-translate-y-px ">
                            Get Started
                        </button>
                    </Link>
                    <button onClick={() => scrollToSection("about")} className="px-7 py-2.5 drop-shadow-2xl/30 text-[16px] font-normal text-black transition-all duration-200 hover:opacity-95 hover:-translate-y-px ">
                        Learn More
                    </button>
                </div>
            </div>
            <div className='px-14'>
                <section id="about">
                    <About />
                </section>

                <section id="instructions">
                    <Instructions />
                </section>
            </div>
        </>
    )
}

export default Hero
