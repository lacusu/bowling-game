
# 🎳 Bowling Score Tracker API

## 📌 About
This is a **Bowling Score Tracker API** built with **NestJS** and **MongoDB**. It allows multiple players to play a game, track frames, calculate scores, and get game result.

---

## 🚀 Features
✅ Create and manage bowling games  
✅ Track player scores across frames  
✅ Support for strikes (`X`) and spares (`/`)  
✅ Leaderboard and game results  
✅ Runs with **Docker & MongoDB**  
✅ Supports **server & serverless deployments**

---
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

## Docker
```bash
docker-compose up --build
```
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Deployment Strategy
This project supports two deployment options:
1️⃣ Traditional Server Deployment (EC2 or any on-premise server)
2️⃣ Serverless Deployment on AWS Lambda

## API Endpoints
### 1. Create a New Game
```
curl -X POST http://localhost:3000/games \
-H "Content-Type: application/json" \
-d '{
"name": "Bowling Championship",
"players": ["Hulk", "Wolverine", "Deadpool"]
}'
```
**Response**
```aiignore
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 492
ETag: W/"1ec-ik9SeanV4IsR17ibMP++KWhha1E"
Date: Tue, 11 Mar 2025 22:13:47 GMT
Connection: close

{
  "name": "Bowling Championship",
  "players": [
    {
      "playerName": "Hulk",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b59b08daa92d491f997d",
      "frames": []
    },
    {
      "playerName": "Wolverine",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b59b08daa92d491f997e",
      "frames": []
    },
    {
      "playerName": "Deadpool",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b59b08daa92d491f997f",
      "frames": []
    }
  ],
  "countOfCompleted": 0,
  "completed": false,
  "_id": "67d0b59b08daa92d491f997c",
  "createdAt": "2025-03-11T22:13:47.762Z",
  "updatedAt": "2025-03-11T22:13:47.762Z",
  "__v": 0
}

```

### 2. Create a Game with Duplicate Players
```aiignore
curl -X POST http://localhost:3000/games \
-H "Content-Type: application/json" \
-d '{
   "players": ["Hulk", "Helen", "Wolverine"]
}'

```
**Response**
```aiignore
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 488
ETag: W/"1e8-hAbWDAkyubda0P8GBDCzNlkXttU"
Date: Tue, 11 Mar 2025 22:14:44 GMT
Connection: close

{
  "name": "Legendary Bowl #2811",
  "players": [
    {
      "playerName": "Hulk",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b5d408daa92d491f9982",
      "frames": []
    },
    {
      "playerName": "Hulk",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b5d408daa92d491f9983",
      "frames": []
    },
    {
      "playerName": "Wolverine",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b5d408daa92d491f9984",
      "frames": []
    }
  ],
  "countOfCompleted": 0,
  "completed": false,
  "_id": "67d0b5d408daa92d491f9981",
  "createdAt": "2025-03-11T22:14:44.056Z",
  "updatedAt": "2025-03-11T22:14:44.056Z",
  "__v": 0
}

```
### 3. Add a Frame for a Player
```aiignore
curl -X PATCH http://localhost:3000/games/{gameId}/players/{playerId}/frames \
-H "Content-Type: application/json" \
-d '{
"rolls": ["3","/"]
}'
```
**Response**
```aiignore
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 612
ETag: W/"264-reQUSInBtHjHEWp94UanBhtXcR4"
Date: Tue, 11 Mar 2025 22:15:23 GMT
Connection: close

{
  "_id": "67d0b5d408daa92d491f9981",
  "name": "Legendary Bowl #2811",
  "players": [
    {
      "playerName": "Hulk",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b5d408daa92d491f9982",
      "frames": []
    },
    {
      "playerName": "Hulk",
      "totalScore": 0,
      "onFrame": 0,
      "_id": "67d0b5d408daa92d491f9983",
      "frames": []
    },
    {
      "playerName": "Wolverine",
      "totalScore": 10,
      "onFrame": 1,
      "_id": "67d0b5d408daa92d491f9984",
      "frames": [
        {
          "frameId": 1,
          "rolls": [
            "3",
            "/"
          ],
          "cumulativeScore": 10,
          "dateTime": "2025-03-11T22:15:23.534Z",
          "_id": "67d0b5fb08daa92d491f998a"
        }
      ]
    }
  ],
  "countOfCompleted": 0,
  "completed": false,
  "createdAt": "2025-03-11T22:14:44.056Z",
  "updatedAt": "2025-03-11T22:15:23.536Z",
  "__v": 1
}

```

### 4. Get Game Result
```
curl -X GET http://localhost:3000/games/{gameId}/result

```

**Response**
```aiignore
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 184
ETag: W/"b8-7YcKgB/fjdc/sYa5gBWUOxTJwGA"
Date: Tue, 11 Mar 2025 22:15:47 GMT
Connection: close

{
  "name": "Fierce Arena #3540",
  "players": [
    {
      "rank": 1,
      "playerName": "Hulk",
      "totalScore": 0
    },
    {
      "rank": 1,
      "playerName": "Hulk",
      "totalScore": 0
    },
    {
      "rank": 1,
      "playerName": "Wolverine",
      "totalScore": 0
    }
  ]
}

```
### 5. Get All Games
```aiignore
curl -X GET http://localhost:3000/games

```
**Response**
```aiignore
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 187
ETag: W/"bb-TPUG6TG7JfMzW8SBW1LjFofwBuQ"
Date: Tue, 11 Mar 2025 22:16:14 GMT
Connection: close

{
  "name": "Legendary Bowl #2811",
  "players": [
    {
      "rank": 1,
      "playerName": "Wolverine",
      "totalScore": 10
    },
    {
      "rank": 2,
      "playerName": "Hulk",
      "totalScore": 0
    },
    {
      "rank": 2,
      "playerName": "Hulk",
      "totalScore": 0
    }
  ]
}

```
## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
