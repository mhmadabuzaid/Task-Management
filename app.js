import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect(
  "mongodb+srv://abuzaid:abuzaid@mycluster.ynwwj7t.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);
const mySchema = new mongoose.Schema({
  name: String,
});
const ToDo = new mongoose.model("Todo", mySchema);
const first_todo = new ToDo({
  name: "Buy Food",
});
const second_todo = new ToDo({
  name: "Cook Food",
});
const third_todo = new ToDo({
  name: "Eat Food",
});
const todo_default = [first_todo, second_todo, third_todo];
const List_schema = new mongoose.Schema({
  name: String,
  Todoos: [mySchema],
});
const List_model = new mongoose.model("List", List_schema);

app.get("/", function (req, res) {
  ToDo.find({}).then((result) => {
    // Render the response inside this block when the query is complete
    if (result.length === 0) {
      ToDo.insertMany(todo_default)
        .then((result) => {
          // console.log(result);
          // console.log(result.length);
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/");
    }
    res.render("list", { listTitle: "Today", newListItems: result });
    // console.log(result.length);
  });
});
app.get("/:CustomListName", (req, res) => {
  const ListName = req.params.CustomListName;

  List_model.findOne({ name: ListName })
    .then((list) => {
      if (list) {
        // List with the provided name exists
        // console.log("List exists:", list);
        res.render("list.ejs", {
          listTitle: list.name,
          newListItems: list.Todoos,
        });
      } else {
        // List with the provided name does not exist
        // console.log("List does not exist");

        const new_list = new List_model({
          name: ListName,
          Todoos: todo_default,
        });
        new_list.save();
        console.log("new list has been created");
        res.redirect("/" + ListName);
      }
    })
    .catch((err) => {
      // Handle any other errors
      console.error("Error:", err);
      res.status(500).json({ error: "Internal Server Error" }); // Send a 500 Internal Server Error response
    });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const lname = req.body.list;
  const added_item = new ToDo({
    name: item,
  });
  if (lname === "Today") {
    added_item.save();
    res.redirect("/");
  } else {
    List_model.findOne({ name: lname })
      .then((list) => {
        list.Todoos.push(added_item);
        list.save();
        res.redirect("/" + list.name);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
  console.log(listName);
  console.log(checkedItemId);

  if (listName === "Today") {
    ToDo.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    List_model.findOneAndUpdate(
      { name: listName },
      { $pull: { Todoos: { _id: checkedItemId } } },
      { new: true } // To return the updated document
    )
      .then((updatedList) => {
        if (updatedList) {
          console.log(
            "Successfully deleted the item from the array:",
            updatedList
          );
          // Handle success (e.g., send a response)
          res.redirect("/" + listName);
        } else {
          console.log("List not found or item not deleted.");
          // Handle case where the list or item was not found
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error (e.g., send an error response)
      });
  }
});

//dynamic get route depending on the parameter

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
