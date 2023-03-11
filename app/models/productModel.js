module.exports = (sequelize, Datatypes) => {
  const Product = sequelize.define("products", {
  prod_id: {
      type: Datatypes.INTEGER,
      defaultValue: Datatypes.INTEGER,
      primaryKey: true
  },
  name: {
      type: Datatypes.STRING,
      allowNull: false
  },
  description: {
      type: Datatypes.STRING,
      allowNull: false
  },
  sku: {
      type: Datatypes.STRING,
      primaryKey: true,
      unique: true,
  },
  manufacturer: {
      type: Datatypes.STRING,
      allowNull: false
  },
  quantity: {
      type: Datatypes.UUID,
      allowNull: false,
      validate : {
        min : {
        args: 1,
          msg: "Quantity should be greater than 0"
        },
        max : {
        args: 100,
        msg: "Quantity should be less than 1000"
        }
      }
  },
  owner_user_id: {
      type: Datatypes.INTEGER,
      allowNull: false
  }
  }, {
    timestamps: true,
    createdAt: 'date_added',
    updatedAt: 'date_updated',
    underscored: true,
  });

  return Product;
};