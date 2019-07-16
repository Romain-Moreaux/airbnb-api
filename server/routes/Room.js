const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

const models = require("../schemas.js");
const rest = require("../assets/Rest.js");

const Room = models.room;

/*
    Create room
    @params `req: {Object}`
*/
router.post("/room/publish", async (req, res) => {
  try {
    const room = await Room.findOne({ title: req.body.title });
    if (!!room) {
      rest.sendError(res, "Room already exist");
    } else {
      const newRoom = new Room({
        title: req.body.title,
        description: req.body.description,
        photos: req.body.photos,
        price: req.body.price,
        city: req.body.city,
        loc: req.body.loc
      });
      await newRoom.save();
      res.json({ message: "Room created", newRoom });
    }
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

/* 
    Get all rooms
    @params `req: {Object}`
*/

router.get("/rooms", async (req, res) => {
  try {
    let isParams = rest.isQueryParams(req);
    let reqResult;
    if (isParams) {
      let city = new RegExp(`^${req.query.city}`);
      let priceMin = Number(req.query.priceMin);
      let priceMax = Number(req.query.priceMax);
      let sort = req.query.sort;
      let currentPage = Number(req.query.page);
      let itemPerPage = 250;
      let offset = 0;
      let options = [];

      // filter Pagination
      if (currentPage) {
        itemPerPage = 2;
        offset = currentPage * itemPerPage - itemPerPage;
      }
      // filter `city`
      if (city)
        options.push({
          $match: { city: { $regex: city, $options: "i" } }
        });

      // filter `Prices`
      if (priceMin && priceMax)
        options.push({ $match: { price: { $gte: priceMin, $lte: priceMax } } });
      else if (priceMin && !priceMax)
        options.push({ $match: { price: { $gte: priceMin } } });
      else if (!priceMin && priceMax)
        options.push({ $match: { price: { $lte: priceMax } } });

      // filter `Sort`
      if (sort === "price-asc") options.push({ $sort: { price: 1 } });
      else if (sort === "price-desc") options.push({ $sort: { price: -1 } });

      options.push({
        $facet: {
          metadata: [
            { $count: "total result(s)" },
            { $addFields: { "current page": currentPage } },
            { $addFields: { "Item(s) per page": itemPerPage } }
          ],
          rooms: [{ $skip: offset }, { $limit: itemPerPage }]
        }
      });
      // console.dir(options, { depth: null });

      reqResult = await Room.aggregate(options);
    } else reqResult = await Room.find();

    res.json(reqResult);
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

// Get room by id
// @param `req: {Object}`
router.get("/room/get/:id", async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    res.json({ room: room });
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

// **Update**
router.post("/room/update", async (req, res) => {});

// **Delete**
router.get("/room/delete/:id", async (req, res) => {
  try {
    await Room.deleteOne({ _id: req.params.id });
  } catch (error) {
    rest.sendError(res, error.message);
  }
});

module.exports = router;
