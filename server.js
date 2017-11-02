let express = require('express');
let bP = require('body-parser');
let nodemailer = require('nodemailer');
const keys = require('./config/keys');
let app = express();
const PORT = process.env.PORT || 8081;

app.use(bP.urlencoded({extended: true}));
app.use(bP.json());

app.post('/send/email', (req, res) => {
  var jsonString = '';
  req.on('data', function (data) {
    jsonString += data;
});

req.on('end', function () {
    console.log(jsonString);
    for(var item in jsonString){
      console.log(item);
    }
})
});

app.get('/', (req, res) => {
  sendEmail(res);
  // res.render('index');
});

app.listen(PORT, () => {
  console.log("Mailer server started on port " + PORT);
});

function sendEmail(mailData, res) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: keys.googleEmail, // Your email id
        pass: keys.googlePassword // Your password
    }
  });

  var mailOptions = {
    from: mailData.sender, // sender address
    to: 'thedevcat9@mail.com', // list of receivers
    subject: mailData.subject, // Subject line
    text: mailData.text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});

}

