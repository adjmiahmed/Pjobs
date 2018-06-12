/**
 * Created by ahmed aj on 10/04/2018.
 */

var mongoose =require('mongoose');
// User schema
var CandidatSchema=mongoose.Schema({

    nom: String,
    deviceId:String,
    email: String,
    passwd: String,
    dateNaissance: Date,
    summary:String,
    numtel: Number,
    adress: String,
    url_img: String,
    genre: String,
    language: [
        {
            nom_langue: String,
            niveau: String
        }
    ],
    projet: [
        {
            nom_project: String,
            date_debut:Date,
            date_fin: Date,
            description: String,
            tache_realiser: String
        }
    ],
    education: [
        {
            nom_etablissement: String,
            date_entrer: Date,
            date_sortie: Date,
            diplome: String
        }
    ],
    skills: [
        {
            nom_skill: String,
            niveau: String
        }
    ],
    experience_professionel: [
        {
            nom_entreprise: String,
            titre_occuper: String,
            tache_realiser: String,
            date_entrer: Date,
            date_sortie: Date
        }
    ],
    Myoffers:[{
        _id:String,
        statu:String,
        date_application:Date
    }]
});

var candidat=module.exports=mongoose.model('Candidat',CandidatSchema,'Candidat');
//get candidats
module.exports.getCandidats=function (callback,limet) {
    candidat.find(callback).limit(limet).pretty;
}
//Add Cadidat
module.exports.AddCandidat=function(Candidat,callback){
    candidat.create(Candidat,callback);
}

//update candidat
module.exports.updateCandidat=function(id,Candidat,option,callback){
    var query={_id:id};
    var update= {

        nom: Candidat.nom,
        email: Candidat.email,
        passwd: Candidat.passwd,
        dateNaissance: Candidat.dateNaissance,
        numtel: Candidat.numtel,
        adress: Candidat.adress,
        url_img: Candidat.url_img,
        genre: Candidat.genre,
        language: Candidat.language,
        projet: Candidat.projet,
        education: Candidat.education,
        summary:Candidat.summary,
        skills: Candidat.skills,
        experience_professionel: Candidat.experience_professionel,
       
    }
    candidat.findOneAndUpdate(query,update,option,callback);
}

//update cand device id
module.exports.updateCandidatDeviceId=function(id,deviceid,option,callback){
    var query={_id:id};
    var update= {
deviceId:deviceid
    }
    candidat.findOneAndUpdate(query,update,option,callback);
}

//delete Candidat
module.exports.DeleteCandidat=function(id,callback){
    var query={_id:id};
   candidat.remove(query,callback);
}

//get Candidat by email
module.exports.getCandByemail=function (email,callback) {

    candidat.findOne({"email":email},callback);
}

//add offer to Candidat
module.exports.addOfferToCandidat=function(id,offer,option,callback){
    candidat.findById(id,function(err,cand){
        if(err)throw err;
        cand.Myoffers.push(offer);
        candidat.findOneAndUpdate({"_id":id},cand,option,callback);
    })
}

//change candidat offre statu
module.exports.changeStatus=function(id,offer,option,callback){
    candidat.findById(id,function(err,cand){
        if(err)throw err;
        Array.prototype.changeObjValueAfterFind = function(key, value) {
            return this.filter(function(item) {
                if(item[key] === value){
                    console.log("this item  statu  is:"+item["statu"])
                    item["statu"]=offer.statu;}
            });
        }
        cand.Myoffers.changeObjValueAfterFind("_id",offer._id);
        candidat.findOneAndUpdate({"_id":id},cand,option,callback);
    })
}
//Supprimer offre from canddiat
module.exports.dropCandidatOffer=function(id,offer,option,callback){
     var i=0;
    candidat.findById(id,function(err,cand){
        if(err)throw err;
        Array.prototype.deleteObjValueAfterFind = function(key, value) {
            return this.filter(function(item) {
             i=i+1;
                if(item[key] === value){
                    console.log("this item  index  is:"+i)
                    Array.prototype.splice(i,1);
                    }
            });
        }
        cand.Myoffers.deleteObjValueAfterFind("_id",offer._id);
        candidat.findOneAndUpdate({"_id":id},cand,option,callback);
    })
}
//get all My Offers
module.exports.getCandidatOffers=function (id,callback) {
            candidat.findById(id,callback);
    }


