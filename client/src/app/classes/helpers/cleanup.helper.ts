// Inspired from: https://stackoverflow.com/questions/51752862/angular-unit-tests-are-leaking-styles
export const cleanStyles = (): void => {
    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < styles.length; i++) {
        head.removeChild(styles[i]);
    }
};
