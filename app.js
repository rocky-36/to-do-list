
const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-niteesh:Kpdsicon123@cluster0.hddxg.mongodb.net/todolistDB", { useNewUrlParser: true});

const itemSchema = {name: {type: String,required: true}};

const listSchema = {name: String,items: [itemSchema]};

const Item = mongoose.model("Item",listSchema);

const item1 = new Item({name: "Welcome to todoList"});

const item2 = new Item({name: "press + button to add new items"});

const item3 = new Item({name: "<-- press this to strike off completed things"});

const defaultItems = [item1,item2,item3];

const List = mongoose.model("List",listSchema);

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set("view engine","ejs");



app.get("/",function(req,res) {
  Item.find({},function(err,foundList){
    if(foundList.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully entered default items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{kind : "today",newItem : foundList});
    }
  })

});

app.get("/:customListName",function(req,res) {
  const customName = _.capitalize(req.params.customListName);
  List.findOne({name: customName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customName);
      }else{
        res.render("list",{kind : customName, newItem : foundList.items});
      }
    }
  });


})

app.post("/",function(req,res) {
  const newAd = req.body.item;
  const listName = req.body.Slist;
  if(req.body.Slist==="today"){
    Item.insertMany({name: newAd},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully entered new item");
      }
    });
    res.redirect("/")
  }else{
    List.findOne({name: listName},function(err,foundList) {
      const item = new Item({name: newAd});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+req.body.Slist);
    });
  }
});

app.post("/delete",function(req,res){
  const currId = req.body.checkBox;
  const listName = req.body.listName;
  if(listName==="today"){
    Item.findByIdAndRemove(currId,function(err){
      if(!err){
        console.log("successfully deleted from DB");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: currId}}},function(err,response) {
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

app.listen(3000,function() {
  console.log("server is up and listening")
});
