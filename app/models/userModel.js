module.exports = (sequelize, Datatypes) => {
  const User = sequelize.define("user", {
    id: {
      type: Datatypes.INTEGER,
      defaultValue: Datatypes.INTEGER, // Or Datatypes.UUIDV1
      primaryKey: true
      //readOnly: true
    },
    first_name: {
      type: Datatypes.STRING,
      allowNull: false
    },
    last_name: {
      type: Datatypes.STRING,
      allowNull: false
    },
    username: {
      type: Datatypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Datatypes.STRING,
      is: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/i,
      validate: {
        len: [8, 200]
      }
    }
  }, {
    timestamps: true,
    createdAt: 'account_created',
    updatedAt: 'account_updated',
    underscored: true,
  });

  return User;
};