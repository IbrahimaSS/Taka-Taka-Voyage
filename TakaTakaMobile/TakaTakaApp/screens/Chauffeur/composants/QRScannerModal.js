import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function QRScannerModal({ visible, onClose, onScan, theme }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible && !permission?.granted) {
            requestPermission();
        }
        if (visible) {
            setScanned(false);
        }
    }, [visible]);

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        setScanned(true);
        console.log(`✅ [SCAN] QR Code scanné: ${data}`);
        onScan(data);
    };

    if (!permission) {
        return (
            <Modal visible={visible} transparent animationType="slide">
                <View style={s.container}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            </Modal>
        );
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} transparent animationType="slide">
                <View style={[s.container, { backgroundColor: '#000' }]}>
                    <Ionicons name="camera-reverse-outline" size={64} color="#FFF" />
                    <Text style={s.permissionText}>L'accès à la caméra est requis pour scanner le ticket.</Text>
                    <TouchableOpacity style={s.btn} onPress={requestPermission}>
                        <Text style={s.btnText}>Autoriser la caméra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btn, { backgroundColor: 'transparent' }]} onPress={onClose}>
                        <Text style={s.btnText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={s.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
                
                {/* Overlay design */}
                <View style={s.overlay}>
                    <View style={s.topPanel}>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                            <BlurView intensity={30} style={s.blurCircle}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </BlurView>
                        </TouchableOpacity>
                        <Text style={s.title}>Scanner le Ticket</Text>
                    </View>

                    <View style={s.centerPanel}>
                        <View style={s.scanFrame}>
                            <View style={[s.corner, s.topLeft]} />
                            <View style={[s.corner, s.topRight]} />
                            <View style={[s.corner, s.bottomLeft]} />
                            <View style={[s.corner, s.bottomRight]} />
                        </View>
                        <Text style={s.hint}>Placez le QR Code dans le cadre</Text>
                    </View>

                    <View style={s.bottomPanel}>
                        <BlurView intensity={20} style={s.infoCard}>
                            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
                            <Text style={s.infoText}>Le scan validera automatiquement votre arrivée et informera le passager.</Text>
                        </BlurView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    permissionText: {
        color: '#FFF',
        textAlign: 'center',
        margin: 20,
        fontSize: 16,
    },
    btn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 10,
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    topPanel: {
        paddingTop: 50,
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    blurCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    title: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    centerPanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: width * 0.7,
        height: width * 0.7,
        borderWidth: 0,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#10B981',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 20,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 20,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 20,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 20,
    },
    hint: {
        color: '#FFF',
        marginTop: 30,
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bottomPanel: {
        paddingBottom: 50,
        paddingHorizontal: 30,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        gap: 12,
        overflow: 'hidden',
    },
    infoText: {
        color: '#FFF',
        fontSize: 13,
        flex: 1,
        opacity: 0.9,
    }
});
