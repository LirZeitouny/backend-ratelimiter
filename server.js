const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const blockList = {}; // Key: token, Value: { timeBlocked, counter }

app.post('/api/isPrime', (req, res) => {
  const { input, token } = req.body;
  const number = parseInt(input, 10);
  const isPrimeResString = isPrimeNumber(number) ? 'PRIME' : 'NOT PRIME';

  if (!number || !token) {
    return res.status(400).json({ error: 'Input and token are required.' });
  }

  const currentTime = new Date().getTime();
  const { timeBlocked, counter } = blockList[token] || {};

  if (timeBlocked) {
    if ((currentTime - timeBlocked) / 3600000 > 1) {
      // Finished waiting 1 hour
      delete blockList[token];
      res.status(200).json(isPrimeResString);
    } else {
      // Still blocked
      const minutesLeft = 60 - Math.floor((currentTime - timeBlocked) / 60000);
      res
        .status(200)
        .json(`You are BLOCKED! ${minutesLeft} minutes left to unblocking`);
    }
  } else if (counter) {
    if (counter > 0 && counter < 10) {
      // Updating requests counter
      blockList[token].counter++;
      res.status(200).json(isPrimeResString);
    } else if (counter === 10) {
      // Should be blocked
      blockList[token].timeBlocked = currentTime;
      res.status(200).json('You are BLOCKED for one hour');
    }
  } else {
    // First request
    blockList[token] = { timeBlocked: null, counter: 1 };
    res.status(200).json(isPrimeResString);
  }
});

function isPrimeNumber(number) {
  if (number <= 1) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      return false;
    }
  }

  return true;
}
