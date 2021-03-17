import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import QueryString from 'query-string';
import { Button } from '@material-ui/core';
import { Form, Input, message, Modal } from 'antd';
import PageTitle from '../../../common/components/PageTitle';
import SelectCategory from '../components/SelectCategory';
import { useStyles } from '../styles/postWrite.style';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_POST, GET_BOARD } from '../../../configs/queries';
import { FileAddOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { TextArea } = Input;

export default function PostWritePage() {
    const classes = useStyles();
    const { search } = useLocation();
    const history = useHistory();
    const { boardId } = QueryString.parse(search);
    const [board, setBoard] = useState({
        id: null,
        boardName: '',
    });
    const { data: boardData, error: boardError } = useQuery(GET_BOARD, {
        variables: {
            id: boardId,
        },
    });
    const [createPost] = useMutation(CREATE_POST);

    useEffect(() => {
        if (boardData) {
            setBoard(boardData.getBoardById);
        }
        if (boardError) {
            message.error('존재하지 않는 게시판입니다.');
            history.push('/');
        }
    }, [boardData, boardError, history]);

    const triggerCreatePost = (post) => {
        createPost({
            variables: {
                post: { boardId, ...post },
            },
        })
            .then(({ data }) => {
                const { id } = data.createPost;
                history.push(`/post/${id}`);
            })
            .catch(() => {
                message.error('게시물 등록 중 오류가 발생했습니다.');
            });
    };

    const handleFinish = (post) => {
        confirm({
            title: '게시물을 등록할까요?',
            icon: <FileAddOutlined style={{ color: 'dodgerblue' }} />,
            content: '악의적 성향의 글은 회원 정지의 원인이 될 수 있습니다.',
            okText: '게시물 등록',
            cancelText: '취소',
            onOk() {
                triggerCreatePost(post);
            },
        });
    };

    return (
        <Form onFinish={handleFinish}>
            {board.id && (
                <>
                    <PageTitle title={`글쓰기 - ${board.boardName}`} />
                    {parseInt(boardId) === 3 && <SelectCategory />}
                    <Form.Item
                        name="title"
                        rules={[{ required: true, message: '제목을 입력하세요.' }]}
                    >
                        <Input
                            name="title"
                            size="large"
                            placeholder="제목을 입력하세요"
                            autoFocus
                        />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        rules={[{ required: true, message: '내용을 입력하세요.' }]}
                    >
                        <TextArea
                            name="content"
                            placeholder="내용을 입력하세요"
                            className={classes.textarea}
                            rows={13}
                        />
                    </Form.Item>
                    <Form.Item>
                        <div className={classes.flexReverse}>
                            <Button type="submit" className={classes.button}>
                                글쓰기
                            </Button>
                        </div>
                    </Form.Item>
                </>
            )}
        </Form>
    );
}
