import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Colors from '../constants/Colors';

export default function ThemedBackground({ children }) {
    // Generate diagonal lines for "Diamond/Baklava" pattern
    // This creates a "Carbon Fiber" or "Tech Mesh" look
    const spacing = 30;
    const lines = [];
    // We need enough lines to cover the screen. Assuming max dim ~1000 for mobile
    // Diagonal length is roughly sqrt(w^2+h^2). 1500 is safe.
    // Lines / ( from top-left to bottom-right )
    for (let i = -1000; i < 1000; i += spacing) {
        lines.push(
            <Path
                key={`d1-${i}`}
                d={`M${i} -100 L${i + 1500} 1400`}
                stroke={Colors.dark.primary}
                strokeWidth="1"
                strokeOpacity="0.03" // Very subtle
            />
        );
    }
    // Lines \ ( from top-right to bottom-left )
    for (let i = -1000; i < 2000; i += spacing) {
        lines.push(
            <Path
                key={`d2-${i}`}
                d={`M${i} -100 L${i - 1500} 1400`}
                stroke={Colors.dark.primary}
                strokeWidth="1"
                strokeOpacity="0.03" // Very subtle
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Base Gradient Background */}
            <LinearGradient
                colors={['#1a1a1a', '#121212', '#000000']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Pattern Mesh */}
            <View style={styles.patternContainer} pointerEvents="none">
                <Svg height="100%" width="100%" style={styles.svg}>
                    {lines}
                </Svg>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Fallback
    },
    patternContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
        overflow: 'hidden',
    },
    svg: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
    }
});
