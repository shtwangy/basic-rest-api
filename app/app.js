const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const dbPath = 'app/db/database.sqlite3'

// Get all users
app.get('/api/v1/users', (req, res) => {
    // Connect database
    const db = new sqlite3.Database(dbPath)

    db.all('SELECT * FROM users', (err, rows) => {
        res.json(rows)
    })

    db.close()
})

const port = process.env.PORT || 3000
app.listen(port)
console.log("Listen on port: " + port)
