const express = require('express')
const app = express()

const sqlite3 = require('sqlite3')
const path = require('path')
const bodyParser = require('body-parser')

const dbPath = 'app/db/database.sqlite3'

// リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// publicディレクトリを静的ファイル群のルートディレクトリとして設定
app.use(express.static(path.join(__dirname, 'public')))

// Get all users
app.get('/api/v1/users', (req, res) => {
    // Connect database
    const db = new sqlite3.Database(dbPath)

    db.all('SELECT * FROM users', (err, rows) => {
        res.json(rows)
    })

    db.close()
})

// Get a user
app.get('/api/v1/users/:id', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
        if (!row) {
            res.status(404).send({error: 'Not found.'})
        } else {
            res.status(200).json(row)
        }
    })

    db.close()
})

// Get following users
app.get('/api/v1/users/:id/following', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    db.all(
        `SELECT * FROM following LEFT JOIN users ON following.followed_id = users.id WHERE following_id = ${id}`,
        (err, rows) => {
            if (!rows) {
                res.status(404).send({error: 'Not found.'})
            } else {
                res.status(200).json(rows)
            }
        })

    db.close()
})

// Get followed users
app.get('/api/v1/users/:id/followers', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    db.all(
        `SELECT * FROM following LEFT JOIN users ON following.following_id = users.id WHERE followed_id = ${id}`,
        (err, rows) => {
            if (!rows) {
                res.status(404).send({error: 'Not found.'})
            } else {
                res.status(200).json(rows)
            }
        })

    db.close()
})

// Get following user info
app.get('/api/v1/users/:following_id/following/:followed_id', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const following_id = req.params.following_id
    const followed_id = req.params.followed_id

    db.get(`SELECT * FROM following WHERE following_id = ${following_id} AND followed_id = ${followed_id}`, (err, row) => {
        if (!row) {
            res.status(404).send({error: 'No follow relationship.'})
        } else {
            db.get(`SELECT * FROM users WHERE id = ${followed_id}`, (err, row) => {
                if (!row) {
                    res.status(404).send({error: 'Not found followed user.'})
                } else {
                    res.status(200).json(row)
                }
            })
        }
    })

    db.close()
})

// Get follower info
app.get('/api/v1/users/:followed_id/followed/:following_id', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const following_id = req.params.following_id
    const followed_id = req.params.followed_id

    db.get(`SELECT * FROM following WHERE following_id = ${following_id} AND followed_id = ${followed_id}`, (err, row) => {
        if (!row) {
            res.status(404).send({error: 'No follow relationship.'})
        } else {
            db.get(`SELECT * FROM users WHERE id = ${following_id}`, (err, row) => {
                if (!row) {
                    res.status(404).send({error: 'Not found follower user.'})
                } else {
                    res.status(200).json(row)
                }
            })
        }
    })

    db.close()
})

// Search users matching keyword
app.get('/api/v1/search', (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const keyword = req.query.q

    db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
        res.json(rows)
    })

    db.close()
})

const run = async (sql, db) => {
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) {
                return reject(err)
            } else {
                return resolve()
            }
        })
    })
}

// Create a new user
app.post('/api/v1/users', async (req, res) => {
    if (!req.body.name || req.body.name === '') {
        res.status(400).send({error: 'ユーザー名が指定されていません'})
    } else {
        const db = new sqlite3.Database(dbPath)
        const name = req.body.name
        const profile = req.body.profile ? req.body.profile : ''
        const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : ''

        try {
            await run(`INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dateOfBirth}")`, db)
            res.status(201).send({message: '新規ユーザーを作成しました'})
        } catch (e) {
            res.status(500).send({error: e})
        }
        db.close()
    }
})

// Create a new follow relationship
app.post('/api/v1/users/:following_id/following/:followed_id', async (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const following_id = req.params.following_id
    const followed_id = req.params.followed_id

    await db.get(`SELECT * FROM following WHERE following_id = ${following_id} AND followed_id = ${followed_id}`, async (err, row) => {
        if (row) {
            res.status(409).send({error: 'relationship already exists.'})
        } else {
            try {
                await run(`INSERT INTO following (following_id, followed_id) VALUES ("${following_id}", "${followed_id}")`, db)
                res.status(201).send({message: '新規フォローを作成しました'})
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    })
    db.close()
})

// Update user data
app.put('/api/v1/users/:id', async (req, res) => {
    if (!req.body.name || req.body.name === '') {
        res.status(400).send({error: 'ユーザー名が指定されていません'})
    } else {
        const db = new sqlite3.Database(dbPath)
        const id = req.params.id

        // 現在のユーザー情報を取得する
        db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
            if (!row) {
                res.status(404).send({error: '指定されたユーザーが見つかりません'})
            } else {
                const name = req.body.name ? req.body.name : row.name
                const profile = req.body.profile ? req.body.profile : row.profile
                const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth

                try {
                    await run(
                        `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dateOfBirth}" WHERE id=${id}`,
                        db
                    )
                    res.status(200).send({message: 'ユーザー情報を更新しました'})
                } catch (e) {
                    res.status(500).send({error: e})
                }
            }
        })
    }

    db.close()
})

// Delete user
app.delete('/api/v1/users/:id', async (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    // 現在のユーザー情報を取得する
    db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
        if (!row) {
            res.status(404).send({error: '指定されたユーザーが見つかりません'})
        } else {
            try {
                await run(`DELETE FROM users WHERE id=${id}`, db)
                res.status(200).send({message: 'ユーザーを削除しました'})
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    })

    db.close()
})

// Delete following
app.delete('/api/v1/users/:following_id/following/:followed_id', async (req, res) => {
    const db = new sqlite3.Database(dbPath)
    const following_id = req.params.following_id
    const followed_id = req.params.followed_id

    db.get(`SELECT * FROM following WHERE following_id = ${following_id} AND followed_id = ${followed_id}`, async (err, row) => {
        if (!row) {
            res.status(404).send({error: 'Not found following.'})
        } else {
            try {
                await run(`DELETE FROM following WHERE following_id = ${following_id} AND followed_id = ${followed_id}`, db)
                res.status(200).send({message: 'delete following.'})
            } catch (e) {
                res.status(500).send({error: e})
            }
        }
    })

    db.close()
})

const port = process.env.PORT || 3000
app.listen(port)
console.log("Listen on port: " + port)
