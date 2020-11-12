if(process.env.NODE_ENV != "production"){
	require("dotenv").config({path: __dirname + '/.env'});
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoDBStore = require("connect-mongo")(session);
const flash = require("connect-flash");

var urlObj;

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/WebD_Project";
//const dbUrl = "mongodb://localhost:27017/WebD_Project";
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
	console.log("DB CONNECTED!");
})
.catch(err => {
	console.log("OOPS! Error ocurred in connecting to mongo!");
	console.log(err);
});

const secret = process.env.SECRET;

const store = new MongoDBStore({
	url: dbUrl,
	secret,
	touchAfter: 24*60*60
})

store.on("error", (e) => {
	console.log("SESSION STORE ERROR: ", e);
})

app.use(express.static(path.join(__dirname, '/')));
app.use("/public", express.static('./public/'));
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json({limit : "1mb"}));
app.use(session({store, secret, resave: false, saveUninitialized: true}));
app.use(flash());


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))


const requireLogin = (req, res, next) => {
	if(!req.session.user_id){
		return res.redirect("/login");
	}

	next();
}


app.get("/", (req,res) => {
	res.render("home");
	
})


app.get("/register", (req,res) => {

	res.render("register");	
	
})

app.post("/register", async (req, res) => {
	const { username, password, email } = req.body;
	const hash = await bcrypt.hash(password, 12);

	const user = new User({
		username, password: hash, email, totalCorrect: 0, totalIncorrect: 0, totalSkipped: 0,
	
	})

	await user.save();

	req.session.user_id = user._id;
	req.flash("success", "Hey "+username+"! You're successfully logged in.");
	res.redirect("/explore");

})

app.get("/login", (req,res) => {

	res.render("login", {messages : req.flash("failure")});

})

app.post("/login",async (req,res) => {
	
	const { username, password } = req.body;
	const user = await User.findOne({username});
	
	const validPassword = await bcrypt.compare(password, user.password);

	if(validPassword){
		//console.log("You are succesfully logged in.");
		req.session.user_id = user._id;
		req.flash("success", "Hey "+username+"! You're successfully logged in.");
		res.redirect("/explore");
	}
	else{
		//console.log("Incorrect username or password!");
		req.flash("failure", "Incorrect username or password!");
		res.redirect("/login");
	}

	
})

app.get("/logout", (req, res) => {
	req.session.user_id = null;
	res.redirect("/login");
})

app.get("/explore", requireLogin, (req, res) => {
	res.render("explore", {messages : req.flash("success")});
})

app.post("/explore", requireLogin, (req, res) => {
	urlObj = req.body;
	//console.log(urlObj);

	res.json({
		status: "success"
	});
})

app.get("/practice", requireLogin, (req, res) => {
	res.cookie("url", urlObj.url);
	
	res.render("practice");
})

app.get("/dashboard", requireLogin, async (req, res) => {
	const user_id = req.session.user_id;
	const user = await User.findById(user_id);
	const username = user.username;
	const Qoins = user.totalCorrect;
	const correct = Qoins;
	const incorrect = user.totalIncorrect;
	const skipped = user.totalSkipped;
	const sum = correct + incorrect + skipped;
	const pCorrect = Math.round((correct*100)/sum);
	const pIncorrect = Math.round((incorrect*100)/sum);
	const pSkipped = Math.round((skipped*100)/sum);
	const accuracy = Math.round((correct/(correct+incorrect))*100);

	res.render("dashboard", {
		username : username, 
		Qoins : Qoins, 
		correct : correct, 
		incorrect : incorrect, 
		skipped : skipped,
		pCorrect : pCorrect,
		pIncorrect : pIncorrect,
		pSkipped : pSkipped,
		accuracy : accuracy
	});
})

app.get("/leaderboard", requireLogin, async (req, res) => {
	const user_id = req.session.user_id;
	const user = await User.findById(user_id);
	const username = user.username;
	const Qoins = user.totalCorrect;

	const rankings = await User.find().sort({totalCorrect: -1});

	res.render("leaderboard", {
		rankings: rankings,
		username: username,
		Qoins: Qoins
	});
})

app.post("/updateDb", requireLogin, async (req, res) => {
	const data = req.body;
	const user_id = req.session.user_id;

	const user = await User.findById(user_id);
	user.totalCorrect += (data.correct); 
	user.totalIncorrect += (data.incorrect);
	user.totalSkipped += (data.skipped);

	await user.save();

	res.json({
		status: "success"
	});
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Serving on port ${port}`);
})
