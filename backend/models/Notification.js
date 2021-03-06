const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const Notification = sequelize.define(
        'notification',
        {
            userId: { type: DataTypes.INTEGER, allowNull: false },
            type: { type: DataTypes.STRING(15), allowNull: false },
            postId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
            commentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
            groupId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
            count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            extraResult: { type: DataTypes.STRING(200), allowNull: true },
            isDeleted: { type: DataTypes.TINYINT, defaultValue: 0 },
        },
        {
            freezeTableName: true,
            tableName: 'notification',
        },
    );

    Notification.prototype.dateFormat = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');

    Notification.associate = (models) => {
        Notification.belongsTo(models.user, {
            foreignKey: 'userId',
        });
        Notification.belongsTo(models.post, {
            foreignKey: 'postId',
        });
        Notification.belongsTo(models.comment, {
            foreignKey: 'commentId',
        });
        Notification.belongsTo(models.groups, {
            foreignKey: 'groupId',
        });
    };

    return Notification;
};
