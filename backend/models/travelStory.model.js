const mongoose = require('mongoose')
const Schema = mongoose.Schema

const travelStorySchema = new Schema({
  title:{type: String, require: true},
  story:{type: String, require: true},
  visitedLocation:{type: [String],default: []},
  isFavorite: {type: Boolean, default: false},
  userId: {type: Schema.Types.ObjectId, ref:'user', require: true},
  createdOn: {type: Date,default: Date.now},
  imageUrl: {type: String,require: true},
  visitedDate: {type: Date,require:true}
})

module.exports= mongoose.model('TravelStory', travelStorySchema)