const express = require('express');
const {
   getReviews,
   getReview,
   addReview,
   updateReview,
   deleteReview
} = require('../controllers/reviews');

const Review = require('../model/Review');

const router = express.Router({ mergeParams: true });

const advResults = require('../middleware/advResults');

const { protect, authorize } = require('../middleware/auth');

router.route('/')
   .get(
    advResults(Review, {
           path: 'bootcamp',
           select: 'name description'
       }),
       getReviews
   )
   .post(addReview)

router.route('/:id')
   .get(getReview)
   .put(protect, authorize('user', 'admin'), updateReview)    
   .delete(protect, authorize('user', 'admin'), deleteReview)    

module.exports = router;


