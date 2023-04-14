const express = require("express");
const multer = require("multer");
const app = express();
const AWS = require("aws-sdk");
const basicAuth = require("basic-auth");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const winston = require("winston");
const StatsD = require("hot-shots");
require("dotenv").config();

const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const { STATUS_CODES } = require("http");

const upload = multer({ dest: "uploads/" });
const salt = 12;

app.use(bodyParser.json());

const port = process.env.PORT || 8080;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "cloudWatchAgent.log" }),
  ],
});

const statsd = new StatsD({
  host: "localhost",
  port: 8125,
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOSTNAME,
    dialect: "mysql",
  }
);

const User = sequelize.define("USERS", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  account_created: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  account_updated: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Product = sequelize.define("PRODUCTS", {
  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sku: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  manufacturer: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  date_added: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date_last_updated: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  owner_user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

const Image = sequelize.define("IMAGES", {
  image_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  file_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date_created: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  s3_bucket_path: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize.sync();

const auth = async (req, res, next) => {
  const user = basicAuth(req);
  const id = req.params.userId;

  if (!user || !user.name || !user.pass) {
    logger.info('FORBIDDEN ACCESS');
    return res.status(403).send({
      message: "Basic authentication required",
    });
  }

  const u = await User.findByPk(id);
  if (!u) {
    logger.info('UNAUTHORIZED ACCESS');
    res.status(401).send({
      message: "User not found",
    });
  } else {
    if (u.username == user.name) {
      const hash = u.password;
      console.log(hash);

      bcrypt.compare(user.pass, hash, function (err, result) {
        if (result === true) {
          return next();
        } else {
          logger.info('UNAUTHORIZED ACCESS');
          return res.status(401).send({
            message: "Incorrect password",
          });
        }
      });
    } else {
      logger.info('UNAUTHORIZED ACCESS');
      res.status(401).send({
        message: "User not found",
      });
    }
  }
};

const auth1 = async (req, res, next) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    logger.info('FORBIDDEN ACCESS');
    return res.status(403).send({
      message: "Basic authentication required",
    });
  }

  const u1 = await User.findOne({
    where: { username: user.name },
  });
  if (!u1) {
    logger.info('UNAUTHORIZED ACCESS');
    res.status(401).send({
      message: "User not found",
    });
  } else {
    const hash = u1.password;
    console.log(hash);

    bcrypt.compare(user.pass, hash, function (err, result) {
      if (result === true) {
        return next();
      } else {
        logger.info('UNAUTHORIZED ACCESS');
        return res.status(401).send({
          message: "Incorrect password",
        });
      }
    });
  }
};

const auth2 = async (req, res, next) => {
  const user = basicAuth(req);
  const id = req.params.productId;

  if (!user || !user.name || !user.pass) {
    logger.info('FORBIDDEN ACCESS');
    return res.status(403).send({
      message: "Basic authentication required",
    });
  }

  const prod1 = await Product.findByPk(id);
  if (!prod1) {
    logger.info('UNAUTHORIZED ACCESS');
    res.status(401).send({
      message: "Product not found",
    });
  } else {
    const prod2 = await User.findByPk(prod1.owner_user_id);
    if (!prod2) {
      logger.info('UNAUTHORIZED ACCESS');
      res.status(401).send({
        message: "INVALID USER CREDENTIALS",
      });
    } else {
      if (prod2.username == user.name) {
        const hash = prod2.password;
        console.log(hash);

        bcrypt.compare(user.pass, hash, function (err, result) {
          if (result === true) {
            return next();
          } else {
            logger.info('UNAUTHORIZED ACCESS');
            return res.status(401).send({
              message: "INVALID USER CREDENTIALS",
            });
          }
        });
      } else {
        logger.info('UNAUTHORIZED ACCESS');
        res.status(401).send({
          message: "INVALID USER CREDENTIALS",
        });
      }
    }
  }
};

const auth3 = async (req, res, next) => {
  const user = basicAuth(req);
  const id = req.params.product_id;

  if (!user || !user.name || !user.pass) {
    logger.info('FORBIDDEN ACCESS');
    return res.status(403).send({
      message: "Basic authentication required",
    });
  }

  const prod1 = await Product.findByPk(id);
  if (!prod1) {
    logger.info('UNAUTHORIZED ACCESS');
    res.status(401).send({
      message: "Product not found",
    });
  } else {
    const prod2 = await User.findByPk(prod1.owner_user_id);
    if (!prod2) {
      logger.info('UNAUTHORIZED ACCESS');
      res.status(401).send({
        message: "INVALID USER CREDENTIALS",
      });
    } else {
      if (prod2.username == user.name) {
        const hash = prod2.password;
        console.log(hash);

        bcrypt.compare(user.pass, hash, function (err, result) {
          if (result === true) {
            return next();
          } else {
            logger.info('UNAUTHORIZED ACCESS');
            return res.status(401).send({
              message: "INVALID USER CREDENTIALS",
            });
          }
        });
      } else {
        logger.info('UNAUTHORIZED ACCESS');
        res.status(401).send({
          message: "INVALID USER CREDENTIALS",
        });
      }
    }
  }
};

app.post("/v1/user", async (req, res) => {
  statsd.increment("api.createUser.api");
  var username = JSON.stringify(req.body.username);
  var password = req.body.password;
  const now = new Date();

  const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (re.test(req.body.username)) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    bcrypt.compare(password, hashedPass, function (err, result) {
      if (err) {
        logger.info('HASHING ERROR');
      }
    });

    const user = await User.findOne({
      where: { username: req.body.username },
    });

    if (!user) {
      const users = await User.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hashedPass,
        account_created: now.toString(),
        account_updated: now.toString(),
      });
      if (!users) {
        logger.info('ERROR WHILE CREATING USER');
        res.status(400).send();
      } else {
        const user1 = await User.findByPk(users.id, {
          attributes: [
            "id",
            "first_name",
            "last_name",
            "username",
            "account_created",
            "account_updated",
          ],
        });

        if (!user1) {
          logger.info('USER NOT FOUND');
          res.status(400).send({ message: "USER NOT FOUND" });
        }

        logger.info('USER CREATED SUCCESSFULLY');
        res.json(user1);
      }
    } else {
      logger.info('USERNAME ALREADY EXISTS');
      res.status(400).send({ message: "Username Already Exists..!!" });
    }
  } else {
    logger.info('INVALID USERNAME');
    res.status(400).send({ message: "INVALID EMAIL ID...!!!!" });
  }
});

