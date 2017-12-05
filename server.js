var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");

mongoose.Promise = global.Promise;

var app = express();

app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));

var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
	name: String,
	message: String,
	_comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

mongoose.model("Message", MessageSchema);
var Message = mongoose.model("Message");
var CommentSchema = new mongoose.Schema({
	name: String,
	comment: String,
	_message: {type: Schema.Types.ObjectId, ref: 'Message'}
});

mongoose.model("Comment", CommentSchema);
var Comment = mongoose.model("Comment");

mongoose.connect('mongodb://127.0.0.1/msg_board', function(err, db){
	if(err){
		console.log("error here");
		console.log(err);
	}
});

// ROUTES

app.get("/", function(req, res){
	Message.find({}, false, true).populate('_comments').exec(function(err, messages){
	      res.render('index.ejs', {messages: messages});
	});
});

app.post("/message", function(req, res){
	var newMessage = new Message({name: req.body.name, message: req.body.message});
	newMessage.save(function(err){
		if(err){
			console.log(err);
			res.render('index.ejs', {errors: newMessage.errors, messages: messages});
		} else {
			console.log("You've Got Mail!");
			res.redirect('/');
		}
	})
})

app.post("/comment/:id", function(req, res){
	Message.findOne({_id: req.params.id}, function(err, message){
		var newComment = new Comment({name: req.body.name, comment: req.body.comment});
        newComment._message = message._id;
        Message.update({_id: message._id}, {$push: {"_comments": newComment}}, function(err){
            console.log('COMMENT POSTED')
        });

		newComment.save(function(err){
			if(err){
				console.log(err);
				res.render('index.ejs', {errors: newComment.errors, messages: messages});
			} else {
				console.log("comment added");
				res.redirect("/");
			}
		});
	});
});

app.listen(8000, function(){
	console.log("The World is Listening on port 8000");
});

