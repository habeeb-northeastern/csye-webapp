const { createUser, getUser, updateUser } = require("./../controllers/userController");
const router = require("express").Router();

router.post("/", createUser);
router.get("/:id", getUser).put("/:id", updateUser);

module.exports = router;