app.get("/healthz", (req, res) => {
  logger.info('HEALTH CHECK');
  statsd.increment("api.healthz.api");
  res.status(200).json({ status: "OK" });
});

app.get("/v1/user/:userId", auth, async (req, res) => {
  statsd.increment("api.getUser.api");
  const userId = req.params.userId;

  const user = await User.findByPk(userId, {
    attributes: [
      "id",
      "first_name",
      "last_name",
      "username",
      "account_created",
      "account_updated",
    ],
  });

  if (!user) {
    logger.info('USER NOT FOUND');
    res.status(400).send({ message: "USER NOT FOUND" });
  } else {
    logger.info('USER INFORMATION RETRIEVED SUCCESSFULLY');
    res.json(user);
  }
});

app.put("/v1/user/:userId", auth, async (req, res) => {
  statsd.increment("api.updateUser.api");
  const user = req.body;

  const now = new Date();

  const user1 = await User.findByPk(req.params.userId);

  if (!user1) {
    logger.info('USER NOT FOUND');
    res.status(400).send({ message: "USER NOT FOUND" });
  } else {
    if (user1.username != user.username) {
      logger.info('USERNAME IS INVALID');
      res.status(400).send({ message: "Please provide Valid Username" });
    } else {
      if (user.first_name != null) {
        const u2 = User.update(
          {
            first_name: req.body.first_name,
            account_updated: now.toString(),
          },
          {
            where: { id: req.params.userId },
          }
        );
      }
      if (user.last_name != null) {
        const u3 = User.update(
          {
            last_name: req.body.last_name,
            account_updated: now.toString(),
          },
          {
            where: { id: req.params.userId },
          }
        );
      }
      if (user.password != null) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        bcrypt.compare(req.body.password, hashedPass, function (err, result) {
          if (err) {
            logger.info('HASHING ERROR');
            console.log(err);
          }
        });
        const u2 = User.update(
          {
            password: hashedPass,
            account_updated: now.toString(),
          },
          {
            where: { id: req.params.userId },
          }
        );
      }
      logger.info('USER INFORMATION UPDATED SUCCESSFULLY');
      res.status(204).send({ message: "USER UPDATED" });
    }
  }
});

