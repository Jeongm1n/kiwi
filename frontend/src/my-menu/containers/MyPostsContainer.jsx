import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { Grid, Chip } from '@material-ui/core';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';
import { isMobile } from 'react-device-detect';
import { useStyles } from '../../board/common/styles/board.style';
import { boardCommonStyles } from '../../board/common/styles/board.common.style';
import moment from 'moment';
import { message } from 'antd';
import { GET_MY_POSTS } from '../../configs/queries';

export default function MyPostsContainer() {
    const classes = { ...useStyles(), ...boardCommonStyles() };
    const history = useHistory();
    const [postList, setPostList] = useState([]);
    const { data: postListData, error: postListError } = useQuery(GET_MY_POSTS);

    useEffect(() => {
        if (postListData) {
            setPostList(
                postListData.getMyPosts.map((p) => {
                    return {
                        ...p,
                        updatedAt: new moment(p.updatedAt).format('YYYY-MM-DD HH:mm'),
                    };
                }),
            );
        }
        if (postListError) {
            message.error('게시물을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
            history.push('/');
        }
    }, [postListData, setPostList, postListError, history]);

    return (
        <>
            {postList.map((post, idx) => (
                <Grid
                    container
                    justify="center"
                    spacing={0}
                    alignItems="center"
                    className={classes.content}
                    key={idx}
                >
                    <Grid
                        item
                        xs={12}
                        sm={8}
                        className={classes.title}
                        component={Link}
                        to={`/post/${post.id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        {post.categoryName && (
                            <span className={classes.part}>{post.categoryName}</span>
                        )}
                        {isMobile && <br />}
                        <span style={{ color: 'black' }}>{post.title}</span>
                    </Grid>
                    <Grid item xs={12} sm={2} align="right">
                        <Chip
                            className={classes.backColor}
                            size="small"
                            icon={<ThumbUpOutlinedIcon className={classes.upIcon} />}
                            label={post.likeCount}
                        />
                        <Chip
                            className={classes.backColor}
                            size="small"
                            icon={<ChatBubbleOutlineOutlinedIcon className={classes.commentIcon} />}
                            label={post.commentCount}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} align="right">
                        <Grid>
                            <span style={{ color: '#999', fontSize: '0.75rem' }}>
                                {post.gradeName}
                            </span>
                            <span> {post.authorName}</span>
                        </Grid>
                        {!isMobile && (
                            <Grid className={classes.date}>
                                <span>{post.updatedAt}</span>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            ))}
        </>
    );
}
