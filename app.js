require('dotenv').config(); // should be required at the beginning, no need to keep it in a const
const express = require('express');
const bodyParser = require('body-parser')
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/userDB');

const Schema = mongoose.Schema; // this is required for encryption, not just js defn of schema like before
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
//secret key
const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] }); // use our secret key for encryption (encrypt only password) before creating the collection
const User = new mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/register', (req, res) => {
    // console.log(req.body);
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => { //encryption occurs here while saving
        if (!err) {
            console.log("saved ");
            res.render('secrets');
        }
        else {
            console.log(err);
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const pw = req.body.password;
    User.findOne({ email: username }, (err, foundUser) => { // decryption ocuurs
        if (foundUser) {
            if (foundUser.password === pw) { // check if password matched
                res.render('secrets');
            }
            else {
                console.log(foundUser);
            }
        }
        else {
            console.log(err);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
})