app.get("/v1/product/:productId", async (req, res) => {
  statsd.increment("api.getProduct.api");
  const prodId = req.params.productId;

  const product = await Product.findByPk(prodId, {
    attributes: [
      "product_id",
      "name",
      "description",
      "sku",
      "manufacturer",
      "quantity",
      "date_added",
      "date_last_updated",
      "owner_user_id",
    ],
  });
  if (!product) {
    logger.info('PRODUCT NOT FOUND');
    res.status(400).send({ message: "Product NOT FOUND" });
  } else {
    logger.info('PRODUCT INFORMATION RETRIEVED SUCCESSFULLY');
    res.json(product);
  }
});

app.post("/v1/product", auth1, async (req, res) => {
  statsd.increment("api.createProduct.api");
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();

  if (!user.name || !user.pass) {
    logger.info('FORBIDDEN ACCESS');
    res.sendStatus(403);
  } else {
    const user1 = await User.findOne({
      where: { username: user.name },
    });

    if (!user1) {
      logger.info('UNAUTHORIZED ACCESS');
      res.status(401).send();
    } else {
      if (
        prod.name == "" ||
        prod.description == "" ||
        prod.sku == "" ||
        prod.manufacturer == "" ||
        prod.quantity == ""
      ) {
        logger.info('INVALID PRODUCT INFORMATION');
        res.status(400).send();
      } else {
        const prod1 = await Product.findOne({
          where: { sku: prod.sku },
        });

        if (prod1) {
          logger.info('SKU ALREADY EXISTS');
          res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
        } else {
          if (
            prod.quantity < 0 ||
            prod.quantity > 100 ||
            prod.quantity % 1 != 0 ||
            typeof prod.quantity != "number"
          ) {
            logger.info('INVALID QUANTITY INFORMATION');
            res.status(400).send({ message: "PLEASE PROVIDE VALID QUANTITY" });
          } else {
            const prod2 = await Product.create({
              name: prod.name,
              description: prod.description,
              sku: prod.sku,
              manufacturer: prod.manufacturer,
              quantity: prod.quantity,
              date_added: now.toString(),
              date_last_updated: now.toString(),
              owner_user_id: user1.id,
            });
            if (!prod2) {
              logger.info('ERROR WHILE CREATING PRODUCT');
              res.status(400).send();
            } else {
              const product1 = await Product.findByPk(prod2.product_id, {
                attributes: [
                  "product_id",
                  "name",
                  "description",
                  "sku",
                  "manufacturer",
                  "quantity",
                  "date_added",
                  "date_last_updated",
                  "owner_user_id",
                ],
              });
              if (!product1) {
                logger.info('PRODUCT NOT FOUND');
                res.status(400).send({ message: "Product NOT FOUND" });
              } else {
                logger.info('PRODUCT CREATED SUCCESSFULLY');
                res.json(product1);
              }
            }
          }
        }
      }
    }
  }
});

