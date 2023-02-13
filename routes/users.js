const express = require('express');
const router = express.Router();
const objectId = require('mongoose').Types.ObjectId;


router.get('/', (  req,     res     ) => {
    MangaModel.find((err, docs) => {
        if(!err) res.send(docs);
        else console.log("Could not get data : " + err);
    })
});

router.get('/:id', (req, res) => {
    MangaModel.findById(req.params.id).populate('categoryId').then((data, err) => {
        if(!err) res.send(data);
        else console.log("Could not get data : " + err);
    })
});

router.post('/', (req, res) => {
    const newManga = new MangaModel({
        title: req.body.title,
        year: req.body.year,
        price: req.body.price,
        imgUrl: req.body.imgUrl,
        categoryId: req.body.categoryId
    });

    newManga.save((err, docs) => {
        if(!err) res.send(docs);
        else console.log('Error creating new data : ' + err);
    })
});

router.put('/:id', (req, res) => {
    if(!objectId.isValid(req.params.id))
        return res.status(400).send("ID unknow ! " + req.params.id)

    const updateItem = {
        title: req.body.title,
        year: req.body.year,
        price: req.body.price,
        imgUrl: req.body.imgUrl
    };

    MangaModel.findByIdAndUpdate(
        req.params.id,
        { $set: updateItem },
        { new: true },
        (err, docs) => {
            if(!err) res.send(docs);
            else console.log("Update error : " + err);
        }
    )
});

router.delete('/:id', (req, res) => {
    if(!objectId.isValid(req.params.id))
        return res.status(400).send("ID unknow ! " + req.params.id)

        MangaModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if(!err) res.send(docs);
            else console.log("Delete error : " + err);
        })
});

module.exports = router;