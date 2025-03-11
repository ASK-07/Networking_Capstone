const { MongoClient} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const uri = "mongodb+srv://askaylor7:JdovmgHuMmlYWyQP@glb116-capstonecluster.iwtffnu.mongodb.net/?retryWrites=true&w=majority&appName=GLB116-CapstoneCluster";

app.use(bodyParser.json());

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Cache-Control', 'no-store'); 
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
}); 
let cs = "mongodb+srv://askaylor7:JdovmgHuMmlYWyQP@glb116-capstonecluster.iwtffnu.mongodb.net/?retryWrites=true&w=majority&appName=GLB116-CapstoneCluster"
let db;
let books;

async function start() {
    const client = new MongoClient(cs)
    await client.connect();
    db = client.db("CapstoneLibrary");
    books = db.collection("books");
    await insertStartBooks();
    console.log("Listening");
    app.listen(3000);
    }
async function insertStartBooks() {
    try {
        // Delete existing books collection to avoid duplicates
        await books.deleteMany({});
        
        // Insert each book from StartBooks array
        await books.insertMany(StartBooks);
        console.log("StartBooks inserted successfully");
    } catch (error) {
        console.error("Error inserting StartBooks:", error);
    }
}
var StartBooks = [
    { id: "1", title: "Reactions in REACT", author:"Ben Dover", publisher: "Random House", isbn: "978-3-16-148410-0", avail: true },
    { id: "2", title: "Express-sions", author:"Frieda Livery", publisher: "Chaotic House", isbn: "978-3-16-148410-2", avail: true },
    { id: "3", title: "RESTful Rest", author:"Al Gorithm", publisher: "ACM Publishers", isbn: "978-3-16-143310-1", avail: true },
    { id: "4", title: "See Es Es", author:"Anna Log", publisher: "O'Reilly", isbn: "987-6-54-148220-1", avail: false, who: "Homer", due:"1/1/23" },
    { id: "5", title: "Scripting in Javascript", author:"Dee Gital", publisher: "IEEE", isbn: "987-6-54-321123-1", avail: false, who: "Marge", due: "1/2/23" },
    { id: "6", title: "HTML Heros", author:"Jen Neric", publisher: "self", isbn: "987-6-54-321123-2", avail: false, who: "Lisa", due: "1/3/23" },
    { id: "7", title: "Python Primer", author: "Monty Python", publisher: "Pythons Publishing", isbn: "978-3-16-111111-1", avail: true },
    { id: "8", title: "Java Journey", author: "Duke Java", publisher: "Java House", isbn: "978-3-16-222222-2", avail: true },
    { id: "9", title: "C++ Chronicles", author: "Cee Plus", publisher: "C++ Press", isbn: "978-3-16-333333-3", avail: true },
    { id: "10", title: "Ruby Roadmap", author: "Ruby Red", publisher: "Ruby Books", isbn: "978-3-16-444444-4", avail: true },
    { id: "11", title: "PHP Parable", author: "PHP Phan", publisher: "PHP Press", isbn: "978-3-16-555555-5", avail: true }
];



app.get('/books', (req, res) => {
    const availParam = req.query.avail; // Get the avail query parameter

    // If avail=true is provided, filter available books, else return all books
    const filter = availParam === 'true' ? { avail: true } : availParam === 'false' ? { avail: false } : {};

    books.find(filter)
        .project({ _id: 0, id: 1, title: 1 })
        .toArray()
        .then(allbooks => {
            res.status(200).send(JSON.stringify(allbooks));
        })
        .catch(error => {
            res.status(500).send("Internal Server Error");
        });
});



app.get('/books/:id', (req,res) => {
    books.findOne( { id:req.params.id } )
    .then( (book) => {
    if (book == null)
    res.status(404).send("not found")
    else res.send(JSON.stringify(book))
    } )
    })


    app.put('/books/:id', (req,res) => { 
        const bookId = req.params.id;
        const updateData = req.body; // Assuming update data is sent in the request body
        books.updateOne({ id: bookId }, { $set: updateData })
            .then(result => {
                if (result.modifiedCount === 0) {
                    res.status(404).send("Book not found");
                } else {
                    res.send("Book updated successfully");
                }
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
    app.delete('/books/:id', (req,res) => { 
        const bookId = req.params.id;
        books.deleteOne({ id: bookId })
            .then(result => {
                if (result.deletedCount === 0) {
                    res.status(204).send("Book not found");
                } else {
                    res.send("Book deleted successfully");
                }
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
    app.post('/books', (req,res) => { 
        const newBook = req.body; // Assuming new book data is sent in the request body
        if (!newBook.title) {
            res.status(403).send("Book must have a name");
            return;
        }
        
        books.insertOne(newBook)
            .then(result => {
                res.status(201).send("Book added successfully");
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
start()
