var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var admin = require('firebase-admin');
var index = require('./routes/index');
var users = require('./routes/users');
var UserModule = require('./Module/User');
var CandiatModule = require('./Module/Candidat');
var RecuteurModule = require('./Module/Recruter');
var OfferModule = require('./Module/offre');
var NotifModule = require('./Module/Notification')
var mongoose = require('mongoose');
var serviceAccount = require('./pjobsdb-firebase-adminsdk.json');
var app = express();
app.use(bodyParser.json());
//mongo connection
mongoose.connect('mongodb://ahmed:ahmed@ds155132.mlab.com:55132/pjobs');
var db = mongoose.connection;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pjobsDb.firebaseio.com'
});

//messanging function

var messanging = function (token, payload, option) {

    admin.messaging().sendToDevice(token, payload, option).then(function (result) {
        res.send("result" + result)
        console.log("result" + result)
    })
        .catch(function (error) {
            res.send("error" + error)
            console.log("error" + error)
        })


}

//verify email

var verifEmail = function (uid) {
    admin.auth().getUser(uid)
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully fetched user data:", userRecord.toJSON());
            var user = userRecord.toJSON()
            console.log("Successfully fetched user email:", user.email);
            return user.email
        })
        .catch(function (error) {
            console.log("Error fetching user data:", error);
            return null
        });

}


//security function

var Authorized = function (token) {
    admin.auth().verifyIdToken(token)
        .then(function (decodedToken) {
            var email = verifEmail(decodedToken.uid)
            console.log("email is ", email)
            return email
        })
        .catch(function (error) {
            console.log("email is ", error)

        })
}


//setting up api
app.get('/API/', function (req, res) {

    var idToken = req.header("Authorization")
    var identity = req.header("email")
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
            var uid = decodedToken.uid;
            console.log("uid" + uid)
            var email = decodedToken.email
            if (identity != email) {

                res.send("Not Authorized")
            } else
                res.send(email)
        })
        // ...
        .catch(function (error) {
            res.send("my error" + error)
        })
})


/*
 app.get('/API/Token', function (req, res) {
 var token = req.header("Token")
 var topic = 'highScores';
 var message = {
 data: {
 score: '850',
 time: '2:45'
 },
 topic: topic
 };

 admin.messaging().send(message)
 .then(function(response) {
 // Response is a message ID string.
 console.log('Successfully sent message:', response);
 })
 .catch(function(error){
 console.log('Error sending message:', error);
 });
 })
 */


app.post('/API/SendNotif', function (req, res) {
    var token = req.header("Token")
    var notif = req.body
    /*
     var payload = {
     "notification": {
     "title": "Matched",
     "body": "Some one liked your Profile"
     }
     };
     var option = {
     "priority": "high",
     "timeToLive": 60 * 60 * 24
     };*/
    admin.messaging().sendToDevice(notif.deviceID, notif.payload, notif.Option).then(function (result) {
        res.send("notification send")
        console.log("notification send")
    })
        .catch(function (error) {
            res.send("error" + error)
            console.log("error" + error)
        })

});


//add notif
app.post('/API/ADD/Notif', function (req, res) {
    var test = req.body;
    console.log("test: %j", test);
    NotifModule.addnotif(test, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });
});

//update notif
app.put('/API/UpdateNotif/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("test: %j", test);
    NotifModule.updateNotif(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});

//get notif by mail
app.get('/API/Get/Notif/:userId', function (req, res) {
    var userId = req.params.userId
    NotifModule.getnotifByuserid(userId, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });
});
//find all requests
app.get('/API/Get/CandidateRequests/:_id', function (req, res) {
    var id = req.params._id
    console.log(id)
    CandiatModule.getCandidatRequests(id, function (err, cand) {
        if (err) {
            throw  err;
        }
        res.json(cand.Requests)

    })

})

//add Request to Candidat
app.post('/API/AddCandRequests', function (req, res) {
    var RequestRect = req.body;
    CandiatModule.AddCandidatRequest(RequestRect, function (err, cand) {
        if (err) throw err
        res.json(cand)
    })


})
//delete request from candidate
app.put('/API/Delete/Request/:_id', function (req, res) {
    CandiatModule.dropCandidatRequest(req.params._id, req.body, {}, function (err, cand) {
        if (err) throw err
        res.json(cand)
    })
})


