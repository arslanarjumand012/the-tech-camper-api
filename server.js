const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
const fileupload = require('express-fileupload')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
var xss = require('xss-clean')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')

//import colors package

const colors = require('colors')

//import mongoDB file

const connectDB = require('./config/db')

//import Routes file

const bootcamps = require('./routes/bootcamps')

const auth = require('./routes/auth')

const courses = require('./routes/courses')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

//import morgan package

const morgan = require('morgan')

//load env config file

dotenv.config({path: './config/config.env'})

// Connect MongoDB

connectDB()

const app = express()

//Connect Postman with our backend (body-parser)

app.use(express.json())

app.use(cookieParser())

app.use(mongoSanitize());

//  set security header
app.use(helmet());

// prevent xss attacks
app.use(xss())

// Prevent http param pollution
app.use(hpp());

app.use(cors()) 

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});

app.use(limiter);

//Dev logging middleware

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
 
app.use(fileupload())
// use routes

app.use('/api/v1/bootcamps', bootcamps)

app.use('/api/v1/auth', auth)

app.use('/api/v1/courses', courses)

app.use('/api/v1/users', users)

app.use('/api/v1/reviews', reviews)

//use error.js file

app.use(errorHandler)

//define port

const PORT = process.env.PORT || 6000

const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
})

//handle unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold)

    //close server & exit process

    server.close(() => process.exit(1))
})