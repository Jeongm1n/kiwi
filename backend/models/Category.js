const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const Category = sequelize.define(
        'category',
        {
            categoryName: { type: DataTypes.STRING(15), allowNull: false, unique: true },
            boardId: { type: DataTypes.INTEGER, allowNull: true },
        },
        {
            freezeTableName: true,
            tableName: 'category',
        },
    );

    Category.prototype.dateFormat = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

    Category.associate = (models) => {
        Category.hasMany(models.post, {
            foreignKey: 'categoryId',
        });
        Category.belongsTo(models.board, {
            foreignKey: 'boardId',
        });
    };

    return Category;
};
