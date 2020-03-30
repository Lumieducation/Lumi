import * as React from 'react';

import Avatar from '@material-ui/core/Avatar';

interface IProps {
    mainLibrary: string;
}

interface IComponentState {}

export default class H5PAvatar extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {};
    }

    public render(): JSX.Element {
        const { mainLibrary } = this.props;

        let source = '/assets/h5p/';

        switch (mainLibrary) {
            case 'H5P.Flashcards':
                source += 'flashcards-png-icon.png';
                break;

            case 'H5P.Accordion':
                source += 'accordion-icon.png';
                break;

            case 'H5P.Agamotto':
                source += 'icon_agamotto.png';
                break;

            case 'H5P.ArithmeticQuiz':
                source += 'basic-arithmetic-quiz-icon-color.png';
                break;

            case 'H5P.AudioRecorder':
                source += 'audio-recorder-icon_0.png';
                break;

            case 'H5P.Chart':
                source += 'chart-icon-color.png';
                break;

            case 'H5P.Collage':
                source += 'collage-icon.png';
                break;

            case 'H5P.Column':
                source += 'column-icon.png';
                break;

            case 'H5P.CoursePresentation':
                source += 'course_presentation_icon-colors_0.png';
                break;

            case 'H5P.Dialogcards':
                source += 'dialog_cards_icon-color.png';
                break;

            case 'H5P.DocumentationTool':
                source += 'documentation-tool-icon_0.png';
                break;

            case 'H5P.DragQuestion':
                source += 'drag-and-drop-icon.png';
                break;

            case 'H5P.DragText':
                source += 'drag-the-words-icon.png';
                break;

            case 'H5P.Essay':
                source += 'essay.png';
                break;

            case 'H5P.Blanks':
                source += 'fill-in-the-blanks-icon_0.png';
                break;

            case 'H5P.ImageMultipleHotspotQuestion':
                source += 'find-multiple-hotspots.png';
                break;

            case 'H5P.ImageHotspotQuestion':
                source += 'image_hotspot-question-icon_0.png';
                break;

            case 'H5P.GuessTheAnswer':
                source += 'guess-the-answer-icon.png';
                break;

            case 'H5P.ImageHotspots':
                source += 'image-hotspots-icon-color.png';
                break;

            case 'H5P.ImageJuxtaposition':
                source += 'before-after-image.png';
                break;

            case 'H5P.ImagePair':
                source += 'image-pairing.png';
                break;

            case 'H5P.ImageSequencing':
                source += 'image-sequnce.png';
                break;

            case 'H5P.ImageSlider':
                source += 'pictusel-h5p-org.png';
                break;

            case 'H5P.ImpressPresentation':
                source += 'impressive-presentation-iconr.png';
                break;

            case 'H5P.InteractiveVideo':
                source += 'interactive_video_icon-colors_0.png';
                break;

            case 'H5P.MarkTheWords':
                source += 'mark-the-words-icon_0.png';
                break;

            case 'H5P.MemoryGame':
                source += 'memory-game-icon.png';
                break;

            case 'H5P.MultiChoice':
                source += 'multichoice-icon_0.png';
                break;

            case 'H5P.PersonalityQuiz':
                source += 'personality-quiz-icon.png';
                break;

            case 'H5P.Questionnaire':
                source += 'survey-icon-h5p-org.png';
                break;

            case 'H5P.QuestionSet':
                source += 'question-set-icon.png';
                break;

            case 'H5P.SingleChoiceSet':
                source += 'single-choice-set-icon_0.png';
                break;

            case 'H5P.SpeakTheWords':
                source += 'speak-the-words.png';
                break;

            case 'H5P.SpeakTheWordsSet':
                source += 'speak-the-words-set.png';
                break;

            case 'H5P.Summary':
                source += 'summary_icon.png';
                break;

            case 'H5P.Timeline':
                source += 'timeline_icon-color.png';
                break;

            case 'H5P.TrueFalse':
                source += 'true-false.png';
                break;

            default:
                source += 'h5p.png';
        }
        return <Avatar src={source} />;
    }
}
