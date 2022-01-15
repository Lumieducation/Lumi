/**
 * Sets default width limits for all known content types
 */
export const getDefaultContentTypeWidth = (mainLibrary: string): number => {
    const machineName = mainLibrary.substr(0, mainLibrary.indexOf(' '));
    switch (machineName) {
        case 'H5P.Audio':
        case 'H5P.AudioRecorder':
        case 'H5P.Column':
        case 'H5P.Dialogcards':
        case 'H5P.GreetingCard':
        case 'H5P.KewarCode':
            return 800;

        case 'H5P.Accordion':
        case 'H5P.AdvancedBlanks':
        case 'H5P.AdventCalendar':
        case 'H5P.Agamotto':
        case 'H5P.Bingo':
        case 'H5P.Blanks':
        case 'H5P.Chart':
        case 'H5P.Collage':
        case 'H5P.Cornell':
        case 'H5P.Crossword':
        case 'H5P.Dictation':
        case 'H5P.DocumentationTool':
        case 'H5P.DragText':
        case 'H5P.Essay':
        case 'H5P.FacebookFeedPage':
        case 'H5P.FindTheWords':
        case 'H5P.GuessTheAnswer':
        case 'H5P.ImagePair':
        case 'H5P.InteractiveBook':
        case 'H5P.MarkTheWords':
        case 'H5P.MemoryGame':
        case 'H5P.MultiChoice':
        case 'H5P.PersonalityQuiz':
        case 'H5P.PickTheSymbols':
        case 'H5P.Questionnaire':
        case 'H5P.QuestionSet':
        case 'H5P.SingleChoiceSet':
        case 'H5P.SortParagraphs':
        case 'H5P.SpeakTheWords':
        case 'H5P.SpeakTheWordsSet':
        case 'H5P.Summary':
        case 'H5P.TrueFalse':
        case 'H5P.TwitterUserFeed':
            return 1100;

        case 'H5P.ArithmeticQuiz':
        case 'H5P.ArScavenger':
        case 'H5P.BranchingScenario':
        case 'H5P.CoursePresentation':
        case 'H5P.DragQuestion':
        case 'H5P.Flashcards':
        case 'H5P.ImageHotspotQuestion':
        case 'H5P.ImageHotspots':
        case 'H5P.ImageJuxtaposition':
        case 'H5P.ImageMultipleHotspotQuestion':
        case 'H5P.ImageSequencing':
        case 'H5P.ImageSlider':
        case 'H5P.ImpressivePresentation':
        case 'H5P.InteractiveVideo':
        case 'H5P.MultiMediaChoice':
        case 'H5P.ThreeImage':
        case 'H5P.Timeline':
            return 1400;

        default:
            return 1100;
    }
};
