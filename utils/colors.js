// Color Utilities
export const Colors = {
    BLUE: '#089BDF',
    GREEN: 'hsl(120, 70%, 60%)',
    GREEN_LIGHT: 'hsl(120, 70%, 80%)',
    GREEN_DARK: 'hsl(120, 70%, 40%)',
    GRAY: '#333',
    WHITE: '#fff'
};

export class ColorUtils {
    static audioToColor(audioLevel, baseColor = Colors.BLUE) {
        if (baseColor === Colors.BLUE) {
            return Colors.BLUE;
        }
        
        if (baseColor.includes('hsl')) {
            const lightness = 40 + (audioLevel * 40);
            return baseColor.replace(/\d+%/, `${lightness}%`);
        }
        
        return baseColor;
    }

    static getGradientColor(audioLevel, startColor, endColor) {
        const intensity = Math.min(audioLevel, 1);
        return `linear-gradient(${startColor}, ${endColor})`;
    }

    static getAudioReactiveColor(audioLevel, frequency, maxFrequency) {
        const hue = (frequency / maxFrequency) * 300;
        const saturation = 70;
        const lightness = 40 + (audioLevel * 40);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}
