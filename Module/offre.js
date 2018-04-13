/**
 * Created by ahmed aj on 10/04/2018.
 */

var mongoose =require('mongoose');
// User schema
var OffreSchema=mongoose.Schema({

    titre_job: String,
    description: String,
    salaire: Number,
    date_offre: Date,
    background: String,
    language: [
        {
            nom_langue: String,
            niveau: String
        }
    ],
    niveau_etude: String,
    status: String,
    id_recruteur: String,
    candidates: [

        {
            _id: String,
            date_application: String,
            etat_candidate: String
        }
    ],
    skills:[
        {
            nom_skill:String,
            niveau:String
        },
    ],
    nom_entreprise: String

});

var Offer=module.exports=mongoose.model('Offer',OffreSchema,'Offer');
module.exports.getOffers=function (callback,limet) {
    Offer.find(callback).limit(limet).pretty;
}
module.exports.findOfferById=function (ids,callback) {
    a = Offer.findById({_id: ids}, callback)
}




//Add offer
module.exports.AddOffer=function(offre,callback){
    Offer.create(offre,callback);
}
//delete offer
module.exports.DeleteOffer=function(id,callback){
    var query={_id:id};
    Offer.remove(query,callback);
}
//update offer
module.exports.updateOffer=function(id,offer,option,callback){
    var query={_id:id};
    var update= {
        titre_job: offer.titre_job,
        description: offer.description,
        salaire: offer.salaire,
        date_offre: offer.date_offre,
        background: offer.background,
        language:offer.language,
        niveau_etude: offer.niveau_etude,
        status: offer.status,
        id_recruteur: offer.id_recruteur,
        candidates: offer.candidates,
        skills:offer.skills,
        nom_entreprise: offer.nom_entreprise
    }
    Offer.findOneAndUpdate(query,update,option,callback);
}
//get offer by recruter id
module.exports.getOffersByRectID=function (rect_id,callback) {
    //var query={email:email}
    Offer.find({"id_recruteur":rect_id},callback);
}
//add Candidat to offer
module.exports.addCandidatToOffer=function(id,cand,option,callback){
    Offer.findById(id,function(err,offre){
        if(err)throw err;
        offre.candidates.push(cand);
        Offer.findOneAndUpdate({"_id":id},offre,option,callback);
    })
}
//change offre candidat statu
module.exports.changeCandStatus=function(id,cand,option,callback){
    Offer.findById(id,function(err,offre){
        if(err)throw err;
        Array.prototype.changeObjValueAfterFind = function(key, value) {
            return this.filter(function(item) {
                if(item[key] === value){
                    console.log("this item  statu  is:"+item["etat_candidate"])
                    item["etat_candidate"]=cand.etat_candidate;}
            });
        }
        offre.candidates.changeObjValueAfterFind("_id",cand._id);
        Offer.findOneAndUpdate({"_id":id},offre,option,callback);
    })
}
