/**
 * 알림 기능
 * @author 신창우
 */
const models = require('../../models');

// type: POST_COMMENT
const createNotificationPostComment = async (postId, triggerId) => {
    const type = 'POST_COMMENT';
    const { authorId } = await models.post.findOne({
        attributes: ['id', 'authorId'],
        where: { id: postId },
        raw: true,
    });
    if (+authorId === +triggerId) return;

    const data = await models.notification.findOne({
        attributes: ['isDeleted', 'postId', 'type', 'count'],
        where: { postId, type, userId: authorId },
        raw: true,
    });
    if (data) {
        const { isDeleted } = data.isDeleted;

        if (isDeleted === 0) {
            return await models.notification.update(
                {
                    count: data.count + 1,
                },
                { where: { userId: authorId, postId, type } },
            );
        } else {
            return await models.notification.update(
                {
                    count: data.count + 1,
                    isDeleted: 0,
                },
                { where: { userId: authorId, postId, type } },
            );
        }
    } else {
        return models.notification.create({
            userId: authorId,
            postId,
            type,
        });
    }
};

// type: COMMENT_LIKE
const createNotificationCommentLike = async (commentId, triggerId) => {
    const type = 'COMMENT_LIKE';
    const { authorId, postId } = await models.comment.findOne({
        attributes: ['id', 'authorId', 'postId'],
        where: { id: commentId },
        raw: true,
    });
    if (+authorId === +triggerId) return;
    const data = await models.notification.findOne({
        attributes: ['isDeleted', 'postId', 'type', 'count'],
        where: { postId, type, userId: authorId },
        raw: true,
    });
    if (data) {
        const { isDeleted } = data.isDeleted;

        if (isDeleted === 0) {
            return await models.notification.update(
                {
                    count: data.count + 1,
                },
                { where: { userId: authorId, commentId, type } },
            );
        } else {
            return await models.notification.update(
                {
                    count: data.count + 1,
                    isDeleted: 0,
                },
                { where: { userId: authorId, commentId, type } },
            );
        }
    } else {
        return models.notification.create({
            userId: authorId,
            postId,
            commentId,
            type,
        });
    }
};

// type: POST_LIKE
const createNotificationPostLike = async (postId, triggerId) => {
    const type = 'POST_LIKE';
    const { authorId } = await models.post.findOne({
        attributes: ['id', 'authorId'],
        where: { id: postId },
        raw: true,
    });
    if (+authorId === +triggerId) return;
    const data = await models.notification.findOne({
        attributes: ['isDeleted', 'postId', 'type', 'count'],
        where: { postId, type, userId: authorId },
        raw: true,
    });
    if (data) {
        const { isDeleted } = data.isDeleted;

        if (isDeleted === 0) {
            return await models.notification.update(
                {
                    count: data.count + 1,
                },
                { where: { userId: authorId, postId, type } },
            );
        } else {
            return await models.notification.update(
                {
                    count: data.count + 1,
                    isDeleted: 0,
                },
                { where: { userId: authorId, postId, type } },
            );
        }
    } else {
        return models.notification.create({
            userId: authorId,
            postId,
            type,
        });
    }
};
// type: GROUP_INVITED
const createNotificationGroupInvite = async (groupId, memberId) => {
    const type = 'GROUP_INVITED';

    const data = await models.notification.findOne({
        attributes: ['isDeleted', 'groupId', 'type', 'count'],
        where: { groupId, type, userId: memberId },
        raw: true,
    });
    if (data) {
        const { isDeleted } = data.isDeleted;

        if (isDeleted === 0) {
            return await models.notification.update(
                {
                    count: data.count + 1,
                },
                { where: { userId: memberId, groupId, type } },
            );
        } else {
            return await models.notification.update(
                {
                    count: data.count + 1,
                    isDeleted: 0,
                },
                { where: { userId: memberId, groupId, type } },
            );
        }
    } else {
        return models.notification.create({
            userId: memberId,
            groupId,
            type,
        });
    }
};
// type: GROUP_COMMENT
const createNotificationGroupComment = async (groupId, memberId) => {
    const type = 'GROUP_COMMENT';
    const master = await models.groups.findOne({
        attributes: ['masterId'],
        where: { id: groupId },
        raw: true,
    });
    const members = await models.group_member.findAll({
        attributes: ['memberId'],
        where: { groupId },
        raw: true,
    });
    const targets = [master.masterId, ...members.map((member) => member.memberId)].filter(
        (target) => target !== memberId,
    );

    const notificationOfTargets = await models.notification.findAll({
        attributes: ['userId', 'isDeleted', 'groupId', 'type', 'count'],
        where: { groupId, type },
        raw: true,
    });

    const toUpdateCount = []; // NOT에 있고 isDeleted===0 -> count += 1
    const toUpdateCountAndIsDeleted = []; // NOT에 있고 isDeleted===1 -> count += 1, isDeleted 0
    const toCreate = []; // NOT에 없음 -> insert

    targets.forEach((targetUserId) => {
        const targetInNotification = notificationOfTargets.find((t) => t.userId === targetUserId);

        if (targetInNotification) {
            const { isDeleted, count } = targetInNotification;
            if (isDeleted === 0) {
                toUpdateCount.push({
                    userId: targetUserId,
                    count,
                });
            } else {
                toUpdateCountAndIsDeleted.push({
                    userId: targetUserId,
                    count,
                });
            }
        } else toCreate.push({ userId: targetUserId, groupId, type });
    });

    try {
        for (const target of toUpdateCount) {
            const { count, userId } = target;
            await models.notification.update(
                {
                    count: count + 1,
                },
                {
                    where: {
                        userId,
                        groupId,
                        type,
                    },
                },
            );
        }

        for (const target of toUpdateCountAndIsDeleted) {
            const { count, userId } = target;
            await models.notification.update(
                {
                    count: count + 1,
                    isDeleted: 0,
                },
                {
                    where: {
                        userId,
                        groupId,
                        type,
                    },
                },
            );
        }

        if (toCreate.length > 0) {
            await models.notification.bulkCreate(toCreate);
        }
    } catch (err) {
        console.error(err);
    }
};

