//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv/config");


const app = express();
mongoose.connect(process.env.DB_CONNECTION,()=>{
  console.log("connected to database");
});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// const workItems = [];

const item1 = new Item({
  name: "Welcome to  your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);






app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully updated documents");
        }
      });

      res.redirect("/");


    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });





});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){

    item.save();
    res.redirect("/");
  
  }else{
    List.findOne({name: listName},(err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
 
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){

    Item.findByIdAndDelete(checkedItemId, (err) => {
      if (!err) {
        console.log("succesfully deleted items");
      }
    });
    res.redirect("/");

  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},(err, findList)=>{
if(!err){
  res.redirect("/"+ listName);
}
    });
  }
  
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName); 

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      //creates a new list
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        }); 

        list.save();
        res.redirect("/" + customListName);
        

      }else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
       
      }

     
    }
  });

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 4000, function () {
  console.log("Server started on port 4000");
});

//

