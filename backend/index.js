import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected')
  })
  .catch((err) => {
    console.log(err)
  })

// User Model
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
})

// Home Route
app.get('/', (req, res) => {
  res.send('Server Live and Running')
})

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({ username })

    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exists',
      })
    }

    const newUser = new User({
      username,
      email,
      password,
    })

    await newUser.save()

    res.json({
      success: true,
      message: 'Registration Successful',
    })
  } catch (error) {
    console.log(error)

    res.json({
      success: false,
      message: 'Server Error',
    })
  }
})

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (!user) {
      return res.json({
        success: false,
        message: 'User not found',
      })
    }

    if (user.password !== password) {
      return res.json({
        success: false,
        message: 'Wrong password',
      })
    }

    res.json({
      success: true,
      message: 'Login Successful',
      user: {
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.log(error)

    res.json({
      success: false,
      message: 'Server Error',
    })
  }
})

// Start Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})