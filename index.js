const express = require('express');
const app = express();
const port = 3000;

app.set('view-engine', 'ejs');

app.get("/", (req, res) => { 
    res.render('index.ejs')});

app.get("/login", (req, res) => { 
    res.render('login.ejs')});

app.get("/register", (req, res) => { 
    res.render('register.ejs')});

app.get("/admin", (req, res) => { 
    res.render('admin.ejs')});

app.get("/dashboard", (req, res) => { 
    res.render('dashboard.ejs')});

app.get("/survey", (req, res) => { 
    res.render('survey.ejs')});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});