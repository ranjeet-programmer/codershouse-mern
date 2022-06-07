const RoomService = require("../services/room-service");
const RoomDto = require("../dtos/room-dto");

class RoomsController {
  async create(req, res) {
    // room creation logic

    const { topic, roomType } = req.body;

    if (!topic || !roomType) {
      return res.status(400).json({
        message: "Please provide topic and roomType",
      });
    }

    const room = await RoomService.create({
      topic,
      roomType,
      ownerId: req.user._id,
    });

    return res.json(new RoomDto(room));
  }

  async index(req, res) {
    const rooms = await RoomService.getAllRooms(["open"]);
    const allRooms = rooms.map((room) => new RoomDto(room));
    return res.json(allRooms);
  }
}

module.exports = new RoomsController();
