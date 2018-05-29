/**
 * Created by ahmed aj on 28/05/2018.
 */
var mongoose =require('mongoose');

var notifShcema=mongoose.Schema({
    UserID:String,
    title:String,
    body:String,
    deviceId:String
});

var notif=module.exports=mongoose.model('Notif',notifShcema,'Notif');
module.exports.getnotifByuserid=function (email,callback) {
    //var query={email:email}
    notif.find({"UserID":email},callback);
}
//create notif
module.exports.addnotif=function(notifi,callback){
    notif.create(notifi,callback);
}
//updatenotif
module.exports.updateNotif=function(id,notifi,option,callback){
    var query={_id:id};
    var update= {
        deviceId: notifi.deviceId,
    }
    notif.findOneAndUpdate(query,update,option,callback);
}

