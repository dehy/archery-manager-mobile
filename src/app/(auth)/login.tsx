import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { getApiUrl } from '@/api/config';
import { loginErrorMessage } from '@/auth/loginError';
import { useSession } from '@/auth/session';
import { CredentialFields } from '@/features/login/CredentialFields';
import { BUTTON, useLoginPalette } from '@/features/login/palette';
import { t } from '@/i18n';
import { Icon, Text, isIOS } from '@/ui';

const LOGO = {
  light: require('../../../assets/brand/logo-light.svg'),
  dark: require('../../../assets/brand/logo-dark.svg'),
};

const schema = z.object({
  email: z.email(t('login.emailInvalid')),
  password: z.string().min(1, t('login.passwordRequired')),
});
type Values = z.infer<typeof schema>;

/** Password reset and sign-up live on the club website, shown in an in-app browser sheet. */
const openWebPage = (path: string) =>
  WebBrowser.openBrowserAsync(`${getApiUrl()}${path}`).catch(() => {});

export default function LoginScreen() {
  const signIn = useSession((s) => s.signIn);
  const { palette, dark } = useLoginPalette();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(loginErrorMessage(e));
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={isIOS ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: isIOS ? 16 : 24 }}
        >
          <View style={{ alignItems: 'center', gap: 14, paddingTop: 96, paddingBottom: 48 }}>
            <Image
              source={dark ? LOGO.dark : LOGO.light}
              style={{ width: 248, height: 60 }}
              contentFit="contain"
              accessibilityLabel="Karkwa"
            />
            <Text style={{ fontSize: isIOS ? 17 : 16, textAlign: 'center', color: palette.muted }}>
              {t('login.tagline')}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: email }) => (
                <Controller
                  control={control}
                  name="password"
                  render={({ field: password }) => (
                    <CredentialFields
                      email={{
                        value: email.value,
                        onChangeText: email.onChange,
                        onBlur: email.onBlur,
                        error: errors.email?.message,
                      }}
                      password={{
                        value: password.value,
                        onChangeText: password.onChange,
                        onBlur: password.onBlur,
                        onSubmitEditing: onSubmit,
                        error: errors.password?.message,
                      }}
                    />
                  )}
                />
              )}
            />

            {error ? (
              <View
                accessible
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: palette.errorBackground,
                }}
              >
                <Icon name="alert" size={18} color={palette.errorText} />
                <Text style={{ flex: 1, fontSize: 15, color: palette.errorText }}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              testID="login-submit"
              accessibilityRole="button"
              accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
              onPress={onSubmit}
              disabled={isSubmitting}
              android_ripple={{ color: '#00000020' }}
              style={({ pressed }) => ({
                height: isIOS ? 52 : 48,
                borderRadius: isIOS ? 26 : 24,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: BUTTON.background,
                opacity: isIOS && pressed ? 0.8 : 1,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator color={BUTTON.text} />
              ) : (
                <Text style={{ fontSize: isIOS ? 17 : 15, fontWeight: '600', color: BUTTON.text }}>
                  {t('login.submit')}
                </Text>
              )}
            </Pressable>

            <Pressable
              testID="login-forgot"
              accessibilityRole="link"
              onPress={() => openWebPage('/reset-password')}
              style={{ alignSelf: 'center', padding: 10 }}
            >
              <Text style={{ fontSize: isIOS ? 15 : 14, fontWeight: '500', color: palette.link }}>
                {t('login.forgotPassword')}
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 'auto',
              paddingTop: 32,
              paddingBottom: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: isIOS ? 15 : 14, color: palette.muted }}>
              {t('login.noAccount')}
            </Text>
            <Pressable
              testID="login-register"
              accessibilityRole="link"
              onPress={() => openWebPage('/register')}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: isIOS ? 15 : 14, fontWeight: '600', color: palette.link }}>
                {t('login.createAccount')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
