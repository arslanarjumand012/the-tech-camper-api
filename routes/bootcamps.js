const express = require('express')
const Bootcamp = require('../model/bootcamp')
const courseRouter = require('./courses')
const AdvResults = require('../middleware/advResults')
const reviewRouter = require('./reviews');
//de-structure functions from controller/bootcamps.js

const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp,getBootcampsInRadius , bootcampPhotoUpload } = require('../controllers/bootcamps') 
const { protect ,authorize } = require('../middleware/auth')

const router = express.Router()

router.use('/:bootcampId/course', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/').get(AdvResults(Bootcamp, 'Courses'),getBootcamps)
.post(protect , authorize("publisher","admin"),createBootcamp)

router.route('/:id')
.get(getBootcamp)
.put(protect , authorize("publisher","admin"),updateBootcamp)
.delete(protect , authorize("publisher","admin"),deleteBootcamp)
router.route('/:id/photo').put(authorize('publisher', 'admin') ,  bootcampPhotoUpload)
module.exports = router

