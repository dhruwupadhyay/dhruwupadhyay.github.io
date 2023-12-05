const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, images, etc.)
app.use(express.static('public'));

// Set up nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dhruwupadhyay2@gmail.com',
    pass: 'DhruwS21FE',
  },
});

// Define a route for handling form submissions
app.post('/submit-form', (req, res) => {
  const { name, email, phone, message } = req.body;

  // Create the email content
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'dhruwupadhyay2@gmail.com', // Change this to your recipient email
    subject: 'New Contact Form Submission',
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Message sent: ' + info.response);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
