require('dotenv').config();

const config = require('./config.json');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const upload = require('./multer');
const fs = require('fs');
const path = require('path');

const { authenticateToken } = require('./utilities');
const User = require('./models/user.model');
const TravelStory = require('./models/travelStory.model');
const { error } = require('console');
mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// create account
app.post('/create-account', async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: 'All fields are require' });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: 'user already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullname,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '72h' }
  );

  return res.status(201).json({
    error: false,
    user: { fullname: user.fullname, email: user.email },
    accessToken,
    message: 'Registration Successful',
  });
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: 'Unable to login, please check your email or password',
    });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '72h' }
  );

  return res.json({
    error: false,
    user: { fullname: user.fullname, email: user.email },
    accessToken,
    message: 'Login Successful',
  });
}),
  // get user
  app.get('/get-user', authenticateToken, async (req, res) => {
    const { userId } = req.user;
    const isUser = await User.findOne({ _id: userId });
    if (!isUser) {
      return res.sendStatus(401);
    }
    return res.json({
      user: isUser,
      message: '',
    });
  });

// add travel story
app.post('/add-travel-story', authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;
  // validate required field
  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: 'All fields are required' });
  }

  // convert visited date from ms to date object
  const parsedVisitedDate = new Date(parseInt(visitedDate));
  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    });
    await travelStory.save();
    res.status(201).json({ story: travelStory, message: 'Added Successfully' });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

//get all travel stories
app.get('/get-all-travel-stories', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavorite: -1,
    });
    res.status(200).json({ stories: travelStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// handle image upload
app.post('/image-upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: 'no image uploaded' });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// delete image
app.delete('/delete-image', async (req, res) => {
  const { imageUrl } = req.query;
  if (!imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: 'imageUrl parameter is required' });
  }

  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'image deleted successfully' });
    } else {
      res.status(200).json({ error: true, message: 'image not found' });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// serve image from directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

//edit travel story
app.put('/edit-travel-story/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // validate required field
  if (!title || !story || !visitedLocation || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: 'All fields are required' });
  }
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    // find travel story by id
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: 'travel story not found' });
    }

    const placeholderImgUrl = `http://localhost:8000/assets/placeholder.png`;

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;
    travelStory.visitedDate = parsedVisitedDate;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: 'update successful' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// delete story
app.delete('/delete-travel-story/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: 'travel story not found' });
    }

    // delete travelstory from db
    await travelStory.deleteOne({ _id: id, userId: userId });

    // extract filename from imageUrl
    const imageUrl = travelStory.imageUrl;
    const filename = path.basename(imageUrl);

    // define filepath
    const filePath = path.join(__dirname, 'uploads', filename);

    // delete image from uploads folder
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('failed to delete image', err);
      }
    });
    res
      .status(200)
      .json({ error: true, message: 'Travel story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// update isFavorite
app.put('/update-is-favorite/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavorite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: 'travel story not found' });
    }

    travelStory.isFavorite = isFavorite;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: 'update successful' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// search travel story
app.get('/search-story', authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(404).json({ error: true, message: 'query is required' });
  }

  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { story: { $regex: query, $options: 'i' } },
        { visitedLocation: { $regex: query, $options: 'i' } },
      ],
    }).sort({ isFavorite: -1 });
    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// filter story by date range
app.get('/travel-stories/filter', authenticateToken, async (req, res) => {
  const {startDate,endDate} = req.query
  const {userId} = req.user

  try{
    const start = new Date(parseInt(startDate))
    const end = new Date(parseInt(endDate))

    // find travel story by date
    const filteredStories = await TravelStory.find({
      userId:userId,visitedDate:{$gte:start,$lte:end}
    }).sort({isFavorite: -1})
    res.status(200).json({stories:filteredStories})
  }catch(error){
    res.status(500).json({error:true,message:error.message})
  }
})


app.listen(8000);
module.exports = app;
