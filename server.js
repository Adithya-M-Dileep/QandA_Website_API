const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost/qna_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Question Schema
const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  userId: String,
  datePosted: { type: Date, default: Date.now },
});

// Answer Schema
const answerSchema = new mongoose.Schema({
  userId: String,
  questionId: String,
  answerBody: String,
  datePosted: { type: Date, default: Date.now },
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);
const User = mongoose.model("User", UserSchema);
// Middleware
app.use(express.json());

// JWT Secret Key
const secretKey = 'fe4f9169e55a9f8e987c755da04a4fdd30e910c021d1eacb8d781d6a199a91f6';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      const user = new User({ username, password: hash });
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Registration successful' });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Failed to register' });
    });
});


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'No user found' });
      }
      bcrypt.compare(password, user.password)
        .then((result) => {
          if (!result) {
            return res.status(401).json({ message: 'Invalid password' });
          }
          const token = jwt.sign({ userId: user._id }, secretKey);
          res.status(200).json({ token });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: 'Error comparing passwords' });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Error finding user' });
    });
});



// Create a new question
app.post('/api/questions', authenticateToken, (req, res) => {
  const { title, description, tags ,userId} = req.body;

  const question = new Question({ title, description, tags ,userId});

  question.save()
    .then((savedQuestion) => {
      res.json(savedQuestion);

    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);

    });
});

// Get all questions
app.get('/api/questions', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page)||1;
  const limit = parseInt(req.query.limit)||5;
  const skip = (page - 1) * limit;
  Question.find({})
    .skip(skip)
    .limit(limit)
    .then((questions) => {
      res.json(questions);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Get a question by ID
app.get('/api/questions/:id', authenticateToken, (req, res) => {
  const questionId = req.params.id;

  Question.findById(questionId)
    .then((question) => {
      res.json(question);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Update a question by ID
app.put('/api/questions/:questionId', authenticateToken, (req, res) => {
  const { questionId } = req.params;
  const { title, description, tags ,userId} = req.body;

  Question.findById(questionId)
    .then((question) => {
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (question.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update the question' });
      }

      question.title = title;
      question.description = description;
      question.tags = tags;

      return question.save()
      .then((updatedQuestion) => {
        res.json(updatedQuestion);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
    });
});


// Delete a question by ID
app.delete('/api/questions/:questionId', authenticateToken, (req, res) => {
  const { questionId } = req.params;
  const {userId}=req.body;
  Question.findById(questionId)
    .then((question) => {
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      console.log(question.userId,userId)
      if (question.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete the question' });
      }

      return Question.findByIdAndDelete(questionId)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    });
});


// Add an answer to a question
app.post('/api/questions/:id/answers', authenticateToken, (req, res) => {
  const questionId = req.params.id;
  const { userId, answerBody } = req.body;

  const answer = new Answer({ userId, questionId, answerBody });
  answer.save()
    .then((savedAnswer) => {
      res.json(savedAnswer);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);

    });
});

// Get answers for a question
app.get('/api/questions/:id/answers', authenticateToken, (req, res) => {
  const questionId = req.params.id;
  const page = parseInt(req.query.page)||1;
  const limit = parseInt(req.query.limit)||5;
  const skip = (page - 1) * limit;

  Answer.find({ questionId })
    .then((answer) => {
      res.json(answer);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Get an answer by ID
app.get('/api/answers/:id', authenticateToken, (req, res) => {
  const answerId = req.params.id;

  Answer.findById(answerId)
    .then((answer) => {
      res.json(answer);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);

    });
});

// Update an answer by ID
app.put('/api/answers/:answerId', authenticateToken, (req, res) => {
  const { answerId } = req.params;
  const { answerBody ,userId} = req.body;

  Answer.findById(answerId)
    .then((answer) => {
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      if (answer.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update the answer' });
      }

      answer.answerBody = answerBody;

      return answer.save()
      .then((updatedAnswer) => {
        res.json(updatedAnswer);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    });
});


// Delete an answer by ID
app.delete('/api/answers/:answerId', authenticateToken, (req, res) => {
  const { answerId } = req.params;
  const {userId}=req.body;

  Answer.findById(answerId)
    .then((answer) => {
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      if (answer.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete the answer' });
      }

      return Answer.findByIdAndDelete(answerId)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
