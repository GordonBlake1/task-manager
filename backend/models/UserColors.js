module.exports = (sequelize, DataTypes) => {
  const UserColors = sequelize.define("UserColors", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hex: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  UserColors.associate = function (models) {
    UserColors.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return UserColors;
};
