const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const Comment = sequelize.define(
        'comment',
        {
            postId: { type: DataTypes.INTEGER, allowNull: false },
            authorId: { type: DataTypes.INTEGER, allowNull: false },
            content: { type: DataTypes.STRING(100), allowNull: false },
            isDeleted: { type: DataTypes.TINYINT, defaultValue: 0 },
            likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            dislikeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
        },
        {
            freezeTableName: true,
            tableName: 'comment',
        },
    );

    Comment.prototype.dateFormat = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

    Comment.associate = (models) => {
        Comment.belongsTo(models.post, {
            foreignKey: 'postId',
        });
    };

    return Comment;
};
