import React from 'react'

const Instructions = () => {
  return (
    <div className='pt-20'>
      <div>
        <span className='font-raleway font-bold text-2xl'>Instructions to</span>
        <span className='font-raleway font-bold text-2xl text-primary'> Use</span>
      </div>
      <div className='w-[85vw] mt-4 text-justify'>
        Physical rehabilitation often requires regular supervision to ensure exercises are performed correctly. However, many patients face challenges such as limited access to physiotherapists, travel constraints, or lack of continuous guidance during home-based recovery.<br/><br/>

        KineticCare addresses these challenges through AI-driven motion analysis. The platform uses advanced pose detection technology to monitor body movements, calculate joint angles, count exercise repetitions, and provide immediate posture feedback.<br/><br/>

        The current prototype includes multiple rehabilitation-focused exercises such as arm mobility training, knee extensions, squats, and shoulder rehabilitation movements. This system demonstrates how artificial intelligence can support physiotherapy and lay the foundation for future healthcare innovations.<br/><br/>

        <h2 className="font-raleway text-lg font-bold mb-6">
    How It Works
  </h2>

  <ol className="space-y-8 list-decimal list-inside">
    
    <li>
      <h3 className="inline font-semibold ">
        Select Program
      </h3>
      <p className="mt-2 ml-7 text-gray-600 leading-relaxed">
        Choose your prescribed physical therapy routine from our growing
        collection of rehabilitation programs. Each exercise is designed to
        target specific mobility, strength, and recovery goals while providing
        guided support throughout the session.
      </p>
    </li>

    <li>
      <h3 className="inline font-semibold ">
        Calibrate Camera
      </h3>
      <p className="mt-2 ml-7 text-gray-600 leading-relaxed">
        Position your device so that your body is clearly visible within the
        tracking frame. KineticCare's AI-powered pose detection system will
        identify key body landmarks and prepare the exercise environment for
        accurate movement analysis.
      </p>
    </li>

    <li>
      <h3 className="inline font-semibold ">
        Move Safely
      </h3>
      <p className="mt-2 ml-7 text-gray-600 leading-relaxed">
        Begin your exercise while receiving real-time visual feedback and
        automatic repetition tracking. Green indicators represent correct form,
        while red indicators help identify posture adjustments. Joint-angle
        measurements and performance data are continuously monitored to ensure
        safer and more effective rehabilitation.
      </p>
    </li>

  </ol>
      </div>

      <div className='h-px w-screen bg-black opacity-30 my-30 px-14'></div>

    </div>
  )
}

export default Instructions