app.put("/v1/product/:productId", auth2, async (req, res) => {
  statsd.increment("api.updateProduct.api");
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();

  const prod3 = await Product.findByPk(req.params.productId);

  const prod1 = await Product.findOne({
    where: {
      sku: prod.sku,
    },
  });

  if (prod1) {
    logger.info('SKU ALREADY EXISTS');
    res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
  } else {
    if (
      prod.quantity < 0 ||
      prod.quantity > 100 ||
      prod.quantity % 1 != 0 ||
      typeof prod.quantity != "number"
    ) {
      logger.info('INVALID QUANTITY INFORMATION');
      res.status(400).send({ message: "PLEASE PROVIDE VALID QUANTITY" });
    } else {
      if (prod.name != null) {
        const p1 = await Product.update(
          {
            name: prod.name,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.description != null) {
        const p2 = await Product.update(
          {
            description: prod.description,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }

      if (prod.sku != null) {
        const p3 = await Product.update(
          {
            sku: prod.sku,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.manufacturer != null) {
        const p4 = await Product.update(
          {
            manufacturer: prod.manufacturer,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.quantity != null) {
        const p5 = await Product.update(
          {
            quantity: prod.quantity,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      logger.info('PRODUCT INFORMATION UPDATED SUCCESSFULLY');
      res.status(204).send({ message: "PRODUCT UPDATED" });
    }
  }
});

app.patch("/v1/product/:productId", auth2, async (req, res) => {
  statsd.increment("api.patchProduct.api");
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();

  const prod1 = await Product.findOne({
    where: {
      sku: prod.sku,
    },
  });
  if (prod1) {
    logger.info('SKU ALREADY EXISTS');
    res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
  } else {
    if (
      prod.quantity < 0 ||
      prod.quantity > 100 ||
      prod.quantity % 1 != 0 ||
      typeof prod.quantity != "number"
    ) {
      logger.info('INVALID QUANTITY INFORMATION');
      res.status(400).send({ message: "PLEASE PROVIDE VALID QUANTITY" });
    } else {
      if (prod.name != null) {
        const p1 = await Product.update(
          {
            name: prod.name,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.description != null) {
        const p2 = await Product.update(
          {
            description: prod.description,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }

      if (prod.sku != null) {
        const p3 = await Product.update(
          {
            sku: prod.sku,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.manufacturer != null) {
        const p4 = await Product.update(
          {
            manufacturer: prod.manufacturer,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      if (prod.quantity != null) {
        const p5 = await Product.update(
          {
            quantity: prod.quantity,
            date_last_updated: now.toString(),
          },
          {
            where: { product_id: req.params.productId },
          }
        );
      }
      logger.info('PRODUCT INFORMATION UPDATED SUCCESSFULLY');
      res.status(204).send({ message: "PRODUCT UPDATED" });
    }
  }
});

app.delete("/v1/product/:productId", auth2, async (req, res) => {
  statsd.increment("api.deleteProduct.api");
  const product = await Product.destroy({
    where: {
      product_id: req.params.productId,
    },
  });
  logger.info('PRODUCT DELETED SUCCESSFULLY');
  res.status(204).send({ message: "PRODUCT DELETED" });
});

const s3 = new AWS.S3();

function addRandomString(str, length) {
  const randomString = crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
  return randomString + str;
}
app.post(
  "/v1/product/:product_id/image",
  auth3,
  upload.single("image"),
  async (req, res) => {
    statsd.increment("api.createImage.api");
    if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      logger.info('ONLY IMAGES ARE ALLOWED');
      res.status(400).send({
        message: "Only image files are allowed...!!",
      });
    } else {
      const id = req.params.product_id;
      const now = new Date();

      const prod1 = await Product.findByPk(id);
      if (!prod1) {
        logger.info('PRODUCT NOT FOUND');
        res.status(400).send({
          message: "Product not Found",
        });
      } else {
        try {
          const { originalname, mimetype, size, path } = req.file;
          const randomString = addRandomString(originalname, 4);
          const s3Object = {
            Bucket: process.env.Bucket,
            Key: `user${prod1.owner_user_id}/product${id}/${randomString}`,
            Body: require("fs").createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
          };

          const response = await s3.upload(s3Object).promise();
          s3.deleteObject;
          const image = await Image.create({
            file_name: randomString,
            product_id: id,
            date_created: now.toString(),
            s3_bucket_path: response.Location,
          });

          if (!image) {
            logger.info('ERROR WHILE CREATING IMAGE');
            res.status(400).send();
          } else {
            const image1 = await Image.findByPk(image.image_id, {
              attributes: [
                "image_id",
                "product_id",
                "file_name",
                "date_created",
                "s3_bucket_path",
              ],
            });
            if (!image1) {
              logger.info('IMAGE NOT FOUND');
              res.status(400).send({ message: "image NOT FOUND" });
            } else {
              logger.info('IMAGE CREATED SUCCESSFULLY');
              res.json(image1);
            }
          }
        } catch (err) {
          logger.info('ERROR WHILE UPLOADING A IMAGE');
          res.status(400).send({ message: "Error while uploading a Image" });
        }
      }
    }
  }
);

app.get("/v1/product/:product_id/image", auth3, async (req, res) => {
  statsd.increment("api.getAllImage.api");
  const product_id = req.params.product_id;
  const image = await Image.findAll(
    {
      where: { product_id },
    },
    {
      attributes: [
        "image_id",
        "product_id",
        "file_name",
        "date_created",
        "s3_bucket_path",
      ],
    }
  );
  if (!image) {
    logger.info('PRODUCT NOT FOUND');
    res.status(400).send({ message: "PRODUCT NOT FOUND" });
  } else {
    logger.info('IMAGES INFORMATION RETRIEVED SUCCESSFULLY');
    res.json(image);
  }
});

app.get("/v1/product/:product_id/image/:image_id", auth3, async (req, res) => {
  statsd.increment("api.getImage.api");
  const image_id = req.params.image_id;
  const product_id = req.params.product_id;

  const image = await Image.findOne(
    {
      where: { image_id, product_id },
    },
    {
      attributes: [
        "image_id",
        "product_id",
        "file_name",
        "date_created",
        "s3_bucket_path",
      ],
    }
  );
  if (!image) {
    logger.info('IMAGE NOT FOUND');
    res.status(400).send({ message: "IMAGE NOT FOUND" });
  } else {
    logger.info('IMAGE INFORMATION RETRIEVED SUCCESSFULLY');
    res.json(image);
  }
});

app.delete(
  "/v1/product/:product_id/image/:image_id",
  auth3,
  async (req, res) => {
    statsd.increment("api.deleteImage.api");
    const image_id = req.params.image_id;
    const product_id = req.params.product_id;

    const prod1 = await Product.findByPk(product_id);
    if (!prod1) {
      logger.info('PRODUCT NOT FOUND');
      res.status(400).send({
        message: "Product not Found",
      });
    } else {
      try {
        const image = await Image.findOne({
          where: { image_id, product_id },
        });

        if (!image) {
          logger.info('IMAGE NOT FOUND');
          res.status(400).send({ message: "Image not found" });
        } else {
          const s3Object = {
            Bucket: process.env.Bucket,
            Key: `user${prod1.owner_user_id}/product${product_id}/${image.file_name}`,
          };

          await s3.deleteObject(s3Object).promise();
          await image.destroy();
          logger.info('IMAGE DELETED SUCCESSFULLY');
          res.status(204).send();
        }
      } catch (err) {
        logger.info('FAILED TO DELETE IMAGE');
        res.status(400).json({ error: "Failed to delete image" });
      }
    }
  }
);

const server = app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

module.exports = server;
