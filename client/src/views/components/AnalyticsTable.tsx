import React from 'react';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import type { IInteraction } from '@lumieducation/xapi-aggregator';
import { useTranslation } from 'react-i18next';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export function get_grade_color(grade: number) {
    grade = Math.ceil(grade / 5) * 5;
    return clsx({
        '#2ecc71': grade >= 85,
        '#27ae60': grade >= 70 && grade < 85,
        '#f1c40e': grade >= 55 && grade < 70,
        '#e67e21': grade >= 40 && grade < 55,
        '#e74c3c': grade >= 25 && grade < 40,
        '#c0392b': grade < 25
    });
}

const useStyles = makeStyles({
    table: {
        minWidth: 650
    }
});

export interface IUser {
    id: string;
    name: string;
    results: number[];
}

export type { IInteraction } from '@lumieducation/xapi-aggregator';

const LumixAPIViewer = (props: {
    interactions: IInteraction[];
    users: IUser[];
}) => {
    const { interactions, users } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    let userAverage: number[] = [];
    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>{t('analytics.name')}</TableCell>
                        {interactions.map((interaction) => (
                            <TableCell>
                                {interaction.title || interaction.name}
                            </TableCell>
                        ))}
                        <TableCell></TableCell>
                        <TableCell>{t('analytics.average')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell></TableCell>
                        {interactions.map((interaction, index) => {
                            const average =
                                (users
                                    .map((user) => user.results[index])
                                    .reduce((p, c) => p + c, 0) /
                                    users.length) *
                                100;
                            userAverage.push(average);
                            return (
                                <TableCell
                                    align="center"
                                    style={{
                                        backgroundColor:
                                            get_grade_color(average)
                                    }}
                                >{`${average.toFixed(0)} %`}</TableCell>
                            );
                        })}
                        <TableCell></TableCell>
                        <TableCell
                            align="center"
                            style={{
                                backgroundColor: get_grade_color(
                                    userAverage.reduce((p, c) => p + c, 0) /
                                        userAverage.length
                                )
                            }}
                        >
                            {`${(
                                userAverage.reduce((p, c) => p + c, 0) /
                                userAverage.length
                            ).toFixed(0)}
                            %`}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                    </TableRow>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell component="th" scope="row">
                                {user.name}
                            </TableCell>
                            {user.results.map((result) => (
                                <TableCell
                                    align="center"
                                    style={{
                                        backgroundColor: get_grade_color(
                                            result * 100
                                        )
                                    }}
                                >
                                    {`${(result * 100).toFixed(0)} %`}
                                </TableCell>
                            ))}
                            <TableCell />
                            <TableCell
                                align="center"
                                style={{
                                    backgroundColor: get_grade_color(
                                        (user.results.reduce(
                                            (p, c) => p + c,
                                            0
                                        ) /
                                            user.results.length) *
                                            100
                                    )
                                }}
                            >
                                {`${(
                                    (user.results.reduce((p, c) => p + c, 0) /
                                        user.results.length) *
                                    100
                                ).toFixed(0)} %`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LumixAPIViewer;
