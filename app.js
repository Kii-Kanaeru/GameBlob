const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      morgan = require("morgan"),
      CatchAsync = require("./views/assets/js/CatchAsync.js"),
      ExpressError = require("./views/assets/js/ExpressError.js");
    
app.use(bodyParser.urlencoded({extended:true}))
app.use(morgan('dev'))
mongoose.connect('mongodb://localhost:27017/gameblob', {useNewUrlParser: true, useUnifiedTopology: true});

const game = require("./models/games.js"),
      admin = require("./models/admins.js");

      //users = require("./models/users.js")

      

app.use(express.static(__dirname + '/views'));
//app.use(express.static(__dirname + '/views/assets/css'));


app.get("/", (req,res) => {
    res.render("index.ejs")
}) 

app.get("/login", (req,res) => {
    res.render("login.ejs")
})

app.get("/admin", (req,res) => {
    res.render("admin.ejs")
})

app.post("/admin", async (req,res) => {
    const user1 = req.body.admin.user;
    const pass = req.body.admin.pass;
    await admin.findOne({user : user1}, (err, user) => {
        const real_pass = user.password
        console.log(real_pass)
        if(pass===real_pass){
            res.redirect("/admin/addGame")
        }else{
            res.redirect("/admin")
        }
    })
})

app.get("/admin/addGame", (req,res) => {
    res.render("addGame.ejs")
})

app.post("/admin/addGame", CatchAsync(async (req,res,next) => {
    
    req.body.game.img = req.body.img
    req.body.game.critic = req.body.critic
    const gameToAdd = req.body.game
    //console.log(req.body.critic)
    //console.log(gameToAdd)
    await game.create(gameToAdd, (game, err) => {
        res.redirect("/admin/addGame")
    })
    
}))

app.get("/home", async (req,res) => {
    let car_game = [], all_game=[]
    await game.aggregate([{ $sample: { size: 3 } }], function(err,games){
        if(err){
            console.log(err)
        }else{
            car_game = games
            //res.render(car_game)        
        }
    }) 
    await game.find({}, (err, games) => {
        if(err){
            console.log(err)
        }else{
            all_game = games
            
        }
    })
    res.render("home.ejs", {car_game: car_game, all_game: all_game})
})

app.get("/home/:gameid", CatchAsync(async (req,res,next) => {
        const games = await game.findOne({_id : req.params.gameid})
        if(!games){
            return next(new ExpressError("Page not found", 404))
        }
        res.render("game.ejs", {games:games})
    
}))

app.post("/addFeedback", (req,res) => {
    res.redirect("/")
})

app.get("/home/search", (req,res) => {
    res.send("This will be the search page") 
})

app.get("*", (req,res) => {
    res.send("This page does not exist")
})

app.use((err, req, res, next) => {
    const { statusCode , message} = err
    //console.log(err.name)
    res.status(statusCode).send(message)
})

app.listen(3000, () => {
    console.log("GameBlob servers have started on http://localhost:3000 !!")
})