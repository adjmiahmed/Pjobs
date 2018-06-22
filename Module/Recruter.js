/**
 * Created by ahmed aj on 10/04/2018.
 */
var mongoose =require('mongoose');
// User schema
var RecruterSchema=mongoose.Schema({
    nom: String,
    deviceId:String,
    email: String,
    passwd: String,
    dateNaissance: Date,
    numtel: Number,
    adress: String,
    url_img: String,
    genre: String,
    entreprise: {
        nom_entreprise: String,
        num_entreprise: Number,
        adress_entreprise: String,
        description: String,
        email_entreprise: String,
        logo: String,
        siteweb: String
    },
    offers: [
        {
            _id: String,
            date_creation: Date
        }
    ]
});

var Recruter=module.exports=mongoose.model('Recruter',RecruterSchema,'Recruter');
module.exports.getRecruters=function (callback,limet) {
    Recruter.find(callback).limit(limet).pretty;
}

//Add Recruteur
module.exports.AddRecruteur=function(recruteur,callback){
    Recruter.create(recruteur,callback);
}
//delete Recruteur
module.exports.DeleteRecruteur=function(id,callback){
    var query={_id:id};
    Recruter.remove(query,callback);
}

//update Recruter
module.exports.updateRecruteur=function(id,recruter,option,callback){
    var query={_id:id};
    var update= {
        nom: recruter.nom,
        email: recruter.email,
        passwd: recruter.passwd,
        dateNaissance: recruter.dateNaissance,
        numtel: recruter.numtel,
        adress: recruter.adress,
        url_img: recruter.url_img,
        genre: recruter.genre,
        entreprise: recruter.entreprise,
        offers: recruter.offers
    }
    Recruter.findOneAndUpdate(query,update,option,callback);
}
//update rect device id
module.exports.updateRectDeviceId=function(id,deviceid,option,callback){

    Recruter.findOneAndUpdate({_id:id}, {$set:deviceid}, {new:true}, callback)

}


//get Recruter by email
module.exports.getRectByEmail=function (email,callback) {
    //var query={email:email}
    Recruter.findOne({"email":email},callback);
}
//find by id
module.exports.getRecruterById=function (id,callback) {
    var query={_id:id}
    Recruter.findById(id,callback);
}

//add offer to recruter
module.exports.addOfferToRectruter=function(id,offer,option,callback){

    Recruter.findById(id,function(err,rect){
        if(err)throw err;
    rect.offers.push(offer);
    Recruter.findOneAndUpdate({"_id":id},rect,option,callback);
    })}
    //get recruter id
module.exports.getrectId=function (id,callback) {
    Recruter.findById(id,callback);
}


