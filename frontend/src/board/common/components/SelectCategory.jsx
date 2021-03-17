import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { useStyles } from '../styles/board.style';
import { InputLabel, FormControl, Select, MenuItem } from '@material-ui/core';
import { GET_CATEGORIES } from '../../../configs/queries';

export default function SelectCategory({ boardId, value, setValue }) {
    const classes = useStyles();
    const [categories, setCategories] = useState([]);
    const { data: categoriesData, error: categoriesError } = useQuery(GET_CATEGORIES, {
        variables: {
            boardId,
        },
    });
    useEffect(() => {
        if (categoriesData) {
            setCategories(categoriesData.getCategoriesByBoardId);
        }
    }, [categoriesData, setCategories]);

    const handleChange = useCallback(
        (e) => {
            const { value } = e.target;
            setValue(value);
        },
        [setValue],
    );
    return (
        <>
            {categories.length > 0 && (
                <FormControl className={classes.formControl}>
                    <InputLabel>카테고리</InputLabel>
                    <Select value={value} onChange={handleChange}>
                        <MenuItem value="">전체</MenuItem>
                        {categories.map((c, idx) => (
                            <MenuItem value={c.categoryId} key={idx}>
                                {c.categoryName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </>
    );
}
