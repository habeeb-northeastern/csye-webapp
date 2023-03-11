const express = require("express");
const app = express();
const basicAuth = require("basic-auth");
const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

const salt = 12;

app.use(bodyParser.json());


const port = process.env.PORT || 8080;




const sequelize = new Sequelize("user_db", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

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

sequelize.sync();



const auth = async (req, res, next) => {
  const user = basicAuth(req);
  const id = req.params.userId;

  if (!user || !user.name || !user.pass) {
    return res.status(403).send({
      success: false,
      message: "Basic authentication required",
    });
  }

  const u = await User.findByPk(id);
  if (!u) {
    res.status(401).send({
      success: false,
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
          return res.status(401).send({
            success: false,
            message: "Incorrect password",
          });
        }
      });
    } else {
      res.status(401).send({
        success: false,
        message: "User not found",
      });
    }
  }
};

const auth1 = async (req, res, next) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return res.status(403).send({
      success: false,
      message: "Basic authentication required",
    });
  }

  const u1 = await User.findOne({
    where: { username: user.name },
  });
  if (!u1) {
    res.status(401).send({
      success: false,
      message: "User not found",
    });
  } else {
    const hash = u1.password;
    console.log(hash);

    bcrypt.compare(user.pass, hash, function (err, result) {
      if (result === true) {
        return next();
      } else {
        return res.status(401).send({
          success: false,
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
    return res.status(403).send({
      success: false,
      message: "Basic authentication required",
    });
  }

  const prod1 = await Product.findByPk(id);
  if (!prod1) {
    res.status(401).send({
      success: false,
      message: "User not found",
    });
  } else {
    const prod2 = await User.findByPk(prod1.owner_user_id);
    if (!prod2) {
      res.status(401).send({
        success: false,
        message: "User not found",
      });
    } else {
      if (prod2.username == user.name) {
        const hash = prod2.password;
        console.log(hash);

        bcrypt.compare(user.pass, hash, function (err, result) {
          if (result === true) {
            return next();
          } else {
            return res.status(401).send({
              success: false,
              message: "Incorrect password",
            });
          }
        });
      } else {
        res.status(401).send({
          success: false,
          message: "User not found",
        });
      }
    }
  }

};

app.post("/v1/user", async (req, res) => {
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
          res.status(400).send({ message: "USER NOT FOUND" });
        }
        res.json(user1);
      }
    } else {
      res.status(400).send({ message: "Username Already Exists..!!" });
    }
  } else {
    res.status(400).send({ message: "INVALID EMAIL ID...!!!!" });
  }
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get("/v1/user/:userId", auth, async (req, res) => {
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
    res.status(400).send({ message: "USER NOT FOUND" });
  }
  res.json(user);
});

app.put("/v1/user/:userId", auth, async (req, res) => {
  const user = req.body;

  const now = new Date();

  const user1 = await User.findByPk(req.params.userId);

  if (!user1) {
    res.status(400).send({ message: "USER NOT FOUND" });
  } else {
    if (user1.username != user.username) {
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
      res.status(204).send({message:"USER UPDATED"});
    }
  }
});

app.get("/v1/product/:productId", async (req, res) => {
  const prodId = req.params.productId;

    const product = await Product.findByPk(prodId,{
      attributes:[
        "product_id",
        "name",
        "description",
        "sku",
        "manufacturer",
        "quantity",
        "date_added",
        "date_last_updated",
        "owner_user_id"
      ]
    });
    if (!product) {
      res.status(400).send({ message: "Product NOT FOUND" });
    } else {
      res.json(product);
    }

});

app.post("/v1/product", auth1, async (req, res) => {
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();

  if (!user.name || !user.pass) {
    res.sendStatus(403);
  } else {
    const user1 = await User.findOne({
      where: { username: user.name },
    });

    if (!user1) {
      res.status(401).send();
    } else {
      if (
        prod.name == "" ||
        prod.description == "" ||
        prod.sku == "" ||
        prod.manufacturer == "" ||
        prod.quantity == ""
      ) {
        res.status(400).send();
      } else {
        const prod1 = await Product.findOne({
          where: { sku: prod.sku },
        });

        if (prod1) {
          res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
        } else {
          if (
            prod.quantity < 0 || prod.quantity > 100 ||
            prod.quantity % 1 != 0 ||
            typeof prod.quantity != "number"
          ) {
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
              res.status(400).send();
            } else {

              const product1 = await Product.findByPk(prod2.product_id,{
                attributes:[
                  "product_id",
                  "name",
                  "description",
                  "sku",
                  "manufacturer",
                  "quantity",
                  "date_added",
                  "date_last_updated",
                  "owner_user_id"
                ]
              });
              if (!product1) {
                res.status(400).send({ message: "Product NOT FOUND" });
              } else {
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
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();

  const prod3= await Product.findByPk(req.params.productId);




  const prod1 = await Product.findOne({
    where: {
      sku: prod.sku,
    },
  });


  if (prod1) {
    res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
    
  } else {
    if (
      prod.quantity < 0 || prod.quantity > 100 ||
      prod.quantity % 1 != 0 ||
      typeof prod.quantity != "number"
    ) {
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
      res.status(204).send({message:"PRODUCT UPDATED"});
    }
  }


});

app.patch("/v1/product/:productId", auth2, async (req, res) => {
  const prod = req.body;
  const user = basicAuth(req);
  const now = new Date();


  const prod1 = await Product.findOne({
    where: {
      sku: prod.sku,
    },
  });
  if (prod1) {
    res.status(400).send({ message: "PLEASE PROVIDE UNIQUE SKU" });
  } else {
    if (
      prod.quantity < 0 || prod.quantity > 100 ||
      prod.quantity % 1 != 0 ||
      typeof prod.quantity != "number"
    ) {
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
      res.status(204).send({message:"PRODUCT UPDATED"});
    }
  }


});

app.delete("/v1/product/:productId", auth2,async (req, res) => {

const product =await Product.destroy({
  where:{
    product_id: req.params.productId
  }
})
res.status(204).send({message:"PRODUCT DELETED"});

});

const server= app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

module.exports = server;
