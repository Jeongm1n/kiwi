import React from 'react';
import PageTitle from '../../../common/components/PageTitle';
import BoardListContainer from '../../common/containers/BoardListContainer';

export default function CommunityPage() {
    return (
        <>
            <PageTitle title="학과 공지" />
            <BoardListContainer boardId={1} />
        </>
    );
}
