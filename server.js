const express = require('express');

const app = express();
app.use(express.json());

const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const LightbarSet = require("./set");
let l = new LightbarSet();

app.post('/power', (req, res) => {
    console.log("power request", req.body);
    l.turnOn(req.body.left, req.body.right).then(() => {
        res.send({
            success: true
        });
    }).catch(e => {
        res.send({
            success: false,
            error: e
        });
    });
})

app.post('/color', (req, res) => {
    if (!req.body) return res.send({
        success: false,
        error: "Invalid request"
    });

    if (req.body.left && Array.isArray(req.body.left)) {
        req.body.left.forEach(segment => {
            l.left.setRGB(segment.index, segment.r, segment.g, segment.b);
        });
    }

    if (req.body.right && Array.isArray(req.body.right)) {
        req.body.right.forEach(segment => {
            l.right.setRGB(segment.index, segment.r, segment.g, segment.b);
        });
    }

    l.saveColor().then(() => {
        res.send({
            success: true
        });
    }).catch(e => {
        res.send({
            success: false,
            error: e
        });
    });
})