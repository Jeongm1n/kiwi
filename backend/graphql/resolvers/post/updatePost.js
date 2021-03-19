/**
 * 게시물 Update
 * @author 이건욱
 * @param input PostUpdateInput {
        title: String!
        content: String!
    }
 * updatePost(id: ID!, post: PostUpdateInput!): Boolean
 */

const models = require('../../../models');
const { ConflictError } = require('../../errors/errors');

module.exports = async ({ id, post }, { id: authorId }) => {
    return await models.post
        .update(
            {
                ...post,
            },
            { where: { id, authorId } },
        )
        .then(() => {
            return true;
        })
        .catch(() => {
            throw ConflictError('Update error occured');
        });
};
