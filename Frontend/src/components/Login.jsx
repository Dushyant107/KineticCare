import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const BASE_URL = "https://kineticcare.onrender.com";

  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      const endpoint = isLogin
        ? `${BASE_URL}/login`
        : `${BASE_URL}/register`

      const res = await axios.post(
        endpoint,
        formData
      )

      alert(res.data.message)

      // Save logged in user
      if (res.data.success) {

        // LOGIN SUCCESS
        if (isLogin) {

          localStorage.setItem(
            "user",
            JSON.stringify(res.data.user)
          )

          navigate('/')

        }

        // REGISTER SUCCESS
        else {

          alert("Registration Successful")

          setIsLogin(true)

          setFormData({
            username: '',
            email: '',
            password: ''
          })

        }

      }

    } catch (error) {

      console.log(error)

      alert(error.response?.data?.message || error.message)

    }

  }

  return (
    <div className="min-h-screen w-screen bg-[#f5f5f5] flex flex-col items-center justify-center relative overflow-hidden">


      <div className="absolute top-8 right-10 flex shadow-lg rounded overflow-hidden">

        <button
          onClick={() => setIsLogin(true)} className={`px-6 py-2 text-sm transition-all duration-200 ${isLogin ? 'bg-linear-to-r from-[#63b3ff] to-[#0047d9] text-white' : 'bg-white text-black'}`}>
          Login
        </button>

        <button onClick={() => setIsLogin(false)} className={`px-6 py-2 text-sm transition-all duration-200 ${!isLogin ? 'bg-linear-to-r from-[#63b3ff] to-[#0047d9] text-white' : 'bg-white text-black'}`}>
          Register
        </button>


      </div>

      <img src="logo.svg" alt="" className='h-16 mb-4' />

      <div className="w-[420px] bg-white border border-gray-200 shadow-sm px-10 py-14">

        <h2 className="text-3xl font-bold text-center mb-10">
          {isLogin ? (
            <>
              Sign <span className="text-[#0047D9]">In</span>
            </>
          ) : (
            <>
              Create <span className="text-[#0047D9]">Account</span>
            </>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">



          {!isLogin && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 px-4 py-3 outline-none"
              required
            />
          )}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="bg-gray-100 px-4 py-3 outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-100 px-4 py-3 outline-none"
            required
          />

          <button
            type="submit"
            className="mt-3 py-3 text-white bg-linear-to-r from-[#63b3ff] to-[#0047d9] hover:opacity-95 transition-all duration-200"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login