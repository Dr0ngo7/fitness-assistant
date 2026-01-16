import React, { useState, useRef, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { askGemini } from '../services/gemini';

export default function PlanChatModal({ visible, onClose, planData, userGoal, onUpdatePlan }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef();

    // Reset chat when modal opens for a new plan, but keep history if same plan?
    // For simplicity, we keep history. You might want to clear it if planData changes significantly.

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Context Engineering
            const contextPrompt = `
        You are the fitness trainer who created this plan.
        
        THE PLAN (JSON):
        ${JSON.stringify(planData)}
        
        USER GOAL: ${userGoal || 'General Fitness'}

        USER QUESTION: "${userMsg.text}"

        INSTRUCTIONS:
        1. Answer ONLY what the user asked. 
        2. Be extremely concise (1-2 sentences) unless asked for a detailed explanation.
        3. Do not summarize the plan or offer unrequested advice.
        4. If the user just says "test" or "hello", reply briefly like "Hazırım, sorunu bekliyorum."
        5. Speak in Turkish.

        PLAN UPDATES:
        If the user explicitly asks to CHANGE, UPDATE, or MODIFY the plan (e.g., "Add Bench Press to Monday", "Make it 4 days"), you MUST:
        1. Reply with a confirmation message in Turkish.
        2. AND include a STRICT JSON block at the end of your response with the FULL updated "week_plan" array.
        
        JSON FORMAT FOR UPDATES:
        \`\`\`json
        {
          "week_plan": [ ...full updated plan arrays... ]
        }
        \`\`\`
      `;

            const responseText = await askGemini(contextPrompt);

            // JSON Parser Logic
            let finalResponse = responseText;
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);

            if (jsonMatch && jsonMatch[1]) {
                try {
                    const jsonContent = JSON.parse(jsonMatch[1]);
                    if (jsonContent.week_plan && onUpdatePlan) {
                        onUpdatePlan(jsonContent.week_plan);
                        finalResponse = responseText.replace(/```json[\s\S]*?```/, "").trim();
                        finalResponse += "\n\n✅ Plan güncellendi!";
                    }
                } catch (e) {
                    console.error("JSON Parse Error in Chat:", e);
                }
            }

            setMessages(prev => [...prev, { role: "ai", text: finalResponse }]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, { role: "ai", text: "Üzgünüm, bir hata oluştu." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>AI Antrenör</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Chat Area */}
                    <ScrollView
                        style={styles.chatContainer}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ref={ref => ref?.scrollToEnd({ animated: true })}
                    >
                        {messages.length === 0 && (
                            <View style={styles.welcomeContainer}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                                <Text style={styles.welcomeText}>
                                    Bu program hakkında merak ettiğin her şeyi sorabilirsin.
                                    {"\n\n"}Örn: "Neden 3 set yapıyoruz?", "Bu hareket nereyi çalıştırır?"
                                </Text>
                            </View>
                        )}

                        {messages.map((msg, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.messageBubble,
                                    msg.role === 'user' ? styles.userBubble : styles.aiBubble
                                ]}
                            >
                                <Text style={[
                                    styles.messageText,
                                    msg.role === 'user' ? styles.userText : styles.aiText
                                ]}>
                                    {msg.text}
                                </Text>
                            </View>
                        ))}

                        {loading && (
                            <View style={styles.loadingBubble}>
                                <ActivityIndicator size="small" color="#666" />
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Bir soru sor..."
                            placeholderTextColor="#999"
                            returnKeyType="send"
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                            onPress={sendMessage}
                            disabled={!input.trim() || loading}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    closeBtn: { padding: 4 },

    chatContainer: { flex: 1, padding: 16 },

    welcomeContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
    welcomeText: { textAlign: 'center', color: '#888', marginTop: 10, lineHeight: 22 },

    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
    loadingBubble: { alignSelf: 'flex-start', padding: 12, backgroundColor: '#f0f0f0', borderRadius: 16 },

    messageText: { fontSize: 16, lineHeight: 22 },
    userText: { color: '#fff' },
    aiText: { color: '#333' },

    inputContainer: {
        flexDirection: 'row', padding: 12, backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center'
    },
    input: {
        flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100
    },
    sendBtn: {
        marginLeft: 10, width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center'
    },
    sendBtnDisabled: { backgroundColor: '#ccc' }
});
