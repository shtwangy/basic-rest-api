Simple JSON API with Node.js, Express and sqlite3.

## Global Installs
```
npm install -g node-dev
```
## Connect Database
```
npm run connect
```
Don't forget to create the `app/db` directory the first time.

## Create users table
```
CREATE TABLE users (  
  id INTEGER NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL, 
  profile TEXT, 
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')), 
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')), 
  date_of_birth TEXT
);
```

## Create sample data
`INSERT INTO users (name, profile) VALUES ("B.B.King", "Thrill is gone");`  
`INSERT INTO users (name, profile) VALUES ("Freddie King", "Hideaway");`  
`INSERT INTO users (name, profile) VALUES ("Muddy Waters", "Hoochie Coochie Man");`  
`INSERT INTO users (name, profile) VALUES ("John Lee Hooker", "BOOM BOOM");`  
`INSERT INTO users (name, profile) VALUES ("Clarence Gatemouth Brown", "Okie Dokie Stomp");`  

## Fetch all data from users table
`SELECT * FROM users;`

## curl commands
Get all users: `curl -X GET http://localhost:3000/api/v1/users`  
Get a user by specified id: `curl -X GET http://localhost:3000/api/v1/users/3`  
Search users: `curl -X GET http://localhost:3000/api/v1/search`  

## Create following table
```
CREATE TABLE following (
  id INTEGER NOT NULL PRIMARY KEY,  
  following_id INTEGER NOT NULL,
  followed_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')), 
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  FOREIGN KEY (following_id) references users(id),
  FOREIGN KEY (followed_id) references users(id)
);
```

## Insert sample records into following table
```
INSERT INTO following (following_id, followed_id) values (1,2);
INSERT INTO following (following_id, followed_id) values (1,3);
INSERT INTO following (following_id, followed_id) values (1,4);
INSERT INTO following (following_id, followed_id) values (2,1);
INSERT INTO following (following_id, followed_id) values (2,3);
INSERT INTO following (following_id, followed_id) values (3,4);
INSERT INTO following (following_id, followed_id) values (4,3);
```
