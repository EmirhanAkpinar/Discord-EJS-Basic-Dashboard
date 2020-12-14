require("dotenv").config();

//Website   -----------------------------------------
const express = require("express");
const app = express();
const url = require("url");
const path = require("path");
const passport = require("passport");
//const mongooseInit = require("./modals/mongooseInit");
const session = require("express-session");
const flash = require("express-flash");
const initPassport = require("./configs/passport-config");
const db = require("quick.db");
const settings = require("./configs/settings.json");
const Discord = require("discord.js");
const client = new Discord.Client();
const bodyParser = require('body-parser')
//Routes
const loginRoute = require("./routes/loginRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const profileRoute = require("./routes/profileRoute");

//Middlewares
const { hasServerManagePerms,getDiscordClient,isAdmin } = require("./middlewares/Perms");
const { isLoggedIn,getLoggedIn } = require('./middlewares/Auth')
//JSON Datas
const admins = require("./admins.json")

//mongooseInit.init();
initPassport(passport);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.use(flash());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//app.locals.domain = "https://pixapbot.glitch.me";
app.use(express.static('public'))
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
  if (typeof req.user === "undefined") {
    res.render("Login");
  } else {
    res.render("Home", {
      user: req.user,
      checkforperm: hasServerManagePerms,
    });
  }
});
app.get("/profile", (req, res, next) => {
  if (typeof req.user === "undefined") {
    res.render("Login");
  } else {
    
    res.render("Profile", {
      user: req.user,
      checkforperm: hasServerManagePerms
    });
  }
});
app.post('/api/prefixSave',isLoggedIn,(req,res,next)=>{
  db.set(`${req.body.guildId}.Ayarlar.Prefix`, req.body.prefixData)
  res.send(req.body)

})
app.post('/api/langSave',isLoggedIn,(req,res,next)=>{
  
  db.set(`${req.body.guildId}.Ayarlar.Dil`, req.body.langData)
  res.send(req.body)

})
app.get("/stats",(req, res, next) => {
  
  if (getLoggedIn(req)) {
    let bot = getDiscordClient()
    res.render("Stats-login", {
      user: req.user,
      bot,
      checkforperm: hasServerManagePerms
    });
  } else {
    let bot = getDiscordClient()
    res.render("Stats-nologin", {
      bot
    });
  }
});
app.get("/admin",isLoggedIn,isAdmin,(req, res, next) => {

  let bot = getDiscordClient()
  res.render("AdminHome", {
    user: req.user,
    bot,
    checkforperm: hasServerManagePerms,
  });
});
app.get("/discord", passport.authenticate("discord"));
app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/autherror" }),
  async (req, res) => {
    if (admins.includes(req.user.id)) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  }
);

app.get("/botuekle", (req, res) => {
  res.redirect(
    `https://discordapp.com/oauth2/authorize?client_id=777974635501191218&scope=bot&permissions=8`
  );
});




app.use("/login", loginRoute);
app.use("/dashboard", dashboardRoute);

app.listen(80, () => {
  console.log("Server Started");
});

//Discord Bot Runs here
const discordMain = require("./discord-main");