//find all user
app.get('/API/Get/AllUsers', function (req, res) {
    //  console.log("no error"+"")
    var idToken = req.header("Authorization")
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
            var uid = decodedToken.uid;
            console.log("uid" + uid)

            UserModule.getusers(function (err, Myuser) {
                if (err) {
                    //console.log(err+"")
                    throw err;
                }
                //      console.log("no error"+"")

            });
            res.json(Myuser);

            // ...
        }).catch(function (error) {
        res.json("401 Unauthorised user")
    });

});
//find user by id
app.get('/API/Get/User/:_id', function (req, res) {
    //  console.log("no error"+"")
    var id = req.params._id;
    var idToken = req.header("Authorization")
    admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {

            UserModule.getusersById(id, function (err, Myuser) {
                if (err) {
//console.log(err+"")
                    throw err;
                }
                //      console.log("no error"+"")
                res.json(Myuser);
            });
        }).catch(function (error) {
        res.json("401 Unauthorised user")
    });

});
//add user
app.post('/API/ADD/USER', function (req, res) {
    var test = req.body;
    console.log("test: %j", test);
    UserModule.addUser(test, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//update user
app.put('/API/Update/USER/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("test: %j", test);
    UserModule.updateUser(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});

//delete user
app.delete('/API/Delete/USER/:_id', function (req, res) {
    var id = req.params._id
    UserModule.DeleteUser(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//get user by username
app.get('/API/Get/login/:name', function (req, res) {
    var username = req.params.name
    console.log("username", username);
    UserModule.getUserByusername(username, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});

//get user by email
app.get('/API/Get/loginEmail/:eemail', function (req, res) {
    var emmail = req.params.eemail
    UserModule.getUserByEmail(emmail, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//find all candidat
app.get('/API/Get/AllCandidats', function (req, res) {
    //  console.log("no error"+"")
    CandiatModule.getCandidats(function (err, MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});
//get candidate by email

app.get('/API/Get/CandbyEmail/:eemail', function (req, res) {
    var emmail = req.params.eemail
    CandiatModule.getCandByemail(emmail, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });
});


//add Candidat
app.post('/API/ADD/Candidat', function (req, res) {
    var test = req.body;
    console.log("test: %j", test);
    CandiatModule.AddCandidat(test, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//update Candidat
app.put('/API/Update/Candidat/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("body: %j", test);
    CandiatModule.updateCandidat(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //console.log("this is result"+result)
        res.json(result);
    });

});
//update Candidat
app.put('/API/Update/CandidatDeviceId/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("body: %j", test);
    CandiatModule.updateCandidatDeviceId(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result"+result)
        res.json(result);
    });

});

//delete Candidat
app.delete('/API/Delete/Candidat/:_id', function (req, res) {
    var id = req.params._id
    CandiatModule.DeleteCandidat(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//add offer to candidat
app.put('/API/AddOfferToCandiat/:_id', function (req, res) {
    var id = req.params._id
    var offree = req.body;
    console.log("test: %j", offree);
    CandiatModule.addOfferToCandidat(id, offree, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//change candidat offer statu
app.put('/API/ChangeCandOfferStatus/:_id', function (req, res) {
    var id = req.params._id
    var offree = req.body;
    console.log("test: %j", offree);
    CandiatModule.changeStatus(id, offree, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //    console.log("this is result"+result)
        res.json(result);
    });

});
//Get Candidat offers
app.get('/API/Get/CandidatOffers/:_id', function (req, res) {
    var id = req.params._id;
    var a = [];
    CandiatModule.getCandidatOffers(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        var _next = function (currentIndex) {
            if (currentIndex >= result.Myoffers.length) {
                res.json(a);
                return;
            }
            OfferModule.findOfferById(result.Myoffers[currentIndex]._id, function (err, offree) {
                a.push(offree);
                _next(currentIndex + 1)
            });
        };
        // First call
        _next(0);
    });
});

//search
/*
 app.get('/API/search/:search', function (req, res) {
 //  console.log("no error"+"")
 var  str=req.params.search
 var arr=[]
 CandiatModule.getCandidats(function (err, MyCandidats) {
 if (err) {
 //console.log(err+"")
 throw err;
 }



 //      console.log("no error"+"")
 var _next = function (currentIndex) {

 console.log("dddcdcdc"+ MyCandidats[currentIndex].skills["nom_skill"])

 if (currentIndex >= MyCandidats.length) {
 res.json(arr);
 console.log("size:",MyCandidats.length)
 return;
 }/*
 if((MyCandidats[currentIndex].nom.includes(str))||(experience[0].nom_entreprise.includes(str))||(experience[1].nom_entreprise.includes(str))||(skillls[0].nom_skill.includes(str))||(skillls.includes(str) )){
 console.log("size:",MyCandidats.length)
 arr.push(MyCandidats[currentIndex])

 }
 _next(currentIndex + 1)
 }


 if(MyCandidats[currentIndex].nom!=null){
 if((MyCandidats[currentIndex].nom.includes(str)))
 {
 arr.push(MyCandidats[currentIndex])
 }
 }else if(MyCandidats[currentIndex].experience_professionel!=null){
 console.log("candidat exp not null")
 for(var i=0;i<MyCandidats[currentIndex].experience_professionel.length;i++)
 { console.log("exp size"+MyCandidats[currentIndex].experience_professionel.length)

 if(MyCandidats[currentIndex].experience_professionel[i]!=null){
 console.log("exp not null")
 if(MyCandidats[currentIndex].experience_professionel[i].nom_entreprise.includes(str))
 arr.push(MyCandidats[currentIndex])
 }
 }
 }else if(MyCandidats[currentIndex].skills!=null){
 console.log("condidat skills not null")
 for(var i=0;i<MyCandidats[currentIndex].skills.length;i++)
 { console.log("skills size"+MyCandidats[currentIndex].skills.length)
 if(MyCandidats[currentIndex].skills[i]!=null){
 console.log("skills not null")
 if(MyCandidats[currentIndex].skills[i].nom_skill.includes(str))
 arr.push(MyCandidats[currentIndex])
 }

 }
 }
 _next(currentIndex+1)
 }

 // First call
 _next(0)


 });
 });
 */

//supprimer candidat specific offer
app.put('/API/DropCandOffer/:_id', function (req, res) {
    var id = req.params._id
    var offree = req.body;
    console.log("test: %j", offree);
    CandiatModule.dropCandidatOffer(id, offree, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
//        console.log("this is result"+result)
        res.json(result);
    });

});


//find all Offers
app.get('/API/Get/AllOffers', function (req, res) {
    //  console.log("no error"+"")
    OfferModule.getOffers(function (err, MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});
//find offers by profile

app.post('/API/Get/offersByProfile', function (req, res) {
    var a = []
    var body = req.body
    OfferModule.getOffers(function (err, offers) {
        if (err) {
            throw err;
        }
        var _next = function (currentIndex) {
            if (currentIndex >= offers.length) {
                res.json(a);
                return;
            }

            var backk = offers[currentIndex].background
            var skillsname = offers[currentIndex].skills

            if (backk === body.backgroundSkill.toString()) {
                a.push(offers[currentIndex])
            } else {
                console.log("body" + body.skillnameCand[i])
                for (var i = 0; i < body.skillnameCand.length; i++)
                    if (skillsname[0].nom_skill === body.skillnameCand[i]) {
                        a.push(offers[currentIndex])
                    }

            }
            _next(currentIndex + 1)

        };
        // First call
        _next(0);
    });
});


//add Offer
app.post('/API/ADD/Offer', function (req, res) {
    var test = req.body;
    console.log("test: %j", test);
    OfferModule.AddOffer(test, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//update offers
app.put('/API/Update/offer/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("test: %j", test);
    OfferModule.updateOffer(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//delete Offer
app.delete('/API/Delete/Offer/:_id', function (req, res) {
    var id = req.params._id
    OfferModule.DeleteOffer(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//add candidat to Offer
app.put('/API/AddCandToOffre/:_id', function (req, res) {
    var id = req.params._id
    var cand = req.body;
    console.log("test: %j", cand);
    OfferModule.addCandidatToOffer(id, cand, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //console.log("this is result"+result)
        res.json(result);
    });

});
//change offer candidat  etat
app.put('/API/ChangeOfferCandetat/:_id', function (req, res) {
    var id = req.params._id
    var cand = req.body;
    console.log("test: %j", cand);
    OfferModule.changeCandStatus(id, cand, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //    console.log("this is result"+result)
        res.json(result);
    });

});
//find offer by id
app.get('/API/Get/offer/:_id', function (req, res) {
    var id = req.params._id
    OfferModule.findOfferById(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //console.log("this is result"+result)
        res.json(result);
    });

});
//find offer by rect id
app.get('/API/Get/offerByRectID/:_id', function (req, res) {
    var id = req.params._id
    OfferModule.getOffersByRectID(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //console.log("this is result"+result)
        res.json(result);
    });

});

//find offer candidats
app.get('/API/Get/offersCand/:_id', function (req, res) {
    var id = req.params._id;
    var a = [];
    OfferModule.findOfferById(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("result.candidats=", result.candidates);
        var _next = function (currentIndex) {
            if (currentIndex >= result.candidates.length) {
                res.json(a);
                return;
            }
            CandiatModule.getCandidatOffers(result.candidates[currentIndex]._id, function (err, cand) {
                a.push(cand);
                _next(currentIndex + 1)
            });
        };
        // First call
        _next(0);
    });
});
//find all Recruteur
app.get('/API/Get/AllRecruteur', function (req, res) {
    //  console.log("no error"+"")
    RecuteurModule.getRecruters(function (err, MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});

//get recurter by email

app.get('/API/Get/RectbyEmail/:eemail', function (req, res) {
    var emmail = req.params.eemail
    RecuteurModule.getRectByEmail(emmail, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });
});


//Get Recruter  candidats
app.get('/API/Get/RectCandidats/:_id', function (req, res) {
    var id = req.params._id;
    var a = [];
    var _next1 = function () {
    };
    RecuteurModule.getRecruterById(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("ereur", result.offers);
        var _next = function (currentIndex) {
            if (currentIndex >= result.offers.length) {
                res.json(a);
                return;
            }

            OfferModule.findOfferById(result.offers[currentIndex]._id, function (err, offer) {
                if (err) {
                    console.log("ereur", err);
                }
                console.log("result.candidats=", offer.candidates);
                _next1 = function (currentIndex1) {
                    if (currentIndex1 >= offer.candidates.length) {
                        _next(currentIndex + 1)
                        return;
                    }
                    CandiatModule.getCandidatOffers(offer.candidates[currentIndex1]._id, function (err, cand) {
                        a.push(cand);
                        _next1(currentIndex1 + 1)
                    });
                };

                // First call
                _next1(0);
            });
        };
        // First call
        _next(0);
    });
});
//Get Recruter  offers
app.get('/API/Get/RectOffers/:_id', function (req, res) {
    var id = req.params._id;
    var a = [];
    /* RecuteurModule.getrectId(id, function (err, result) {
     if (err) {
     console.log("ereur", err);
     }
     var _next = function (currentIndex) {
     if (currentIndex >= result.offers.length) {
     res.json(a);
     return;
     }
     OfferModule.findOfferById(result.offers[currentIndex]._id, function (err, offree) {
     a.push(offree);
     _next(currentIndex + 1)
     });
     };
     // First call
     _next(0);
     });*/

    OfferModule.getOffersByRectID(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        } else
            res.json(result)

    })
});
//add Recruter
app.post('/API/ADD/Recruter', function (req, res) {
    var test = req.body;
    console.log("test: %j", test);
    RecuteurModule.AddRecruteur(test, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//update recruter
app.put('/API/Update/Recruter/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("test: %j", test);
    RecuteurModule.updateRecruteur(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});

//update rect deviceid
app.put('/API/Update/RectDeviceId/:_id', function (req, res) {
    var id = req.params._id
    var test = req.body;
    console.log("body: %j", test);
    RecuteurModule.updateRectDeviceId(id, test, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        //console.log("this is result"+result)
        res.json(result);
    });

});
//add offer to recruter
app.put('/API/AddOfferToRecruter/:_id', function (req, res) {
    var id = req.params._id
    var offree = req.body;
    console.log("test: %j", offree);
    RecuteurModule.addOfferToRectruter(id, offree, {}, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});
//find Rect by id
app.get('/API/Get/Recruter/:_id', function (req, res) {
    //  console.log("no error"+"")
    var id = req.params._id;
    RecuteurModule.getRecruterById(id, function (err, Myuser) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(Myuser);
    });
});
//delete Rect
app.delete('/API/Delete/Recruter/:_id', function (req, res) {
    var id = req.params._id
    RecuteurModule.DeleteRecruteur(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("this is result" + result)
        res.json(result);
    });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');

    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
