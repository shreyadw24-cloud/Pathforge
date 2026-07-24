const mongoose = require('mongoose');

const suggestionItemSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  reasoning: {
    type: String,
    required: true
  },
  suggestedSkillsToLearn: [{
    type: String
  }]
}, {
  _id: false
});

const careerSuggestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  suggestions: [suggestionItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareerSuggestion', careerSuggestionSchema);