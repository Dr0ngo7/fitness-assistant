export const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Geçersiz e-posta adresi formatı.';
        case 'auth/user-not-found':
            return 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.';
        case 'auth/wrong-password':
            return 'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.';
        case 'auth/invalid-credential':
            return 'Giriş bilgileri geçersiz.';
        case 'auth/email-already-in-use':
            return 'Bu e-posta adresi zaten kullanımda.';
        case 'auth/weak-password':
            return 'Şifre çok zayıf. En az 6 karakter olmalı.';
        case 'auth/too-many-requests':
            return 'Çok fazla başarısız giriş denemesi. Lütfen bir süre sonra tekrar deneyin.';
        case 'auth/network-request-failed':
            return 'İnternet bağlantınızı kontrol edin.';
        default:
            return 'Bir hata oluştu. Lütfen tekrar deneyin. (' + errorCode + ')';
    }
};
