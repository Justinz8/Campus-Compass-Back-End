const express = require('express')
const cors = require('cors')
const http  = require('http')
const admin = require('firebase-admin')
const serviceAccount = require("../secrets/cscc01-79d1d-firebase-adminsdk-fbsvc-e140a87629.json")

const app = express();

const server = http.createServer(app);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const port = 3000;

app.use(express.json());

app.use(cors({ origin: '*' }));

app.use((req, res, next) => {
    switch (req.url) {
        case "/SignUpInit":
            next();
            break;
        default:
            admin.auth().verifyIdToken(req.body.token, true).then((result) => {
                req.body.uid = result.uid;
                next();
            }).catch((error) => {
                next(new Error('Token Error'));
            })
            break;
    }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});

app.post('./TokenCheck', (req, res) => {
    res.send({ success: true })
})

app.post('/SignUpInit', (req, res) => {
        admin.auth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
            disabled: false,
        })
        // .then((response) => {
        //     return db.collection('UserData').doc(response.uid).set({
        //         Email: req.body.Email,
        //         Username: req.body.Username,
        //         Friends: [],
        //         FriendRequests: [],
        //     })
        // })
        .then(() => {
            res.send({ success: true });
        }).catch((error) => {
            res.send({ success: false, error: error });
        });
    });


server.listen(port, () => {
    console.log(`listening on port:${port}`);
});