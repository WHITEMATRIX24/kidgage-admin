const express = require('express');
const multer = require('multer');

const router = express.Router();
const Course = require('../models/Course');

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Add a new course
router.post('/addcourse', upload.array('academyImg', 10), async (req, res) => {
  try {
    const {
      providerId,
      name,
      duration,
      durationUnit,
      startDate,
      endDate,
      description,
      feeAmount,
      feeType,
      days,
      timeSlots,
      location,
      ageGroup,
      courseType,
      promoted,
      preferredGender
    } = req.body;

    // Ensure the timeSlots are parsed correctly
    const parsedTimeSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedAge = typeof ageGroup === 'string' ? JSON.parse(ageGroup) : ageGroup;

    // Handle the images
    const images = req.files ? req.files.map((file) => file.buffer.toString('base64')) : [];

    const newCourse = new Course({
      providerId,
      name,
      duration,
      durationUnit,
      startDate,
      endDate,
      description,
      feeAmount,
      feeType,
      days,
      timeSlots: parsedTimeSlots,
      location: parsedLocation,
      ageGroup: parsedAge,
      courseType,
      images,  // Base64 encoded images
      promoted,
      preferredGender
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Error adding course', error: error.message });
  }
});

router.get('/course/:id', async (req, res) => {
  try {
      const course = await Course.findById(req.params.id);
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json(course);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});

// router.get('/course/:id', async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }
//     res.status(200).json(course);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// });

// Route to search for a course by ID
router.get('/search', async (req, res) => {
  try {
      const { id } = req.query; // Get the ID from the query parameters

      // Validate ID
      if (!id) {
          return res.status(400).json({ message: 'ID is required' });
      }

      console.log('Received ID:', id); // Log the received ID

      // Use findById to search directly by ID
      const course = await Course.findById(id);
      
      // Check if the course exists
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }

      console.log('Fetched Course:', course); // Log the fetched course
      res.status(200).json(course); // Send the course back as a response
  } catch (error) {
      console.error('Error fetching course:', error); // Log the error for debugging
      res.status(500).json({ message: 'Server error', error });
  }
});


// Update a course
// router.put('/update/:id', async (req, res) => {
//   try {
//     const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!course) {
//       return res.status(404).json({ message: 'Course not found' });
//     }
//     res.json(course);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
router.put('/update/:id', async (req, res) => {
  try {
    // Find the course by ID
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Merge existing course with the fields to be updated
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        course[key] = req.body[key]; // Update only fields that are provided and not null/undefined
      }
    });

    // Save the updated course
    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const convertToBase64 = (image) => {
  if (typeof image === 'string') {
      return image; // If already a base64 string, return it as is
  }
  
  // If the image is a file (Blob or File), convert it
  if (image instanceof Blob) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(image);
      });
  }

  throw new Error('Invalid image type');
};
router.put('/courses/images/:id', async (req, res) => {
  let { images } = req.body; // Get the images from the request body

  try {
      // Convert all images to base64 if they are not already
      images = await Promise.all(images.map(image => convertToBase64(image)));

      const updatedCourse = await Course.findByIdAndUpdate(
          req.params.id,
          { images }, // Update the images field
          { new: true, runValidators: true }
      );

      if (!updatedCourse) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json(updatedCourse);
  } catch (error) {
      console.error('Error updating course:', error); // Log error details
      res.status(500).json({ message: 'Error updating course', error: error.message });
  }
});

// Delete a course
router.delete('/delete/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Route to get courses by provider IDs
router.get('/by-providers', async (req, res) => {
  const { providerIds } = req.query;

  try {
    const courses = await Course.find({ providerId: { $in: providerIds } });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
