import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    upIcon: {
        fontSize: 15,
        color: theme.palette.primary.main,
        cursor: 'pointer',
    },
    commentChip: {
        marginTop: 10,
        background: 'white',
    },
    commentField: {
        background: 'white',
        border: '1px solid #ddd',
        paddingLeft: 10,
        marginBottom: 5,
    },
    comment: {
        marginBottom: 5,
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
}));