// type: POST_SPECIAL
const createNotificationPostSpecial = async (postId, departmentId, triggerId) => {
    const type = 'POST_SPECIAL';
    const notificationOfTargets = await models.user
        .findAll({
            attributes: ['id'],
            where: { departmentId },
            raw: true,
        })
        .filter((target) => target.id !== +triggerId);
    await models.notification.bulkCreate(
        notificationOfTargets.map((target) => {
            return {
                userId: target.id,
                postId,
                type,
            };
        }),
    );
};

// type: REPORT_RESULT
const createNotificationReportResult = async (userId, result) => {
    const type = 'REPORT_RESULT';
    await models.notification.create({
        type,
        userId,
        extraResult: result,
    });
};

// type: POST_DELETED
const createNotificationPostDeleted = async (postId, reason) => {
    const type = 'POST_DELETED';
    const { authorId } = await models.post.findOne({
        attributes: ['authorId'],
        raw: true,
        where: {
            id: postId,
        },
    });
    await models.notification.create({
        type,
        userId: authorId,
        postId,
        extraResult: reason,
    });
};

// type: COMMENT_DELETED
const createNotificationCommentDeleted = async (commentId, reason) => {
    const type = 'COMMENT_DELETED';
    const { authorId } = await models.comment.findOne({
        attributes: ['authorId'],
        raw: true,
        where: {
            id: commentId,
        },
    });
    await models.notification.create({
        type,
        userId: authorId,
        commentId,
        extraResult: reason,
    });
};

// type: MAIN_NOTICE
const createNotificationMainNotice = async (content) => {
    const type = 'MAIN_NOTICE';
    const users = await models.user.findAll({
        attributes: [['id', 'userId']],
        raw: true,
        where: {
            status: 1,
        },
    });
    await models.notification.bulkCreate(
        users.map((user) => {
            return {
                ...user,
                extraResult: content,
                type,
            };
        }),
    );
};

module.exports = {
    createNotificationPostComment,
    createNotificationCommentLike,
    createNotificationPostLike,
    createNotificationGroupInvite,
    createNotificationGroupComment,
    createNotificationPostSpecial,
    createNotificationReportResult,
    createNotificationPostDeleted,
    createNotificationCommentDeleted,
    createNotificationMainNotice,
};
