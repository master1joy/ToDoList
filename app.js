const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/Date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))
try {
  mongoose.connect("mongodb+srv://adminJoydip92:J0ydip124@cluster0.rjkzwfq.mongodb.net/todolistDB");
  console.log("connection eatablished.");
} catch (e) {
  console.log(e);
}

const itemsSchema = new mongoose.Schema({
      name: {type:String, required:true}
})
const Item = mongoose.model("item",itemsSchema);

const listSchema = new mongoose.Schema({
  name: {type:String, required:true},
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "welcome to your toDo list."
});
const item2 = new Item({
  name: "press + button to add new item"
});
const item3 = new Item({
  name: "<-- to delete item"
});

var defaultItems = [item1,item2,item3];

app.get("/", function(req, res){
  Item.find({}).then(
    foundItems => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems).then(
          result => {
            console.log(result);
          }
        ).catch(
          err => {
            console.log(err);
          }
        );
        res.redirect("/");
      }else {
        res.render("list", {listTitle: "Today", listItems: foundItems});
      }

    }
  ).catch(
    err => {
      console.log(err);
    }
  );
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({name: customListName}).then(
    (result)=>{
      if (result) {
        //render to the list page
        res.render("list", {listTitle: result.name, listItems: result.items})
      }else {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        }).save();
        res.redirect("/"+customListName);
      }

      }
  ).catch((err)=>{console.log(err);})
});


app.post("/delete", (req, res) => {
  const deleteItemId = req.body.itemId;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(deleteItemId).then(result => {
      console.log("successfully deleted");
    });
    res.redirect("/");
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}).then(
      (result)=>{
        res.redirect("/"+listName)
      }
    );
  }

})

app.post("/", function(req, res){
let itemName = req.body.newItem;
const listName = req.body.list;
const item = new Item({
  name: itemName
});
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName}).then(
      (foundList) => {
        if (foundList) {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/"+listName)
        }
      }
    )
  }
});

app.get("/about", function(req, res){

  res.render("about");
})

app.listen(3000, function(){
  console.log("server is listening on port 3000");
})
