import React from 'react'

const About = () => {
  return (
    <div className='mt-10 pt-30'>
      <div>
        <span className='font-raleway font-bold text-2xl'>About Kinetic</span>
        <span className='font-raleway font-bold text-2xl text-primary'>Care</span>
      </div>
      <div className='w-[85vw] mt-4 text-justify'>
        <p>
          KineticCare is an AI-powered physiotherapy and rehabilitation platform developed to make recovery support more accessible, intelligent, and user-friendly. The platform combines computer vision, pose estimation, and real-time movement analysis to assist users in performing therapeutic exercises with greater confidence and accuracy.<br/><br/>

          Traditional physiotherapy often requires regular supervision from healthcare professionals to ensure that exercises are performed correctly. However, many patients face challenges such as limited access to specialists, travel constraints, scheduling difficulties, or a lack of continuous guidance during home-based rehabilitation. KineticCare aims to address these challenges by providing an interactive digital solution that delivers instant feedback and exercise monitoring through a standard device camera.<br/><br/>

          Using advanced pose-tracking technology, KineticCare detects body landmarks and analyzes user movements in real time. The system evaluates exercise posture, calculates joint angles, counts repetitions automatically, and provides visual feedback to help users understand whether they are performing an exercise correctly. This allows individuals to practice rehabilitation exercises more effectively while reducing the chances of improper movement patterns that may slow recovery.<br/><br/>

          At its core, KineticCare represents a step toward the future of digital healthcare—where intelligent technology assists recovery, improves patient engagement, and helps deliver quality rehabilitation support beyond the boundaries of physical clinics.


        </p>
      </div>

      <div className='h-px w-screen bg-black opacity-30 mt-30 mb-10 px-14'></div>

    </div>
  )
}

export default About
