//import bootcamp schema

const Bootcamp = require("../model/bootcamp");
const asyncHandler = require("express-async-handler");
const path = require("path");

// const asyncHandler  = require('../middleware/async')
//import error response file

const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");

// / @desc    Get all bootcamps
// @Routes  Get /api/v1/bootcamps
// @acess   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.AdvResults);
});

// @desc    Get single bootcamp
// @Routes  Get /api/v1/bootcamps/:id
// @access  Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  res.status(200).json({ sucess: true, data: bootcamp });

  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 400));
  }
});

// @desc    Create new bootcamp
// @Routes  Post /api/v1/bootcamps
// @access  Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // check for published  bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the  user is not an admin , they  can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The  user  with  ID ${req.user.id}  has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Update single bootcamp
// @Routes  Put /api/v1/bootcamps/:id
// @access  Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ sucess: false });
  }

  // Make sure user is bootcamp owner

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete single bootcamp
// @Routes  Delete /api/v1/bootcamps/:id
// @access  Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ sucess: false });
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    upload photo of bootcamp
// @Routes  put /api/v1/bootcamps/:id/photo
// @access  Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp is not find with the id of ${req.params.id}`,
        404
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 404));
  }

  const file = req.files.file;
  console.log(file);

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 404));
  }

  if (!file.size > process.env.IMAGE_MAX_SIZE) {
    return next(new ErrorResponse(`Please upload a file less than 1MB`, 404));
  }

  file.name = `photo ${bootcamp._id}${path.parse(file.name).ext}`;

  console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse("Problem with file upload", 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  });

  return res.status(200).json({ sucess: true, data: file.name });
});

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  console.log(zipcode, distance);

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
