/*
CSC3916 HW3
File: Server.js
Description: Web API scaffolding for Movie API
 */

require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

// Sign-up
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, msg: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

// Return errors for other methods
router.get('/signup', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.put('/signup', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.delete('/signup', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.patch('/signup', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

// Sign-in
router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

// Return errors for other methods
router.get('/signin', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.put('/signin', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.delete('/signin', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

router.patch('/signin', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});

// Movies
router.route('/movies')
    .get(function(req, res) {
        Movie.find(function(err, movie) {
            if (err) {
                res.json({msg: 'Movies not found.'})
            }
            res.json(movie);
        });
    })

    .post(function(req, res) {
        if (!req.body.title || !req.body.year || !req.body.actors) {
            res.json({success: false, msg: 'Please include a title, year, and at least (1) actor/character name.'})
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors

            movie.compareTitle(req.body.title, function(isMatch) {
                if (isMatch) {
                    res.json({success: false, msg: 'Movie already exists.'})
                }
                else {
                    movie.save(function(err) {
                        if (err) {
                            res.json(err);
                        }
                        res.json({success: true, msg: 'Successfully created a new movie.'})
                    });
                }
            })
        }
    })

    .put(function(req, res) {
        if (!req.body.title) {
            res.json({success: false, msg: 'Please update the movie by entering the title.'})
        } else {
            Movie.updateOne({title: req.body.title}, function (err, movie) {
                if (err) {
                    res.json({success: false, msg: 'Movie was not found.'})
                } else {
                    res.json({success: true, msg: 'Successfully updated the movie.'});
                }
            });
        }
    })

    .delete(function(req, res) {
        if (!req.body.title) {
            res.json({success: false, msg: 'Please delete the movie by entering the title.'})
        } else {
            Movie.deleteOne({title: req.body.title}, function (err, movie) {
                if (err) {
                    res.json({success: false, msg: 'Movie was not found.'});
                } else {
                    res.json({success: true, msg: 'Successfully deleted the movie.'});
                }
            });
        }
    });

router.patch('/movies', function (req, res) {
    res.status(401).send({success: false, msg: 'Does not support the HTTP method.'});
});


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only