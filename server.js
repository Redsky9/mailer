let express = require('express');
let bP = require('body-parser');
let nodemailer = require('nodemailer');
let sanitizer = require('express-sanitizer');
const keys = require('./config/keys');
let getIP = require('ipware')().get_ip;
let mongoose = require('mongoose');
let app = express();
const PORT = process.env.PORT || 8081; 

let Mail = mongoose.model('mails');

app.use(bP.urlencoded({extended: true}));
app.use(bP.json());
app.use(sanitizer());

app.post('/', (req, res) => {
  console.log(getIP(req));
  let now = Date.now();
  let then = new Date(req.session.cookie['_expires']).getTime();
  console.log(now);
  console.log(then);
  console.log(then - now);
  if((then - now) > 0){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendStatus(500).end();
    return;
  }
  let errors = checkEmail(req.body);
  req.body = sanitizeCode(req.body);
  console.log(req.body);
  if(Object.keys(errors).length == 0){
    console.log("Sending email");
    sendEmail(req.body, res);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendStatus(200).end();
  }else{
    console.log(errors);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendStatus(500).end();
  }
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
    from: mailData.contactEmail,
    to: 'thedevcat@mail.com', // list of receivers
    subject: mailData.contactSubject, // Subject line
    // text: mailData.contactMessage //, // plaintext body
    html: `<h3>Sender: ${mailData.contactName} - ${mailData.contactEmail}</h3><p>Subject: ${mailData.contactSubject}</p><p>Text: ${mailData.contactMessage}</p>` // You can choose to send an HTML body instead
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }
});

}

function checkEmail(data) {
  let error = {};
  if(data.contactName){
    if(data.contactName.length >= 30){
      error.contactName = "Length of Contact Name is to big."
    }
  }else{
    error.contactName = "Contact Name field does not exist."
  }
  if(data.contactEmail){
    if(data.contactEmail.indexOf('@') == -1 || data.contactEmail.indexOf('.') == -1){
      error.contactEmail = "Contact Email is not of email type."
    }
  }else{
    error.contactEmail = "Contact email field does not exist."
  }
  if(data.contactSubject){
    if(data.contactSubject.length >= 30){
      error.contactSubject = "Length of Contact Subject is to big."
    }
  }else{
    error.contactSubject = "Contact Subject field does not exist."
  }
  if(data.contactMessage){
    if(data.contactMessage.length >= 4000){
      error.contactMessage = "Length of Message is to big."
    }
  }else{
    error.contactMessage = "Message field does not exist."
  }
  return error;
}

function sanitizeCode(data) {
  for(let it in data.body){
    data.body[it] = data.sanitize(data.body[it]);
  };
  return data;
}

function findIp(ip) {
  Mail.findOne({ip: ip}).then(mail => {
    if(mail){
      done(null, mail);
    }else{
      new Mail({
        ip: mail.ip,
        lastLogin: new Date().now(),
        mailsSent: 0
      })
      .save((err) => {
        if(err) throw err;
      })
      .then(mail => {
        done(null, mail)
      });
    }
  });
}

