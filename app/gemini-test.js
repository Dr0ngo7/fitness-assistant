import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { askGemini } from '../services/gemini';

export default function GeminiTest() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setResponse('');
        try {
            const result = await askGemini(prompt);
            setResponse(result);
        } catch (error) {
            setResponse("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gemini Test' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.header}>Gemini AI Test</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Sorunuzu yazın:</Text>
                        <TextInput
                            style={styles.input}
                            value={prompt}
                            onChangeText={setPrompt}
                            placeholder="Örn: Protein ağırlıklı bir kahvaltı önerisi ver"
                            placeholderTextColor="#888"
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>AI'a Sor</Text>
                        )}
                    </TouchableOpacity>

                    {response ? (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultLabel}>Cevap:</Text>
                            <Text style={styles.resultText}>{response}</Text>
                        </View>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#444',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#a0c4ff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    resultText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
});
