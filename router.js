let express = require('express');
const mongodb = require("mongodb");
let router = express.Router();
let bodyParser = require('body-parser');

ObjectId = require('mongodb').ObjectID;

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({
    extended: false
}))
// parse application/json
router.use(bodyParser.json())

//Configure MongoDB
const MongoClient = mongodb.MongoClient;

// Connection URL
const url = "mongodb://localhost:27017/";

//reference to the database (i.e. collection)
let db;

//Connect to mongoDB server
MongoClient.connect(url, {
    useNewUrlParser: true
},
function (err, client) {
    if (err) {
        console.log("Err  ", err);
    } else {
        console.log("Connected successfully to server");
        db = client.db("fit2095db"); //db name 
       // col = db.collection('task'); //creates a table if there isn't one
    }
});

router.get('/', function (req, res) {
    let randomId = Math.round(Math.random() * 100);
    res.render('index.html', {
        username: "admin",
        id: randomId
    });
});

router.get('/add-task', function (req, res) {
    res.render('add-task.html');
});

router.post('/addtask', function (req, res) {
    let taskdetails = req.body;
    console.log(taskdetails);
    
    db.collection('task').insertOne({
        taskName: taskdetails.taskName,
        taskDueDate: taskdetails.taskDueDate,
        taskDescription: taskdetails.taskDescription,
        taskAssignTo: taskdetails.taskAssignTo, 
        taskStatus: taskdetails.taskStatus
    });
    
    res.redirect('/list-task');
});

router.get('/list-task', function (req, res) {
    db.collection('task').find({}).toArray(function (err, data) {
        res.render('view-task', {
            taskDb: data
        });
    });
});

//update tasks
router.get('/update-task', function (req, res) {
    res.sendFile(__dirname + '/views/update-task.html');
});

//update tasks data
router.post('/updatetaskdata', function (req, res) {
    let taskdetails = req.body;
    console.log(taskdetails);
    console.log(ObjectId(taskdetails.taskId));
    
    let filter = {
        _id: ObjectId(taskdetails.taskId)
    };
    let theUpdate = {
        $set: {
            taskStatus: taskdetails.newTaskStatus
        }
    };
        
    db.collection('task').updateOne(filter, theUpdate,{upsert: true},function (err, result) {
        console.log(err)
    });
    res.redirect('/list-task'); // redirect the client to list users page
});

//delete task 
router.get('/delete-task', function (req, res) {
    res.sendFile(__dirname + '/views/delete-task.html');
}); 

router.post('/deletetaskdata', function (req, res) {
    let taskDetails = req.body;
    console.log(taskDetails);
    
    let filter = {
        _id: ObjectId(taskDetails.task_id)
    };
    console.log(filter);
    
    db.collection('task').deleteOne(filter);
    res.redirect('/list-task'); // redirect the client to list users page
});

router.post('/deletecompletedtask', function(req, res){
    db.collection('task').deleteMany({taskStatus : "complete"})
    res.redirect('/list-task'); // redirect the client to list users page
});

// lab task: delete old complete 

router.post("/deleteOldComplete", function(req,res){
    let filter = {
        taskStatus : "complete",
        taskDueDate: {$lt: "2019-08-30"}
    }
    db.collection('task').deleteMany(filter);
    res.redirect('/list-task'); // redirect the client to list users page
});

//export this router 
module.exports = router;