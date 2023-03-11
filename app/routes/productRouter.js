const { addProduct, getProduct, putUpdateProduct, patchUpdateProduct, deleteProduct } = require("./../controllers/productController");
const router = require("express").Router();


router.get("/:productId", getProduct);
router.post("/", addProduct);
router.put("/:productId", putUpdateProduct);
router.patch("/:productId", patchUpdateProduct);
router.delete("/:productId", deleteProduct);

module.exports = router;