const auth = require("../helpers/basic-auth")

const db = require("../models");
const User = db.user;
const Product = db.products;

module.exports = {

  addProduct: async(req, res) => {
    let owner_user_id;
    let currentUserId;
    //authentication
    auth.authenticateCredentials(req.headers.authorization)
      .then((resultObj) => {
          if (resultObj.auth != undefined && resultObj.auth == true) {
              currentUserId = resultObj.cred.username;
              
          fetchCurrentUser(currentUserId).then((user) => {
            owner_user_id = user.id;
            const product = {
              prod_id: Math.floor(Math.random() * 100),
              name: req.body.name,
              description: req.body.description,
              sku: req.body.sku,
              manufacturer: req.body.manufacturer,
              quantity: req.body.quantity,
              owner_user_id: owner_user_id
              };
            Product.create(product)
              .then((createdProd) => {
                res.status(201).send({
                  message: "Product created",
                  data: createdProd.dataValues
              });
              })
              .catch((err) => {
                res.status(400).send({
                    message: "Error:" + err.toString()
                });
              })
      
    })
    }})
    
  },


  getProduct: async (req, res) => {
    isTableNotEmpty(Product).then(() => {
    }).catch((err) => {
      res.status(400).send({
        message: err.toString()
      });
      return;
    })
    Product.findOne({
      subQuery: false,
      where: {
        prod_id: req.params.productId
      },
    })
    .then((data) => {
      res.status(201).send({
        data: data.dataValues
    });
    })
    .catch((err) => {
      res.status(400).send({
        message: err.toString(),
      });
      return;
    });
  },

  putUpdateProduct: async (req, res) => {
      let prod_id = req.params.productId
      let owner_user_id;
    let currentUserId;
        auth.authenticateCredentials(req.headers.authorization)
        .then((resultObj) => {
          if (resultObj.auth != undefined && resultObj.auth == true) {
              currentUserId = resultObj.cred.username;
          }

          fetchCurrentUser(currentUserId).then((user) => {
            owner_user_id = user.id;
            Product.findByPk(prod_id).then((resultObj) => {
              if (resultObj == undefined || resultObj == null) {
                res.status(400).send({
                  message: "Product not found"
                })
              }
              Product.findOne({ where: { sku: req.body.sku }})
              .then((prod) => {
                if(owner_user_id != prod.owner_user_id){
                  throw new Error ("Unauthorized to update product!")
                 } else{
                     Product.update(req.body, { where: { prod_id: req.params.productId },}) 
                     .then((updatedProd) => {
                      res.status(201).send({
                        message: "Success!"
                    });
                     })
                 } 
              })
              
            })  
    })
  })
       
  },
  patchUpdateProduct: async (req, res) => {
    let prod_id = req.params.productId
    let owner_user_id;
  let currentUserId;
      auth.authenticateCredentials(req.headers.authorization)
      .then((resultObj) => {
        if (resultObj.auth != undefined && resultObj.auth == true) {
            currentUserId = resultObj.cred.username;
        }

        fetchCurrentUser(currentUserId).then((user) => {
          owner_user_id = user.id;
          Product.findByPk(prod_id).then((resultObj) => {
            if (resultObj == undefined || resultObj == null) {
              res.status(400).send({
                message: "Product not found"
              })
            }
            Product.findOne({ where: { sku: req.body.sku }})
            .then((prod) => {
              if(owner_user_id != prod.owner_user_id){
                throw new Error ("Unauthorized to update product!")
               } else{
                   Product.update(req.body, { where: { prod_id: req.params.productId },}) 
                   .then((updatedProd) => {
                    res.status(201).send({
                      message: "Success!"
                  });
                   })
               } 
            })
            
          })  
  })
})

  },
  deleteProduct: async (req, res) => {
    let prod_id = req.params.productId
    let currentUserId;
    auth.authenticateCredentials(req.headers.authorization)
    .then((resultObj) => {
        if (resultObj.auth != undefined && resultObj.auth == true) {
            currentUserId = resultObj.cred.username;
            fetchCurrentUser(currentUserId).then((user) => {
              let user_id = user.id;
              Product.findByPk(prod_id).then((resultObj) => { 

                if (resultObj == undefined || resultObj == null) {
                  res.status(400).send({
                    message: "Product not found"
                  })
                }

                if(user_id != resultObj.owner_user_id){
                  throw new Error ("Unauthorized to delete product!")
                 } else{
                     Product.destroy({ where: { prod_id: req.params.productId },}) 
                     .then((deletedProd) => {
                      res.status(200).send({
                        message: "Success!"
                    });
                     })
                 }
              })
    
              Product.findOne({ where: { prod_id: prod_id }})
              .then((prod) => {
 
              })
      })

        }})

  },
}

  async function isTableNotEmpty(Model) {
    const data = await Model.findAll();
    if (data == undefined || data.length == 0) {
      throw new Error("The table is empty!");
    }
  }

  async function fetchCurrentUser(userName) {
    let currUser = await User.findOne({
        where: {
            username: userName
        }
    });
    if (currUser != undefined && currUser != null) {
        return currUser.dataValues;
    } else {
        throw new Error("Unable to find user for given id!");
    }

}