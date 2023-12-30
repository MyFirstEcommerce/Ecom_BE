require('dotenv').config()
require('express-async-errors')
// express

const express = require('express')
const app = express()
// rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// database
const connectDB = require('./src/db/connect')

//router
const authRouter = require('./src/routes/authRoutes')

//middleware
const notFoundMiddleware = require('./src/middleware/not-found')
const errorHandlerMiddleware = require('./src/middleware/error-handler')

app.set('trust proxy', 1)
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }))

// extra packages
app.use(helmet())
app.use(cors())
app.use(xss())

app.use(mongoSanitize())

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'))
app.use(fileUpload())

app.get('/', (req, res) => {
  res.send('e-commerce api')
})

app.use('/api/v1/auth', authRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
