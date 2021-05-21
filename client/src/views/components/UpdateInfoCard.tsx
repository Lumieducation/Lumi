import React from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { CardHeader } from '@material-ui/core';

export default function UpdateInfoCard(props: {
    releaseName: string;
    releaseNotes: string;
    releaseDate: string;
    updateCallback: () => void;
}) {
    const { t } = useTranslation();
    const { releaseName, releaseNotes, releaseDate, updateCallback } = props;

    return (
        <Card>
            <CardHeader title={releaseName} subheader={releaseDate} />

            <CardContent>
                <div dangerouslySetInnerHTML={{ __html: releaseNotes }} />
            </CardContent>

            <CardActions>
                <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={updateCallback}
                >
                    {t('updates.restartAndInstall')}
                </Button>
            </CardActions>
        </Card>
    );
}
