import React from 'react';
import {
    Modal, View, Text, TouchableOpacity, FlatList,
    Image, StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExerciseSelectionModal({ visible, candidates, onSelect, onClose }) {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    <View style={styles.header}>
                        <Text style={styles.title}>Bunu mu demek istediniz?</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        Aradığınız egzersiz tam eşleşmedi, ancak veritabanında şunları bulduk:
                    </Text>

                    <FlatList
                        data={candidates}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                                {item.thumb ? (
                                    <Image source={{ uri: item.thumb }} style={styles.thumb} />
                                ) : (
                                    <View style={[styles.thumb, styles.placeholderThumb]}>
                                        <Ionicons name=" barbell-outline" size={24} color="#ccc" />
                                    </View>
                                )}
                                <View style={styles.info}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.group}>{item.group.toUpperCase()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    />

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, height: '70%', paddingBottom: 40
    },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    closeBtn: { padding: 4 },

    subtitle: { color: '#666', marginBottom: 15, fontSize: 14 },

    listContent: { gap: 10 },
    item: {
        flexDirection: 'row', alignItems: 'center', padding: 10,
        borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#f9f9f9'
    },
    thumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
    placeholderThumb: { justifyContent: 'center', alignItems: 'center' },

    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: '#333' },
    group: { fontSize: 12, color: '#888', marginTop: 2 }
});
