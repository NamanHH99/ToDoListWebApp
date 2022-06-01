const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Naman_Admin:NNHSJck9113@cluster0.gfqxg.mongodb.net/ToDoListDB",{ useNewUrlParser: true});
// defining schema
const itemsSchema = new mongoose.Schema({
  name : {type : String, required : true}
});
//Defining the model(collection)
const Item = mongoose.model("Item",itemsSchema);

// Some default documents adding them
const item1 =  new Item({
  name : "Welcome to your ToDoList"
});
const item2 = new Item({
  name : "Hit the + button to add new items"
});
const item3 = new Item({
  name : "<- Hit the checkbox to delete items."
});
const defaultItems = [item1,item2,item3];
// Item.insertMany(defaultItems,function(err){
//   if(err){console.log(err);}
//   else{console.log("Successfully added default items.")}
// });
app.get("/", function(req, res){
  const day = date.getDate();

  Item.find({},function(err,items){
    // items gives the array of all the documents inside our collection Item.
    if(items.length === 0){
      // If the array is empty we add the default items otherwise not
      Item.insertMany(defaultItems,function(err){
        console.log("Successfully added default items.");
      });
    }

    res.render("list", {listTitle: day, newListItems: items});

  });

});

app.post("/", function(req, res){
  const itemInput = req.body.newItem;
  const listName =  req.body.list;

  const itemAdd = new Item({
    name : itemInput
  });

  if(listName === date.getDate()){
    itemAdd.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName},function(err,foundList){
      foundList.items.push(itemAdd);
      foundList.save();
      res.redirect("/" + listName);
    });

  }
});

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});
const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName = lodash.capitalize(req.params.customListName);
  List.findOne({name : customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // Creating a new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});



app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === date.getDate()){
    Item.deleteOne({_id:id},function(err){
      if(err){console.log(err); }
      else{console.log("Deleted Successfully"); }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull : {items:{_id:id}}},function(err,foundListBeforeUpdate){
      if(!err){
        console.log("Deleted Succesfully");
        res.redirect("/" + listName);
      }
    });
  }

});






app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
