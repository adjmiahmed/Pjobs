var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var UserModule=require('./Module/User');
var CandiatModule=require('./Module/Candidat');
var RecuteurModule=require('./Module/Recruter');
var OfferModule=require('./Module/offre');
var mongoose=require('mongoose');
var app = express();
app.use(bodyParser.json());
//mongo connection
mongoose.connect('mongodb://ahmed:ahmed@ds155132.mlab.com:55132/pjobs');
var db=mongoose.connection;

//setting up api
app.get('/API/',function (req,res) {
    console.log("no error"+"")
    res.send('API is hear');

});
//find all user
app.get('/API/Get/AllUsers',function (req,res) {
    //  console.log("no error"+"")
    UserModule.getusers(function (err ,Myuser) {
        if (err) {
        //console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(Myuser);
    });
});
//find user by id
app.get('/API/Get/User/:_id',function (req,res) {
    //  console.log("no error"+"")
    var id=req.params._id;
    UserModule.getusersById(id,function (err ,Myuser) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(Myuser);
    });
});
//add user
app.post('/API/ADD/USER',function(req,res){
    var test=req.body;
    console.log("test: %j", test);
    UserModule.addUser(test,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//update user
app.put('/API/Update/USER/:_id',function(req,res){
    var id=req.params._id
    var test=req.body;
    console.log("test: %j", test);
    UserModule.updateUser(id,test,{},function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});

//delete user
app.delete('/API/Delete/USER/:_id',function(req,res){
    var id=req.params._id
    UserModule.DeleteUser(id,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//get user by username
app.get('/API/Get/login/:name',function(req,res){
    var username=req.params.name
    console.log("username", username);
    UserModule.getUserByusername(username,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});

//get user by email
app.get('/API/Get/loginEmail/:eemail',function(req,res){
    var emmail=req.params.eemail
    UserModule.getUserByEmail(emmail,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//find all candidat
app.get('/API/Get/AllCandidats',function (req,res) {
    //  console.log("no error"+"")
    CandiatModule.getCandidats(function (err ,MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});
//add Candidat
app.post('/API/ADD/Candidat',function(req,res){
    var test=req.body;
    console.log("test: %j", test);
    CandiatModule.AddCandidat(test,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//update Candidat
app.put('/API/Update/Candidat/:_id',function(req,res){
    var id=req.params._id
    var test=req.body;
    console.log("body: %j", test);
    CandiatModule.updateCandidat(id,test,{},function (err,result) {
        if(err){console.log("ereur",err);}
        //console.log("this is result"+result)
        res.json(result);});

});
//delete Candidat
app.delete('/API/Delete/Candidat/:_id',function(req,res){
    var id=req.params._id
    CandiatModule.DeleteCandidat(id,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//add offer to candidat
app.put('/API/AddOfferToCandiat/:_id',function(req,res){
    var id=req.params._id
    var offree=req.body;
    console.log("test: %j", offree);
    CandiatModule.addOfferToCandidat(id,offree,{},function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//change candidat offer statu
app.put('/API/ChangeCandOfferStatus/:_id',function(req,res){
    var id=req.params._id
    var offree=req.body;
    console.log("test: %j", offree);
    CandiatModule.changeStatus(id,offree,{},function (err,result) {
        if(err){console.log("ereur",err);}
    //    console.log("this is result"+result)
        res.json(result);});

});
//Get Candidat offers
app.get('/API/Get/CandidatOffers/:_id',function(req,res) {
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
            OfferModule.findOfferById(result.Myoffers[currentIndex]._id,function (err,offree) {
                a.push(offree);
                _next(currentIndex + 1)
            });
        };
        // First call
        _next(0);
            });
});
//supprimer candidat specific offer
app.put('/API/DropCandOffer/:_id',function(req,res){
    var id=req.params._id
    var offree=req.body;
    console.log("test: %j", offree);
    CandiatModule.dropCandidatOffer(id,offree,{},function (err,result) {
        if(err){console.log("ereur",err);}
//        console.log("this is result"+result)
        res.json(result);});

});
//find all Offers
app.get('/API/Get/AllOffers',function (req,res) {
    //  console.log("no error"+"")
    OfferModule.getOffers(function (err ,MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});
//add Offer
app.post('/API/ADD/Offer',function(req,res){
    var test=req.body;
    console.log("test: %j", test);
    OfferModule.AddOffer(test,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//update offers
app.put('/API/Update/offer/:_id',function(req,res){
    var id=req.params._id
    var test=req.body;
    console.log("test: %j", test);
    OfferModule.updateOffer(id,test,{},function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//delete Offer
app.delete('/API/Delete/Offer/:_id',function(req,res){
    var id=req.params._id
    OfferModule.DeleteOffer(id,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//add candidat to Offer
app.put('/API/AddCandToOffre/:_id',function(req,res){
    var id=req.params._id
    var cand=req.body;
    console.log("test: %j", cand);
    OfferModule.addCandidatToOffer(id,cand,{},function (err,result) {
        if(err){console.log("ereur",err);}
        //console.log("this is result"+result)
        res.json(result);});

});
//change offer candidat  etat
app.put('/API/ChangeOfferCandetat/:_id',function(req,res){
    var id=req.params._id
    var cand=req.body;
    console.log("test: %j", cand);
    OfferModule.changeCandStatus(id,cand,{},function (err,result) {
        if(err){console.log("ereur",err);}
        //    console.log("this is result"+result)
        res.json(result);});

});
//find offer by id
app.get('/API/Get/offer/:_id',function(req,res){
    var id=req.params._id
    OfferModule.findOfferById(id,function (err,result) {
        if(err){console.log("ereur",err);}
        //console.log("this is result"+result)
        res.json(result);});

});
//find offer candidats
app.get('/API/Get/offersCand/:_id',function(req,res) {
    var id = req.params._id;
    var a = [];

    OfferModule.findOfferById(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("result.candidats=",result.candidates);
        var _next = function (currentIndex) {
            if (currentIndex >= result.candidates.length) {
                res.json(a);
                return;
            }
           CandiatModule.getCandidatOffers(result.candidates[currentIndex]._id,function (err,cand) {
                a.push(cand);
                _next(currentIndex + 1)
            });
        };
        // First call
        _next(0);
    });
    });
//find all Recruteur
app.get('/API/Get/AllRecruteur',function (req,res) {
    //  console.log("no error"+"")
    RecuteurModule.getRecruters(function (err ,MyCandidat) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(MyCandidat);
    });
});
//Get Recruter  candidats
app.get('/API/Get/RectCandidats/:_id',function(req,res) {
    var id = req.params._id;
    var a = [];
    var _next1=function(){};
    RecuteurModule.getRecruterById(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        console.log("ereur",result.offers);
        var _next = function (currentIndex) {
            if (currentIndex >= result.offers.length) {
                res.json(a);
                return;
            }

            OfferModule.findOfferById(result.offers[currentIndex]._id, function (err, offer) {
                if (err) {
                    console.log("ereur", err);
                }
                console.log("result.candidats=",offer.candidates);
                 _next1 = function (currentIndex1) {
                    if (currentIndex1 >= offer.candidates.length) {
                        _next(currentIndex+1)
                        return ;
                    }
                    CandiatModule.getCandidatOffers(offer.candidates[currentIndex1]._id,function (err,cand) {
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
app.get('/API/Get/RectOffers/:_id',function(req,res) {
    var id = req.params._id;
    var a = [];
    RecuteurModule.getrectId(id, function (err, result) {
        if (err) {
            console.log("ereur", err);
        }
        var _next = function (currentIndex) {
            if (currentIndex >= result.offers.length) {
                res.json(a);
                return;
            }
            OfferModule.findOfferById(result.offers[currentIndex]._id,function (err,offree) {
                a.push(offree);
                _next(currentIndex + 1)
            });
        };
        // First call
        _next(0);
    });
});
//add Recruter
app.post('/API/ADD/Recruter',function(req,res){
    var test=req.body;
    console.log("test: %j", test);
    RecuteurModule.AddRecruteur(test,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//update recruter
app.put('/API/Update/Recruter/:_id',function(req,res){
    var id=req.params._id
    var test=req.body;
    console.log("test: %j", test);
    RecuteurModule.updateRecruteur(id,test,{},function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//add offer to recruter
app.put('/API/AddOfferToRecruter/:_id',function(req,res){
    var id=req.params._id
    var offree=req.body;
    console.log("test: %j", offree);
    RecuteurModule.addOfferToRectruter(id,offree,{},function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});
//find Rect by id
app.get('/API/Get/Recruter/:_id',function (req,res) {
    //  console.log("no error"+"")
    var id=req.params._id;
   RecuteurModule.getRecruterById(id,function (err ,Myuser) {
        if (err) {
//console.log(err+"")
            throw err;
        }
        //      console.log("no error"+"")
        res.json(Myuser);
    });
});
//delete Rect
app.delete('/API/Delete/Recruter/:_id',function(req,res){
    var id=req.params._id
    RecuteurModule.DeleteRecruteur(id,function (err,result) {
        if(err){console.log("ereur",err);}
        console.log("this is result"+result)
        res.json(result);});

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
