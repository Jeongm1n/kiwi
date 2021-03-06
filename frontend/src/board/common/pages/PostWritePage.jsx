import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import QueryString from 'query-string';
import { Button } from '@material-ui/core';
import { Button as AntdButton, Space } from 'antd';
import { Form, Input, message, Modal, Upload } from 'antd';
import PageTitle from '../../../common/components/PageTitle';
import SelectCategory from '../components/SelectCategory';
import { useStyles } from '../styles/postWrite.style';
import { boardCommonStyles } from '../styles/board.common.style';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { CREATE_POST, GET_BOARD, GET_LOCAL_IS_SPECIAL_TYPE } from '../../../configs/queries';
import { FileAddOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import { CONTENT_FILE_UPLOAD_MAX_COUNT } from '../../../configs/variables';
import axios from 'axios';

const { confirm } = Modal;
const { TextArea } = Input;

export default function PostWritePage() {
    const classes = { ...useStyles(), ...boardCommonStyles() };
    const { search } = useLocation();
    const history = useHistory();
    const { boardId } = QueryString.parse(search);
    const [board, setBoard] = useState({
        id: null,
        boardName: '',
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [fileList, setFileList] = useState([]);
    const { data: boardData, error: boardError } = useQuery(GET_BOARD, {
        variables: {
            id: boardId,
        },
    });
    const { data: isSpecialTypeData } = useQuery(GET_LOCAL_IS_SPECIAL_TYPE);
    const [createPost] = useMutation(CREATE_POST);

    useEffect(() => {
        if (isSpecialTypeData) {
            const { isSpecialType } = isSpecialTypeData;
            board.isSpecial && !isSpecialType && history.push('/');
        }
    }, [isSpecialTypeData, history, board.isSpecial]);

    useEffect(() => {
        if (boardData) {
            setBoard(boardData.getBoardById);
        }
        if (boardError) {
            message.error('???????????? ?????? ??????????????????.');
            history.push('/');
        }
    }, [boardData, boardError, history]);

    const triggerCreatePost = (post) => {
        createPost({
            variables: {
                post: { boardId: board.id, ...post, categoryId: selectedCategoryId },
            },
        })
            .then(({ data }) => {
                const { id: postId } = data.createPost;
                // ?????? ?????????
                if (fileList.length > 0) {
                    const formData = new FormData();
                    fileList.forEach((file) => {
                        formData.append('files', file);
                    });
                    formData.append('postId', postId);
                    axios
                        .post('/api/files/uploadS3', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })
                        .then(({ data }) => {
                            const { result } = data;
                            history.push(`/post/${result.id}`);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else {
                    history.push(`/post/${postId}`);
                }
            })
            .catch(() => {
                message.error('????????? ?????? ??? ????????? ??????????????????.');
            });
    };

    const handleFinish = (post) => {
        confirm({
            title: '???????????? ????????????????',
            icon: <FileAddOutlined style={{ color: 'dodgerblue' }} />,
            content: '????????? ????????? ?????? ?????? ????????? ????????? ??? ??? ????????????.',
            okText: '????????? ??????',
            cancelText: '??????',
            onOk() {
                triggerCreatePost(post);
            },
        });
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('2MB ?????? ????????? ????????? ???????????? ??? ????????????.');
                return;
            }
            if (fileList.length >= CONTENT_FILE_UPLOAD_MAX_COUNT) {
                return;
            }
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };

    return (
        <Form onFinish={handleFinish}>
            {board.id && (
                <>
                    <PageTitle title={`????????? - ${board.boardName}`} />
                    <div className={classes.itemWrapper}>
                        <SelectCategory
                            boardId={boardId}
                            value={selectedCategoryId}
                            setValue={setSelectedCategoryId}
                            isWrite
                        />
                    </div>
                    <Form.Item
                        name="title"
                        rules={[{ required: true, message: '????????? ???????????????.' }]}
                    >
                        <Input
                            name="title"
                            size="large"
                            placeholder="????????? ???????????????"
                            autoFocus
                            maxLength={25}
                        />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        rules={[{ required: true, message: '????????? ???????????????.' }]}
                    >
                        <TextArea
                            name="content"
                            placeholder="????????? ???????????????"
                            className={classes.textarea}
                            rows={13}
                        />
                    </Form.Item>

                    <div className={classes.itemWrapper}>
                        <Upload {...uploadProps}>
                            <Space>
                                <AntdButton
                                    icon={<UploadOutlined />}
                                    disabled={fileList.length >= CONTENT_FILE_UPLOAD_MAX_COUNT}
                                >
                                    ??????/?????? ?????????
                                </AntdButton>
                                {fileList.length === CONTENT_FILE_UPLOAD_MAX_COUNT && (
                                    <span className={classes.warningText}>
                                        3????????? ???????????? ??? ????????????.
                                    </span>
                                )}
                            </Space>
                        </Upload>
                    </div>

                    <Form.Item>
                        <div className={classes.flexReverse}>
                            <Button type="submit" className={classes.button} size="small">
                                ?????????
                            </Button>
                        </div>
                    </Form.Item>
                </>
            )}
        </Form>
    );
}
