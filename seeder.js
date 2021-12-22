const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({ path: "./config/config.env" })

// load models
const Bootcamp = require('./model/bootcamp')
const Course = require('./model/Course')
const User = require('./model/User')
const Review = require('./model/Review')

// Connect to db
mongoose.connect(process.env.MONGO_URL)

// Read JSON files

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import  into DB
const importData = async () => {
    try
    {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(users)
        await Review.create(reviews)
        console.log('Data imported........'.green.inverse)
        process.exit(1)
    }
    catch (err)
    {
        console.log(err)
    }
}

const deleteData = async () => {
    try
    {
        await Bootcamp.deleteMany()
        await Course.deleteMany()   
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data Destroyed........'.red.inverse)
        process.exit(1)
    }
    catch (err)
    {
        console.log(err)
    }
}

if (process.argv[2] === '-i')
{
   importData()
}
else if (process.argv[2] === '-d')
{
   deleteData()
}

 