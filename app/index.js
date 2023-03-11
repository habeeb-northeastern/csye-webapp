require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");

//convert user input to JSON
app.use(express.json());

app.use(express.urlencoded( { extended: true }))

const port = process.env.PORT || 8080;

app.get("/healthz", (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date()
  }

  res.status(200).send(data);
});

app.use("/v1/user", userRouter);
app.use("/v1/product", productRouter);


const server = app.listen(port, () => {
  console.log("Server up and running at : ", port);
});

module.exports = server;