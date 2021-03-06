var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		unique: true,
		index: true
	},
	password: {
		type: String
	},
	color: { type: String},
	role: {type: String,
		default: 'user'},
	chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
}, {
	usePushEach: true
  });


UserSchema.methods.addChat = function(chat, callback) {
  // add some stuff to the users name
  	var query = {_id:this.id},
		update = { 
	    	$addToSet: {chats: chat} 
	    },	    
	    options = { new: true };
	User.findOneAndUpdate(query, update, options, callback);
};

UserSchema.methods.getChats = function(callback) {
	User.findOne({_id:this.id}).select('chats').populate('chats','name _id lastMessage users').exec(callback);
};

var User = module.exports = mongoose.model('User',UserSchema);

module.exports.createUser = function(newUser, callback) {
	// newUser.save(callback); 
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
        	newUser.password = hash;
        	newUser.save(callback);
    	});
	});
}

module.exports.updateUser = function(userid, password, color,role, callback) {
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(password, salt, function(err, hash) {
			var query = {_id:userid},
			update = { 
				password : hash,
				color : color,
				role : role
			},	    
			options = { new: true };
			User.findOneAndUpdate(query, update, options, callback);
		});
	});
	
}

module.exports.removeChat = function (chatid){
	// User.update( {_id: userid}, { $pullAll: { chats: [chatid] } } );
	User.update( { }, { $pullAll: { chats: [chatid] } } );
}

module.exports.removeChat = function (userid, chatid){
	User.update( {_id: userid}, { $pull: {chats: [chatid]} } );
}

module.exports.getUserByUsername = function(username, callback) {
	// var query = {
	// 	$where: "this.username === '" + username + "'"
	// };
	User.findOne({username: username},callback);
}

module.exports.getUserById = function(id, callback) {
	User.findById(id,callback);
}

module.exports.addChat = function(id, chat, callback) {
	var query = {_id:id},
		update = { 
	    	$addToSet: {chats: chat} 
	    },	    
	    options = { new: true };
	User.findOneAndUpdate(query, update, options, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback) {
	console.log("compare pass: "+candidatePassword+" "+ hash);
	bcrypt.compare(candidatePassword, hash, callback);
}

module.exports.authUsernamePassword = function(username, password, callback) {
	// hardcoddedusername = '\'; return \'\' == \'';
	console.log("auth username password entered.\t", username+password);
	// console.log("hardcoded.\t", hardcoddedusername+password);
	var query = {
		$where: "this.username === '" + username + "' && this.password === '" +  password + "'"
	};
	console.log(query);
	User.findOne(query,callback);
}